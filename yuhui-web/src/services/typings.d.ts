// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userId?: string;
    nickname?: string;
    roles?: string[];
    permissions?: string[];
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  type UserOrderItem = {
    id?: string;
    userId?: string;
    activityId?: string;
    activityName?: string;
    strategyId?: string;
    orderId?: string;
    orderTime?: string;
    orderState?: string;
    createTime?: string;
    updateTime?: string;
  };

  type ActivityAccountItem = {
    id?: string;
    userId?: string;
    activityId?: string;
    totalCount?: string;
    totalCountSurplus?: string;
    dayCount?: string;
    dayCountSurplus?: string;
    monthCount?: string;
    monthCountSurplus?: string;
    createTime?: string;
    updateTime?: string;
  };

  type UserAwardRecordItem = {
    id?: string;
    userId?: string;
    activityId?: string;
    strategyId?: string;
    userOrderId?: string;
    awardId?: string;
    image?: string;
    awardTitle?: string;
    awardTime?: string;
    awardState?: string;
    createTime?: string;
    updateTime?: string;
    data?: UserAwardRecordItem[];
  };

  type CreditAccountItem = {
    id?: string;
    userId?: string;
    activityId?: string;
    totalAmount?: string;
    availableAmount?: string;
    accountStatus?: string;
    createTime?: string;
    updateTime?: string;
  };

  type CreditRecordItem = {
    id?: string;
    userId?: string;
    activityId?: string;
    tradeName?: string;
    tradeType?: string;
    tradeAmount?: string;
    outBusinessNo?: string;
    createTime?: string;
    updateTime?: string;
  };

  type ActivityRecordItem = {
    id?: string;
    userId?: string;
    activityId?: string;
    sku?: string;
    activityName?: string;
    totalCount?: string;
    dayCount?: string;
    monthCount?: string;
    payAmount?: string;
    state?: string;
    outBusinessNo?: string;
    createTime?: string;
    updateTime?: string;
  };

  type UserBehaviorRebateOrderItem = {
    id?: string;
    userId?: string;
    activityId?: string;
    behaviorType?: string;
    rebateDesc?: string;
    rebateType?: string;
    rebateConfig?: string;
    outBusinessNo?: string;
    bizId?: string;
    createTime?: string;
    updateTime?: string;
    data?: UserBehaviorRebateOrderItem[];
  };

  type ActivityItem = {
    id?: string;
    activityName?: string;
    activityDesc?: string;
    beginDateTime?: string;
    endDateTime?: string;
    strategyId?: string;
    state?: string;
    createTime?: string;
    updateTime?: string;
    data?: ActivityItem[];
  };


  // ==================== 认证授权（auth-service） ====================

  /** 登录方式编码：password / email:aliyun / email:smtp / sms:aliyun / oauth:gitee / oauth:github */
  type LoginMethod = string;

  type UserLoginResponse = {
    id: number;
    username: string;
    nickname?: string;
    avatar?: string;
    roles?: string[];
    permissions?: string[];
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };

  type UserInfoResponse = {
    id: number;
    username: string;
    nickname?: string;
    avatar?: string;
    roles?: string[];
    permissions?: string[];
  };

  // ==================== 认证管理与个人中心 ====================

  /** auth-service 用户（管理端与个人中心共用） */
  type AuthUser = {
    id: string;
    username: string;
    email?: string;
    phone?: string;
    nickname?: string;
    avatar?: string;
    status?: number;
    roles?: string[];
    permissions?: string[];
    realName?: string;
    gender?: number;
    birthday?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    createdAt?: number;
    lastLoginAt?: number;
  };

  /** 用户/资料更新字段：不传=不修改；email/phone/nickname/avatar 空串=清空 */
  type AuthUserUpdate = {
    username?: string;
    password?: string;
    email?: string;
    phone?: string;
    nickname?: string;
    avatar?: string;
    status?: number;
    realName?: string;
    gender?: number;
    birthday?: string;
  };

  type AuthRole = {
    id: string;
    code: string;
    name: string;
    description?: string;
    status?: number;
    permissions?: string[];
  };

  type AuthPermission = {
    id: string;
    code: string;
    name: string;
    resource?: string;
    action?: string;
    description?: string;
  };

  type AuthLoginMethodConfig = {
    method: string;
    category: string;
    displayName: string;
    /** 本租户是否启用：0-否 1-是 */
    enabled: number;
    /** 1=平台凭证 0=自有凭证 */
    usePlatformConfig: number;
    hasConfig: boolean;
    platformEnabled: boolean;
  };

  type AuthOAuthBinding = {
    id: string;
    provider: string;
    providerUid: string;
    createdAt?: number;
  };

  type AuthPage<T> = {
    total: number;
    page: number;
    size: number;
    items: T[];
  };

  type BaseResponse<T = any> = {
    code?: number;
    message?: string;
    data?: T;
  };

  type CommonResponse = {
    id: string;
    role: number;
    token: string;
    username: string | undefined;
    code?: number | string;
    message?: string;
    data?: any;
  };

  type ActivityCountItem = {
    id?: string;
    activityId?: string;
    totalCount?: string;
    dayCount?: string;
    monthCount?: string;
    createTime?: string;
    updateTime?: string;
    data?: ActivityCountItem[];
  };

  type ActivitySkuItem = {
    id?: string;
    activityId?: string;
    stockCount?: string;
    stockCountSurplus?: string;
    productAmount?: string;
    createTime?: string;
    updateTime?: string;
    data?: ActivitySkuItem[];
  };

  type BehaviorRebateItem = {
    id?: string;
    activityId?: string;
    behaviorType?: string;
    rebateDesc?: string;
    rebateType?: string;
    rebateConfig?: string;
    state?: string;
    createTime?: string;
    updateTime?: string;
    data?: BehaviorRebateItem[];
  };

  type AwardItem = {
    id?: string;
    awardKey?: string;
    awardConfig?: string;
    awardDesc?: string;
    image?: string;
    createTime?: string;
    updateTime?: string;
    data?: AwardItem[];
  };

  type RuleItem = {
    id?: string;
    ruleModel?: string;
    ruleValue?: string;
    ruleDesc?: string;
    createTime?: string;
    updateTime?: string;
    data?: RuleItem[];
  };

  type StrategyItem = {
    id?: string;
    strategyDesc?: string;
    ruleModels?: string;
    createTime?: string;
    updateTime?: string;
    data?: StrategyItem[];
  };

  type StrategyAwardItem = {
    id?: string;
    activityId?: string;
    strategyId?: string;
    awardId?: string;
    awardTitle?: string;
    awardSubtitle?: string;
    awardCount?: string;
    awardCountSurplus?: string;
    awardRate?: string;
    ruleTreeId?: string;
    sort?: string;
    createTime?: string;
    updateTime?: string;
    data?: StrategyAwardItem[];
  };

  type RuleTreeItem = {
    id?: string;
    treeName?: string;
    treeDesc?: string;
    treeNodeRuleKey?: string;
    createTime?: string;
    updateTime?: string;
    data?: RuleTreeItem[];
  };

  type RuleTreeNodeItem = {
    id?: string;
    ruleTreeId?: string;
    ruleName?: string;
    ruleDesc?: string;
    ruleValue?: string;
    createTime?: string;
    updateTime?: string;
    data?: RuleTreeNodeItem[];
  };

  type RuleTreeNodeLineItem = {
    id?: string;
    ruleTreeId?: string;
    ruleNodeFrom?: string;
    ruleNodeTo?: string;
    ruleLimitType?: string;
    ruleLimitValue?: string;
    createTime?: string;
    updateTime?: string;
    data?: RuleTreeNodeLineItem[];
  };

  type LotteryAwardList = {
    awardId?: string; // 奖品ID
    awardTitle?: string; // 奖品标题
    awardSubtitle?: string; // 奖品副标题（eg.抽奖一次后解锁）
    image?: string; // 奖品图片url
    sort?: string; // 排序
    awardRuleLockCount?: string; // 奖品次数规则 - 抽奖N次后解锁，未配置则为空
    isAwardUnlock?: string; // 奖品是否解锁 - true 已解锁、false 未解锁
    waitUnLockCount?: string; // 还需要多少次解锁
    data?: LotteryAwardList[];
  };

  type LotteryAward = {
    awardId?: string; // 奖品ID
    awardTitle?: string; // 奖品标题
    awardIndex?: string; // 排序编号
    message?: string;
    code?: number;
    data?: LotteryAward;
  };

  type StrategyAward = {
    awardId?: string; // 奖品ID
    awardTitle?: string; // 奖品标题
  };

  type StrategyRuleWeight = {
    ruleWeightCount?: number; // 权重规则配置的抽奖次数
    userActivityAccountTotalUseCount?: number; // 用户已经抽奖总次数
    strategyAwards?: StrategyAward[]; // 当前权重中奖抽奖范围
    data?: StrategyRuleWeight;
  };

  type UserActivityAccount = {
    totalCount?: number;
    totalCountSurplus?: number;
    dayCount?: number;
    dayCountSurplus?: number;
    monthCount?: number;
    monthCountSurplus?: number;
    data?: UserActivityAccount;
  };

  type ActivityCount = {
    totalCount?: number;
    dayCount?: number;
    monthCount?: number;
  };

  type SkuProduct = {
    id?: string;
    activityId?: string;
    activityCountId?: string;
    stockCount?: string;
    stockCountSurplus?: string;
    productAmount?: string;
    activityCount?: ActivityCount;
    data?: SkuProduct[];
  };

  type MyPage<T> = {
    data: any;
    total?: number;
    items?: any[];
  };

}
