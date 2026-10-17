import { json } from '../transport/client';
import { configurationResource } from './configuration';

export async function dcc_value(key: string) {
  return json<API.CommonResponse>('GET', `/dcc/query_config?key=${key}`);
}

export async function dcc_config(options?: { [key: string]: any }) {
  return json<API.CommonResponse>('POST', `/dcc/update_config`, options);
}

export async function query_user_order() {
  return json<API.UserOrderItem>('GET', `/erp/query_user_order`);
}

export async function query_activity_account() {
  return json<API.ActivityAccountItem>('GET', `/erp/query_activity_account`);
}

export async function query_user_award_record() {
  return json<API.UserAwardRecordItem>('GET', `/erp/query_user_award_record`);
}

export async function erp_query_user_award_record_by_activity_id(activityId: string) {
  return json<API.UserAwardRecordItem>('GET', `/erp/query_user_award_record_by_activity_id?activityId=${activityId}`);
}

export async function query_my_award_record(
  pageNum: string,
  pageSize: string,
  activityId: string,
  userId: string,
) {
  return json<API.MyPage<API.UserAwardRecordItem>>('GET', `/activity/query_my_award_record?pageNum=${pageNum}&&pageSize=${pageSize}&&activityId=${activityId}&&userId=${userId}`);
}

export async function query_credit_account() {
  return json<API.CreditAccountItem>('GET', `/erp/query_credit_account`);
}

export async function query_credit_record() {
  return json<API.CreditRecordItem>('GET', `/erp/query_credit_record`);
}

export async function query_activity_record() {
  return json<API.ActivityRecordItem>('GET', `/erp/query_activity_record`);
}

export async function query_user_behavior_rebate_order() {
  return json<API.UserBehaviorRebateOrderItem>('GET', `/erp/query_user_behavior_rebate_order`);
}

export async function query_user_behavior_gift(activityId: string) {
  return json<API.UserBehaviorRebateOrderItem>('GET', `/erp/behavior/query_behavior_gift?activityId=${activityId}`);
}

export async function armory_activity(activityId: any) {
  return json<API.CommonResponse>('POST', `/activity/armory?activityId=${activityId}`);
}

export async function query_rule_tree_node_one(ruleTreeId: string) {
  return json<API.RuleTreeNodeItem>('GET', `/erp/rule/tree/node/query_rule_tree_node_one?ruleTreeId=${ruleTreeId}`);
}

const activity = configurationResource<API.ActivityItem>('activity', 'activity');
export const { list: query_activity, create: add_activity, update: update_activity, remove: delete_activity } = activity;

const activity_count = configurationResource<API.ActivityCountItem>('activity_count', 'activity_count');
export const { list: query_activity_count, create: add_activity_count, update: update_activity_count, remove: delete_activity_count } = activity_count;

const activity_sku = configurationResource<API.ActivitySkuItem>('activity_sku', 'activity_sku');
export const { list: query_activity_sku, create: add_activity_sku, update: update_activity_sku, remove: delete_activity_sku } = activity_sku;

const behavior_rebate = configurationResource<API.BehaviorRebateItem>('behavior', 'behavior');
export const { list: query_behavior_rebate, create: add_behavior_rebate, update: update_behavior_rebate, remove: delete_behavior_rebate } = behavior_rebate;

const award = configurationResource<API.AwardItem>('award', 'award');
export const { list: query_award, create: add_award, update: update_award, remove: delete_award } = award;

const rule = configurationResource<API.RuleItem>('rule', 'rule');
export const { list: query_rule, create: add_rule, update: update_rule, remove: delete_rule } = rule;

const strategy = configurationResource<API.StrategyItem>('strategy', 'strategy');
export const { list: query_strategy, create: add_strategy, update: update_strategy, remove: delete_strategy } = strategy;

const strategy_award = configurationResource<API.StrategyAwardItem>('strategy/award', 'strategy_award');
export const { list: query_strategy_award, create: add_strategy_award, update: update_strategy_award, remove: delete_strategy_award } = strategy_award;

const rule_tree = configurationResource<API.RuleTreeItem>('rule/tree', 'rule_tree');
export const { list: query_rule_tree, create: add_rule_tree, update: update_rule_tree, remove: delete_rule_tree } = rule_tree;

const rule_tree_node = configurationResource<API.RuleTreeNodeItem>('rule/tree/node', 'rule_tree_node');
export const { list: query_rule_tree_node, create: add_rule_tree_node, update: update_rule_tree_node, remove: delete_rule_tree_node } = rule_tree_node;

const rule_tree_node_line = configurationResource<API.RuleTreeNodeLineItem>('rule/tree/node/line', 'rule_tree_node_line');
export const { list: query_rule_tree_node_line, create: add_rule_tree_node_line, update: update_rule_tree_node_line, remove: delete_rule_tree_node_line } = rule_tree_node_line;
