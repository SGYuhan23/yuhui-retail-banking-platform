package com.yuhui.types.common;

/**

 * 常量
 */
public class Constants {

    public static final String SPLIT = ",";
    public static final String COLON = ":";
    public static final String SPACE = " ";
    public static final String UNDERLINE = "_";

    public static class RedisKey {
        public static final String ACTIVITY_KEY = "activity_of_";
        public static final String AWARD_KEY = "award_of_";
        public static final String ACTIVITY_SKU_COUNT_QUEUE_KEY = "activity_sku_count_queue_";
        public static final String STRATEGY_AWARD_COUNT_QUEUE_KEY = "strategy_award_count_queue_";
        public static final String ACTIVITY_AWARD_COUNT_QUEUE_KEY = "activity_award_count_queue_";
        public static final String ACTIVITY_SKU_LIST_KEY = "activity_sku_list_";
        public static final String STRATEGY_AWARD_LIST_KEY = "strategy_award_list_";
        public static final String ACTIVITY_AWARD_LIST_KEY = "activity_award_list_";
        public static final String STRATEGY_KEY = "strategy_of_";
        public static final String STRATEGY_RULE_WEIGHT_KEY = "strategy_rule_weight_";
        public static final String ACTIVITY_RULE_WEIGHT_KEY = "activity_rule_weight_";
        public static final String ACTIVITY_SKU_STOCK_COUNT_KEY = "activity_sku_stock_count_";
        public static final String ACTIVITY_COUNT_KEY = "activity_count_of_";
        public static final String STRATEGY_AWARD_COUNT_KEY = "strategy_award_count_of_";
        public static final String ACTIVITY_AWARD_COUNT_KEY = "activity_award_count_of_";
        public static final String RATE_RANGE_KEY = "rate_range_";
        public static final String RATE_TABLE_KEY = "rate_table_";
        public static final String STRATEGY_AWARD_KEY = "strategy_award_of_";
        public static final String ACTIVITY_AWARD_KEY = "activity_award_of_";
        public static final String RULE_TREE_KEY = "rule_tree_of_";
        public static final String ACTIVITY_ACCOUNT_LOCK = "activity_account_lock_";
        public static final String ACTIVITY_ACCOUNT_UPDATE_LOCK = "activity_account_update_lock_";
        public static final String CREDIT_ACCOUNT_LOCK = "credit_account_lock_";
        public static final String STRATEGY_ALGORITHM_KEY = "strategy_algorithm_";
        public static final String ACTIVITY_ALGORITHM_KEY = "activity_algorithm_";
        public static final String IS_RECEIVE_GIFT = "is_receive_gift_";
        public static final String BLACKLIST = "blacklist_";
        public static final String RATE_LIMITER = "rate_limiter_";
    }

    public static class RuleModel {
        public static final String DEFAULT = "default";
        public static final String RULE_BLACKLIST = "rule_blacklist";
        public static final String RULE_WIGHT = "rule_weight";
        public static final String RULE_LOCK = "rule_lock";
        public static final String RULE_STOCK = "rule_stock";
        public static final String RULE_LUCK_AWARD = "rule_luck_award";
    }

    public static class ActivityModel {
        public static final String ACTIVITY_BASE = "activity_base";
        public static final String ACTIVITY_SKU_STOCK = "activity_sku_stock";

    }

    public static class AwardModel {
        public static final String USER_CREDIT_RANDOM = "user_credit_random";
        public static final String RULE_BLACKLIST = "user_blacklist";
        public static final String THANKS = "user_thanks";
        public static final String USER_CJ = "user_cj";
    }

    public static class QuotaModel {
        public static final String CREDIT_PAY_TRADE = "credit_pay_trade";
        public static final String REBATE_NO_PAY_TRADE = "rebate_no_pay_trade";
        public static final String GIFT_NO_PAY_TRADE = "gift_no_pay_trade";

    }
    public static class Algorithm{
        public static final String O1 = "o1Algorithm";
        public static final String OLogN = "oLogNAlgorithm";
    }

}
