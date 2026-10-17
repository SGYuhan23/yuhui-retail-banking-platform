const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../yuhui-web/node_modules/typescript');
function load(filename) {
  if (filename.endsWith('.json')) return JSON.parse(fs.readFileSync(filename, 'utf8'));
  const module = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, URL, Date, require: name => load(path.resolve(path.dirname(filename), name.endsWith('.json') ? name : name + '.ts')) });
  return module.exports;
}
const { initialState, execute, resources } = load(path.resolve(__dirname, '../yuhui-web/src/demo/engine.ts'));
const checks = [];
const test = (name, fn) => { fn(); checks.push(name); };
let state = initialState(), now = new Date('2026-10-17T04:00:00Z');
const activityId = state.tables.activity[0].id, userId = '10002';
const invoke = (route, body = {}, random = () => .31, method = 'POST') => {
  const previous = JSON.stringify(state);
  const result = execute(state, method, route, { activityId, userId, ...body }, now, random);
  assert.equal(JSON.stringify(state), previous, 'pure execution must not mutate source state');
  state = result.state; return result.reply;
};
const success = r => { assert.equal(r.code, 1000, r.message); return r.data; };
test('fresh account has zero quota and credit', () => {
  assert.equal(success(invoke('/activity/query_user_activity_account')).totalCountSurplus, 0);
  assert.equal(success(invoke('/activity/query_user_credit_account')), 0);
});
test('signup grants quota and points once', () => {
  success(invoke('/activity/calendar_sign_rebate'));
  assert.equal(success(invoke('/activity/query_user_credit_account')), 5);
  assert.equal(success(invoke('/activity/query_user_activity_account')).totalCountSurplus, 1);
  assert.equal(invoke('/activity/calendar_sign_rebate').code, 1005);
});
test('gift grant is idempotent', () => {
  const gift = state.tables.behavior.find(x => x.behaviorType === 'activity_gift');
  success(invoke('/activity/add_lottery_quota', { behaviorRebateId: gift.id }));
  assert.equal(invoke('/activity/add_lottery_quota', { behaviorRebateId: gift.id }).code, 2010);
});
test('insufficient points cannot change stock or balances', () => {
  const before = JSON.stringify(state);
  assert.equal(invoke('/activity/credit_pay_exchange_sku', { sku: state.tables.activity_sku[0].id }).code, 1013);
  assert.equal(JSON.stringify(state), before);
});
test('draw uses configured weights and creates an owned wallet benefit', () => {
  const result = success(invoke('/activity/draw'));
  assert.equal(result.awardTitle, '便民生活券 · 1张');
  assert.equal(state.wallet.length, 1);
  assert.equal(state.tables.user_order.length, 1);
  assert.equal(state.tables.user_award_record.length, 1);
});
test('wallet rejects forged ids and duplicate use', () => {
  assert.equal(invoke('/local/wallet/redeem', { orderId: 'bad' }).code, 4000);
  const owned = state.wallet[0].id;
  state.wallet.push({ id: '42', userId: 'another-user', redeemedAt: null });
  assert.equal(invoke('/local/wallet/redeem', { orderId: '42' }).code, 4001);
  success(invoke('/local/wallet/redeem', { orderId: owned }));
  assert.equal(invoke('/local/wallet/redeem', { orderId: owned }).code, 4001);
});
test('DCC downgrade blocks draw without spending quota', () => {
  success(invoke('/dcc/update_config', { key: 'degradeSwitch', value: 'open' }));
  const before = JSON.stringify(state);
  assert.equal(invoke('/activity/draw').code, 1014);
  assert.equal(JSON.stringify(state), before);
  success(invoke('/dcc/update_config', { key: 'degradeSwitch', value: 'close' }));
});
test('rate limit rejects an immediate repeat', () => assert.equal(invoke('/activity/draw').code, 1015));
test('locked award resolves through configured fallback tree', () => {
  now = new Date(now.getTime() + 2000);
  assert.equal(success(invoke('/activity/draw', {}, () => .999)).awardTitle, '谢谢参与');
});
test('spent quota rejects additional draws', () => {
  now = new Date(now.getTime() + 2000);
  assert.equal(invoke('/activity/draw').code, 1009);
});
test('new day supports another sign-in', () => {
  now = new Date(now.getTime() + 86400000); success(invoke('/activity/calendar_sign_rebate'));
  assert.equal(success(invoke('/activity/query_user_credit_account')), 10);
  now = new Date(now.getTime() + 86400000); success(invoke('/activity/calendar_sign_rebate'));
});
test('exchange updates quota, stock and points together', () => {
  const sku = state.tables.activity_sku[0], stock = sku.stockCountSurplus;
  success(invoke('/activity/credit_pay_exchange_sku', { sku: sku.id }));
  assert.equal(success(invoke('/activity/query_user_credit_account')), 0);
  assert.equal(state.tables.activity_sku[0].stockCountSurplus, stock - 1);
});
test('failing multi-rebate sign rolls back all prior grants', () => {
  const clean = initialState();
  clean.tables.activity_sku[0].stockCountSurplus = 0;
  const before = JSON.stringify(clean);
  const result = execute(clean, 'POST', '/activity/calendar_sign_rebate', { activityId, userId }, now);
  assert.equal(result.reply.code, 1008); assert.equal(JSON.stringify(result.state), before);
});
for (const [collection, command] of Object.entries(resources)) test(`CRUD ${collection} survives serialization`, () => {
  const template = state.tables[collection][0];
  const key = success(invoke(`/erp/${collection}/add_${command}`, { ...template, id: undefined }));
  success(invoke(`/erp/${collection}/update_${command}`, { id: key, testLabel: 'updated' }));
  state = JSON.parse(JSON.stringify(state));
  assert.equal(success(invoke(`/erp/${collection}/query_${command}`, {}, undefined, 'GET')).find(x => x.id === key).testLabel, 'updated');
  success(invoke(`/erp/${collection}/delete_${command}/${key}`));
  assert.equal(state.tables[collection].some(x => x.id === key), false);
});
test('history pagination and all seven ledgers are connected', () => {
  const history = success(invoke('/activity/query_my_award_record?pageNum=1&pageSize=1', {}, undefined, 'GET'));
  assert.equal(history.items.length, 1); assert.equal(history.total, 2);
  for (const name of ['activity_account','activity_record','credit_account','credit_record','user_order','user_award_record','user_behavior_rebate_order']) assert.ok(success(invoke(`/erp/query_${name}`, {}, undefined, 'GET')).length > 0);
});
test('closed and out-of-date activity rejects draw atomically', () => {
  const closed = initialState(); closed.tables.activity[0].state = 'close';
  assert.equal(execute(closed,'POST','/activity/draw',{activityId,userId},now).reply.code,1006);
  closed.tables.activity[0].state = 'open';
  assert.equal(execute(closed,'POST','/activity/draw',{activityId,userId},new Date('2030-01-01')).reply.code,1007);
});
test('unknown endpoints fail explicitly', () => assert.equal(invoke('/does-not-exist').code, 4040));
console.log(JSON.stringify({ result: 'PASS', checks: checks.length, names: checks }, null, 2));
