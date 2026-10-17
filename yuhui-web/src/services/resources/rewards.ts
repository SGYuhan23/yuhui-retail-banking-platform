import { json, rewardsJson, multipart } from '../transport/client';

export async function queryLotteryAwardList(options?: { [key: string]: any }) {
  return rewardsJson<API.LotteryAwardList>('POST', `/lottery/query_lottery_award_list`, options);
}

export async function queryStrategyRuleWeight(options?: { [key: string]: any }) {
  return rewardsJson<API.StrategyRuleWeight>('POST', `/lottery/query_strategy_rule_weight`, options);
}

export async function draw(options?: { [key: string]: any }) {
  return rewardsJson<API.LotteryAward>('POST', `/activity/draw`, options);
}

export async function calendarSignRebate(options?: { [key: string]: any }) {
  return rewardsJson<API.CommonResponse>('POST', `/activity/calendar_sign_rebate`, options);
}

export async function addLotteryQuota(options?: { [key: string]: any }) {
  return rewardsJson<API.CommonResponse>('POST', `/activity/add_lottery_quota`, options);
}

export async function isCalendarSignRebate(options?: { [key: string]: any }) {
  return rewardsJson<API.CommonResponse>('POST', `/activity/is_calendar_sign_rebate`, options);
}

export async function isAddLotteryQuota(options?: { [key: string]: any }) {
  return rewardsJson<API.CommonResponse>('POST', `/activity/is_add_lottery_quota`, options);
}

export async function queryUserActivityAccount(options?: { [key: string]: any }) {
  return rewardsJson<API.UserActivityAccount>('POST', `/activity/query_user_activity_account`, options);
}

export async function queryUserCreditAccount(options?: { [key: string]: any }) {
  return rewardsJson<API.CommonResponse>('POST', `/activity/query_user_credit_account`, options);
}

export async function querySkuProductListByActivityId(activityId: string) {
  return json<API.SkuProduct>('GET', `/activity/query_sku_product_list_by_activity_id?activityId=${activityId}`);
}

export async function creditPayExchangeSku(options?: { [key: string]: any }) {
  return rewardsJson<API.CommonResponse>('POST', `/activity/credit_pay_exchange_sku`, options);
}

export async function upload(formData: FormData) {
  return multipart<API.CommonResponse>('POST', `/file/upload`, formData);
}
