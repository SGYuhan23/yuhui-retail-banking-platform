import seed from './seed.json';

type Row = Record<string, any>;
export type Reply = { code: number; message: string; data?: any };
export type DemoState = {
  version: 1; sequence: number; tables: Record<string, Row[]>;
  claims: string[]; dcc: Record<string, string>; wallet: Row[];
  lastDraw: Record<string, number>;
};
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const ok = (data?: any): Reply => ({ code: 1000, message: '成功', data });
const fail = (code: number, message: string): Reply => ({ code, message });
export const resources: Record<string, string> = {
  activity: 'activity', activity_count: 'activity_count', activity_sku: 'activity_sku',
  award: 'award', behavior: 'behavior', rule: 'rule', 'rule/tree': 'rule_tree',
  'rule/tree/node': 'rule_tree_node', 'rule/tree/node/line': 'rule_tree_node_line',
  strategy: 'strategy', 'strategy/award': 'strategy_award',
};
const ledgers = ['activity_account', 'activity_record', 'credit_account', 'credit_record', 'user_order', 'user_award_record', 'user_behavior_rebate_order'];
export function initialState(): DemoState {
  const tables: Record<string, Row[]> = clone(seed);
  for (const name of ledgers) tables[name] = [];
  return { version: 1, sequence: 0, tables, claims: [], wallet: [], lastDraw: {}, dcc: { degradeSwitch: 'close', rateLimiterSwitch: 'open' } };
}

/** One-time Pages allowance, including browsers with an existing demo account. */
export function withDemoAllowance(previous: DemoState, clock = new Date()): DemoState {
  return execute(previous, 'POST', '/demo/welcome_quota', {
    activityId: seed.activity[0].id, userId: '10002',
  }, clock).state;
}

/** Pure, atomic browser simulation. It never calls the Java services or a remote datastore. */
export function execute(previous: DemoState, method: string, path: string, body: Row = {}, clock = new Date(), random = Math.random): { state: DemoState; reply: Reply } {
  const state = clone(previous);
  const tables = state.tables;
  const url = new URL(path, 'https://demo.invalid');
  const route = url.pathname.replace(/^\/api\/v1/, '');
  const args = { ...Object.fromEntries(url.searchParams), ...body };
  const stamp = clock.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
  const day = stamp.slice(0, 10), month = stamp.slice(0, 7);
  const id = () => '7' + String(++state.sequence).padStart(18, '0');
  const row = (name: string, key: unknown) => tables[name].find(item => item.id === String(key));
  const activityId = String(args.activityId || '');
  const userId = String(args.userId || '10002');
  const accountKey = `${userId}:${activityId}`;
  const ledger = (name: string, values: Row) => {
    const result = { id: id(), userId, activityId, createTime: stamp, updateTime: stamp, ...values };
    tables[name].unshift(result);
    return result;
  };
  const account = () => {
    let a = tables.activity_account.find(x => x.userId === userId && x.activityId === activityId);
    if (!a) a = ledger('activity_account', { totalCount: 0, totalCountSurplus: 0, dayCount: 0, dayCountSurplus: 0, monthCount: 0, monthCountSurplus: 0, day, month });
    if (a.day !== day) { a.day = day; a.dayCountSurplus = a.dayCount; }
    if (a.month !== month) { a.month = month; a.monthCountSurplus = a.monthCount; }
    return a;
  };
  const credit = () => {
    let a = tables.credit_account.find(x => x.userId === userId && x.activityId === activityId);
    if (!a) a = ledger('credit_account', { totalAmount: 0, availableAmount: 0, accountStatus: 'open' });
    return a;
  };
  const grant = (count: Row, sku?: Row, amount = 0) => {
    const a = account();
    for (const field of ['totalCount', 'dayCount', 'monthCount']) {
      const n = Number(count[field] || 0); a[field] += n; a[field + 'Surplus'] += n;
    }
    a.updateTime = stamp;
    ledger('activity_record', { sku: sku?.id, activityName: row('activity', activityId)?.activityName, totalCount: Number(count.totalCount || 0), dayCount: Number(count.dayCount || 0), monthCount: Number(count.monthCount || 0), payAmount: amount, state: 'complete', outBusinessNo: id() });
  };
  const addCredit = (amount: number, title: string) => {
    const a = credit();
    a.availableAmount = Math.round((a.availableAmount + amount) * 100) / 100;
    if (amount > 0) a.totalAmount += amount;
    a.updateTime = stamp;
    ledger('credit_record', { tradeName: title, tradeType: amount < 0 ? 'reverse' : 'forward', tradeAmount: Math.abs(amount), outBusinessNo: id() });
  };
  const rebate = (config: Row): Reply => {
    if (config.rebateType === 'integral') addCredit(Number(config.rebateConfig), config.rebateDesc);
    else if (config.rebateType === 'sku') {
      const sku = row('activity_sku', config.rebateConfig);
      const count = sku && row('activity_count', sku.activityCountId);
      if (!sku || !count || Number(sku.stockCountSurplus) <= 0) return fail(1008, '兑换名额已用完');
      sku.stockCountSurplus--; grant(count, sku);
    } else if (config.rebateType === 'gift') {
      const n = Number(config.rebateConfig); grant({ totalCount: n, dayCount: n, monthCount: n });
    } else return fail(1002, '不支持的返利类型');
    ledger('user_behavior_rebate_order', { behaviorType: config.behaviorType, rebateDesc: config.rebateDesc, rebateType: config.rebateType, rebateConfig: config.rebateConfig, outBusinessNo: day, bizId: id() });
    return ok();
  };
  const availableAwards = () => tables['strategy/award'].filter(x => x.activityId === activityId).sort((a, b) => a.sort - b.sort);
  const used = () => { const a = account(); return a.totalCount - a.totalCountSurplus; };
  const treeNodes = (treeId: string) => tables['rule/tree/node'].filter(n => n.ruleTreeId === treeId);
  const lockCount = (award: Row) => Number(treeNodes(award.ruleTreeId).find(n => n.ruleName === 'rule_lock')?.ruleValue || 0);
  const requireActive = (): Reply | undefined => {
    const a = row('activity', activityId);
    if (!a || a.state !== 'open') return fail(1006, '活动暂未开放');
    if (clock < new Date(a.beginDateTime) || clock > new Date(a.endDateTime)) return fail(1007, '当前不在活动时间内');
  };
  const dispatch = (): Reply => {
    if (route === '/user/me') return ok({ id: '10002', username: '渝惠体验客户', roles: ['ROLE_ADMIN'], permissions: [] });
    if (route === '/dcc/query_config' && method === 'GET') return ok(state.dcc[String(args.key)] || 'close');
    if (route === '/dcc/update_config' && method === 'POST') {
      if (!(args.key in state.dcc) || !['open', 'close'].includes(args.value)) return fail(1002, '配置参数无效');
      state.dcc[args.key] = args.value; return ok();
    }
    if (route === '/local/wallet' && method === 'GET') return ok(state.wallet.filter(x => x.userId === '10002'));
    if (route === '/local/wallet/redeem' && method === 'POST') {
      if (!/^\d{1,19}$/.test(String(args.orderId || ''))) return fail(4000, '权益编号无效');
      const benefit = state.wallet.find(x => x.id === args.orderId && x.userId === '10002');
      if (!benefit || benefit.redeemedAt) return fail(4001, '权益不可用或已核销');
      benefit.redeemedAt = stamp; return { ...ok(), message: '演示权益已核销' };
    }
    if (method === 'GET' && route === '/erp/behavior/query_behavior_gift') return ok(tables.behavior.filter(x => x.activityId === activityId && x.behaviorType === 'activity_gift' && x.state === 'open'));
    if (method === 'GET' && route === '/erp/rule/tree/node/query_rule_tree_node_one') return ok(treeNodes(String(args.ruleTreeId)));
    if (method === 'GET' && route === '/erp/query_user_award_record_by_activity_id') return ok(tables.user_award_record.filter(x => x.activityId === activityId));
    for (const name of ledgers) if (route === `/erp/query_${name}` && method === 'GET') return ok(tables[name]);
    for (const [collection, command] of Object.entries(resources)) {
      const prefix = `/erp/${collection}/`;
      if (route === prefix + `query_${command}` && method === 'GET') return ok(tables[collection]);
      if (route === prefix + `add_${command}` && method === 'POST') {
        const value = { ...body, id: id(), createTime: stamp, updateTime: stamp };
        tables[collection].unshift(value); return ok(value.id);
      }
      if (route === prefix + `update_${command}` && method === 'POST') {
        const value = row(collection, args.id);
        if (!value) return fail(1002, '记录不存在');
        Object.assign(value, body, { id: value.id, updateTime: stamp }); return ok();
      }
      if (route.startsWith(prefix + `delete_${command}/`) && method === 'POST') {
        const key = route.split('/').pop();
        tables[collection] = tables[collection].filter(x => x.id !== key); return ok();
      }
    }
    if (route === '/activity/query_sku_product_list_by_activity_id' && method === 'GET') return ok(tables.activity_sku.filter(x => x.activityId === activityId).map(x => ({ ...x, activityCount: row('activity_count', x.activityCountId) })));
    if (route === '/activity/query_my_award_record' && method === 'GET') {
      const items = tables.user_award_record.filter(x => x.userId === userId && x.activityId === activityId);
      const size = Math.max(1, Number(args.pageSize || 12)), offset = Math.max(0, Number(args.pageNum || 1) - 1) * size;
      return ok({ items: items.slice(offset, offset + size), total: items.length });
    }
    if (method !== 'POST') return fail(4040, '静态演示不支持此接口');
    if (route === '/lottery/query_lottery_award_list') return ok(availableAwards().map(x => ({ ...x, image: row('award', x.awardId)?.image, isAwardUnlock: used() >= lockCount(x), waitUnLockCount: Math.max(0, lockCount(x) - used()) })));
    if (route === '/lottery/query_strategy_rule_weight') {
      const strategy = row('strategy', row('activity', activityId)?.strategyId);
      const rules = tables.rule.filter(x => String(strategy?.ruleModels || '').split(',').includes(x.ruleModel) && x.ruleModel.endsWith('rule_weight'));
      return ok(rules.flatMap(r => String(r.ruleValue || '').trim().split(/\s+/).filter(Boolean).map(group => {
        const [threshold, ids = ''] = group.split(':');
        return { ruleWeightCount: Number(threshold), userActivityAccountTotalUseCount: used(), strategyAwards: availableAwards().filter(a => ids.split(',').includes(a.awardId)) };
      })));
    }
    if (route === '/activity/query_user_activity_account') return ok(account());
    if (route === '/activity/query_user_credit_account') return ok(credit().availableAmount);
    const signKey = `${accountKey}:sign:${day}`;
    const giftKey = `${accountKey}:gift:${args.behaviorRebateId}`;
    if (route === '/activity/is_calendar_sign_rebate') return ok(state.claims.includes(signKey));
    if (route === '/activity/is_add_lottery_quota') return ok(state.claims.includes(giftKey));
    const inactive = requireActive(); if (inactive) return inactive;
    if (route === '/demo/welcome_quota') {
      const claim = `${accountKey}:pages-allowance-50-v1`;
      if (!state.claims.includes(claim)) {
        grant({ totalCount: 50, dayCount: 50, monthCount: 50 });
        tables.activity_record[0].remark = '网页演示体验赠送 50 次';
        state.claims.push(claim);
      }
      return ok();
    }
    if (route === '/activity/armory') {
      const awards = availableAwards();
      return awards.length && Math.abs(awards.reduce((n, a) => n + Number(a.awardRate), 0) - 1) < 0.000001 ? ok(true) : fail(1002, '奖品概率合计应为 1，请检查配置');
    }
    if (route === '/activity/calendar_sign_rebate') {
      if (state.claims.includes(signKey)) return fail(1005, '今日已经签到');
      const configs = tables.behavior.filter(x => x.activityId === activityId && x.behaviorType === 'sign' && x.state === 'open');
      if (!configs.length) return fail(1002, '没有启用的签到返利');
      for (const config of configs) { const result = rebate(config); if (result.code !== 1000) return result; }
      state.claims.push(signKey); return ok();
    }
    if (route === '/activity/add_lottery_quota') {
      if (state.claims.includes(giftKey)) return fail(2010, '这份福利已经领取');
      const config = tables.behavior.find(x => x.id === args.behaviorRebateId && x.activityId === activityId && x.behaviorType === 'activity_gift' && x.state === 'open');
      if (!config) return fail(1002, '福利配置不可用');
      const result = rebate(config); if (result.code !== 1000) return result;
      state.claims.push(giftKey); return ok();
    }
    if (route === '/activity/credit_pay_exchange_sku') {
      const sku = row('activity_sku', args.sku), a = credit();
      if (!sku || sku.activityId !== activityId) return fail(1002, '商品不存在');
      const count = row('activity_count', sku.activityCountId);
      if (!count) return fail(1002, '次数配置不存在');
      if (Number(sku.stockCountSurplus) <= 0) return fail(1008, '兑换名额已用完');
      const amount = Number(sku.productAmount);
      if (!Number.isFinite(amount) || amount < 0 || a.accountStatus !== 'open' || a.availableAmount < amount) return fail(1013, '积分不足或账户不可用');
      addCredit(-amount, '积分兑换抽奖机会'); sku.stockCountSurplus--; grant(count, sku, amount); return ok();
    }
    if (route === '/activity/draw') {
      if (state.dcc.degradeSwitch === 'open') return fail(1014, '活动暂时维护中');
      if (state.dcc.rateLimiterSwitch === 'open' && clock.getTime() - (state.lastDraw[accountKey] || 0) < 1000) return fail(1015, '操作过于频繁');
      const a = account();
      if (a.totalCountSurplus <= 0) return fail(1009, '抽奖次数不足');
      if (a.monthCountSurplus <= 0) return fail(1010, '本月可用次数不足');
      if (a.dayCountSurplus <= 0) return fail(1011, '今日可用次数不足');
      const candidates = availableAwards();
      const total = candidates.reduce((n, x) => n + Number(x.awardRate), 0);
      if (!candidates.length || Math.abs(total - 1) > 0.000001) return fail(1002, '奖品概率配置无效');
      let point = random(), selected = candidates[candidates.length - 1];
      for (const candidate of candidates) { point -= Number(candidate.awardRate); if (point < 0) { selected = candidate; break; } }
      a.totalCountSurplus--; a.monthCountSurplus--; a.dayCountSurplus--; a.updateTime = stamp;
      const strategy = row('strategy', row('activity', activityId)?.strategyId);
      const strategyRules = String(strategy?.ruleModels || '').split(',').map(name => tables.rule.find(x => x.ruleModel === name)).filter(Boolean) as Row[];
      let forcedAward: Row | undefined;
      for (const rule of strategyRules) {
        if (rule.ruleModel.endsWith('rule_blacklist')) {
          const [awardId, users = ''] = String(rule.ruleValue || '').split(':');
          if (users.split(',').includes(userId)) forcedAward = row('award', awardId);
        }
        if (rule.ruleModel.endsWith('rule_weight')) {
          const tier = String(rule.ruleValue || '').trim().split(/\s+/).map(x => x.split(':')).find(([n, ids]) => ids && Number(n) === used());
          if (tier) {
            const eligible = candidates.filter(x => tier[1].split(',').includes(x.awardId));
            const sum = eligible.reduce((n, x) => n + Number(x.awardRate), 0);
            let p = random() * sum;
            for (const x of eligible) { p -= Number(x.awardRate); if (p < 0) { selected = x; forcedAward = row('award', x.awardId); break; } }
          }
        }
        if (forcedAward) break;
      }
      if (!forcedAward) {
        const tree = row('rule/tree', selected.ruleTreeId);
        if (!tree && selected.ruleTreeId && selected.ruleTreeId !== '0') return fail(1002, '规则树不存在');
        const treeId = selected.ruleTreeId;
        let current = tree?.treeNodeRuleKey;
        const visited = new Set<string>();
        while (current) {
          if (visited.has(current)) return fail(1002, '规则树包含循环，请调整配置');
          visited.add(current);
          const node = treeNodes(treeId).find(x => x.ruleName === current);
          if (!node) return fail(1002, '规则树节点不存在');
          let outcome = 'ALLOW';
          if (current === 'rule_lock' && used() < Number(node.ruleValue || 0)) outcome = 'TAKE_OVER';
          if (current === 'rule_stock') { if (selected.awardCountSurplus > 0) selected.awardCountSurplus--; else outcome = 'TAKE_OVER'; }
          if (current === 'rule_luck_award') {
            selected = candidates.find(x => row('award', x.awardId)?.awardKey === 'user_thanks') || selected;
            outcome = 'TAKE_OVER';
          }
          const edge = tables['rule/tree/node/line'].find(x => x.ruleTreeId === treeId && x.ruleNodeFrom === current && x.ruleLimitValue === outcome && x.ruleLimitType === 'EQUAL');
          current = edge?.ruleNodeTo;
        }
      }
      const award = forcedAward || row('award', selected.awardId);
      if (!award) return fail(1002, '奖品不存在');
      const order = ledger('user_order', { activityName: row('activity', activityId)?.activityName, strategyId: strategy?.id, orderState: 'used' });
      ledger('user_award_record', { strategyId: strategy?.id, userOrderId: order.id, awardId: award.id, awardTitle: award.awardDesc, image: award.image, awardTime: clock.getTime(), awardState: 'complete' });
      if (['bank_coupon', 'bank_service'].includes(award.awardKey)) state.wallet.unshift({ id: order.id, userId, title: award.awardDesc, quantity: award.awardConfig, createdAt: stamp, redeemedAt: null });
      if (award.awardKey === 'user_cj') { const n = Number(award.awardConfig); grant({ totalCount: n, dayCount: n, monthCount: n }); }
      if (award.awardKey.startsWith('user_credit')) {
        const [min, max = min] = String(award.awardConfig).split(',').map(Number);
        addCredit(min + Math.floor(random() * (max - min + 1)), award.awardDesc);
      }
      state.lastDraw[accountKey] = clock.getTime();
      return ok({ awardId: award.id, awardTitle: award.awardDesc, awardIndex: selected.sort });
    }
    return fail(4040, '静态演示不支持此接口');
  };
  const reply = dispatch();
  return { state: reply.code === 1000 ? state : previous, reply };
}
