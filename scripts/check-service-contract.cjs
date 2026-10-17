/* Characterization of the existing public service contract; no live requests. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { File } = require('node:buffer');
const ts = require('../yuhui-web/node_modules/typescript');
const root = path.resolve(__dirname, '..');
const fixturePath = path.join(root, 'verification/internal-refactor/service-contract.json');
const record = process.argv.includes('--record');
const file = record ? '.runtime/refactor-baseline/api.ts' : 'yuhui-web/src/services/api.ts';
const payloads = [
  '{"code":1000,"data":{"id":1989345533881966594,"negative":-1989345533881966594,"items":[1989345533881966594,12],"url":"https://example.invalid/a"}}',
  '{"code":2010,"message":"重复领取","data":null}',
  '{"broken":', 'null', '', { code: 1000, data: ['already decoded'] },
];

function normalize(value) {
  if (value === undefined) return { $undefined: true };
  if (value instanceof FormData) return { $form: [...value].map(([k, v]) => [k, typeof v === 'string' ? v : { name: v.name, type: v.type, size: v.size }]) };
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v)]));
  return value;
}

function loadServices(host, token) {
  const calls = [];
  const cache = new Map();
  let reject = false;
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = fs.readFileSync(filename, 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const requireMock = (name) => {
      if (name === '@umijs/max') return { request: async (url, options) => {
        const { transformResponse, ...rest } = options;
        const transformed = payloads.map(input => transformResponse.reduce((v, fn) => fn(v), input));
        calls.push(normalize({ url, options: rest, transformed }));
        if (reject) throw new Error('synthetic transport failure');
        return { data: transformed[0] };
      } };
      if (name === '@/utils/auth') return { getAuthToken: () => token };
      if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), name + '.ts'));
      throw new Error(`Unexpected import: ${name}`);
    };
    vm.runInNewContext(js, { exports: module.exports, module, require: requireMock, process: { env: { UMI_APP_API_HOST: host } }, FormData, File, encodeURIComponent }, { filename });
    return module.exports;
  }
  return { api: load(path.join(root, file)), calls, fail: () => { reject = true; } };
}

function argsFor(name, empty) {
  if (name === 'user_profile_avatar') return [new File(['avatar'], 'avatar.png', { type: 'image/png' })];
  if (name === 'upload') { const form = new FormData(); form.append('description', 'test'); return [form]; }
  if (empty === null) return [{ userId: '1989345533881966594', activityId: '1989345533881966594', id: '1989345533881966594', ruleValue: '0', enabled: 0, ruleModels: null }, { enabled: 0, roleIds: ['role-1'], configJson: '{}' }, ['permission-1'], '用户甲'];
  return empty ? [] : ['中 文/&?=1989345533881966594', { id: '1989345533881966594', enabled: 0, ruleModels: null }, 0, '用户甲'];
}

(async () => {
  const observations = [];
  for (const [host, token] of [['', ''], ['https://example.invalid', 'synthetic token/&']]) {
    const { api, calls, fail } = loadServices(host, token);
    for (const name of Object.keys(api).sort()) {
      for (const empty of [true, false, null]) {
        calls.length = 0;
        const args = argsFor(name, empty);
        const value = await api[name](...args);
        observations.push({ name, host, token, empty, value: normalize(value), calls: [...calls] });
      }
    }
    fail();
    for (const [name, fn] of Object.entries(api)) {
      if (name.includes('authorize_url')) continue;
      await assert.rejects(() => fn(...argsFor(name, false)), /synthetic transport failure/, name);
    }
  }
  if (record) fs.writeFileSync(fixturePath, '[\n' + observations.map(value => JSON.stringify(value)).join(',\n') + '\n]\n');
  else assert.deepEqual(JSON.parse(JSON.stringify(observations)), JSON.parse(fs.readFileSync(fixturePath, 'utf8')));
  console.log(JSON.stringify({ result: 'PASS', exports: new Set(observations.map(v => v.name)).size, requestCases: observations.length, responseVariants: payloads.length, rejectedTransport: 'all HTTP exports' }));
})().catch(error => { console.error(error); process.exitCode = 1; });
