/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
const legacyRoutes = [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        ...(process.env.REPLICA_LOCAL === 'true'
          ? { redirect: '/experience' }
          : { component: './User/Login' }),
      },
    ],
  },
  {
    path: '/admin',
    name: '活动管理',
    icon: 'crown',
    // access: 'canAdmin',//只有拥有 canAdmin 权限的用户才能访问
    routes: [
      { path: '/admin', redirect: '/admin/activity' }, //进入这个下拉菜单默认指向该菜单栏下的哪一项
      {
        path: '/admin/activity',
        name: '活动配置',
        icon: 'table',
        component: './Activity',
      },
      {
        name: '活动奖品配置',
        icon: 'table',
        path: '/admin/activity-award',
        component: './StrategyAward',
      },
    ],
  },
  {
    path: '/lottery',
    name: '抽奖管理',
    icon: 'group',
    // access: 'canAdmin',//只有拥有 canAdmin 权限的用户才能访问
    routes: [
      { path: '/lottery', redirect: '/lottery/activity_account' },
      {
        name: '抽奖账户',
        icon: 'table',
        path: '/lottery/activity_account',
        component: './ActivityAccount',
      },
      {
        name: '增加抽奖账户次数流水',
        icon: 'table',
        path: '/lottery/activity_record',
        component: './ActivityRecord',
      },
      {
        name: '用户抽奖订单',
        icon: 'table',
        path: '/lottery/user_order_list',
        component: './UserOrder',
      },
      {
        name: '用户中奖流水',
        icon: 'table',
        path: '/lottery/user_award_record',
        component: './UserAwardRecord',
      },
      {
        name: '奖品配置',
        icon: 'table',
        path: '/lottery/award',
        component: './Award',
      },
      {
        name: '动态配置中心(DCC)',
        icon: 'table',
        path: '/lottery/dcc',
        component: './DCC',
      },
    ],
  },
  {
    path: '/credit',
    name: '积分管理',
    icon: 'dotChart',
    // access: 'canAdmin',//只有拥有 canAdmin 权限的用户才能访问
    routes: [
      { path: '/credit', redirect: '/credit/credit_account' },
      {
        name: '积分账户',
        icon: 'table',
        path: '/credit/credit_account',
        component: './CreditAccount',
      },
      {
        name: '积分账户流水',
        icon: 'table',
        path: '/credit/credit_record',
        component: './CreditRecord',
      },
    ],
  },
  {
    path: '/rebate',
    name: '返利管理',
    icon: 'sliders',
    // access: 'canAdmin',//只有拥有 canAdmin 权限的用户才能访问
    routes: [
      { path: '/rebate', redirect: '/rebate/behavior_rebate' },
      {
        name: '返利配置',
        icon: 'table',
        path: '/rebate/behavior_rebate',
        component: './BehaviorRebate',
      },
      {
        path: '/rebate/activity_count',
        name: '返利抽奖次数配置',
        icon: 'table',
        component: './ActivityCount',
      },
      {
        path: '/rebate/activity_sku',
        name: '活动SKU配置',
        icon: 'table',
        component: './ActivitySku',
      },
      {
        name: '用户日常行为返利订单',
        icon: 'table',
        path: '/rebate/user_behavior_rebate_order',
        component: './UserBehaviorRebateOrder',
      },
    ],
  },
  {
    path: '/strategy',
    name: '策略管理',
    icon: 'fund',
    // access: 'canAdmin',//只有拥有 canAdmin 权限的用户才能访问
    routes: [
      { path: '/strategy', redirect: '/strategy/strategy' },
      {
        name: '策略规则配置',
        icon: 'table',
        path: '/strategy/strategy',
        component: './Strategy',
      },
      {
        name: '规则模型配置',
        icon: 'table',
        path: '/strategy/rule',
        component: './Rule',
      },
      {
        name: '奖品规则树配置',
        icon: 'table',
        path: '/strategy/tree',
        component: './RuleTree',
      },
      {
        name: '规则树编排',
        icon: 'apartment',
        path: '/strategy/tree-editor',
        component: './RuleTreeEditor',
      },
      {
        name: '规则节点明细',
        icon: 'table',
        path: '/strategy/node',
        component: './RuleTreeNode',
      },
      {
        name: '规则连线明细',
        icon: 'table',
        path: '/strategy/line',
        component: './RuleTreeNodeLine',
      },
    ],
  },

  {
    path: '/auth',
    hideInMenu: process.env.REPLICA_LOCAL === 'true',
    name: '认证管理',
    icon: 'safetyCertificate',
    access: 'canAdmin',
    routes: [
      { path: '/auth', redirect: '/auth/users' },
      {
        name: '用户管理',
        icon: 'team',
        path: '/auth/users',
        component: './Auth/Users',
      },
      {
        name: '角色管理',
        icon: 'userSwitch',
        path: '/auth/roles',
        component: './Auth/Roles',
      },
      {
        name: '权限管理',
        icon: 'lock',
        path: '/auth/permissions',
        component: './Auth/Permissions',
      },
      {
        name: '登录方式',
        icon: 'key',
        path: '/auth/login-methods',
        component: './Auth/LoginMethods',
      },
    ],
  },
  {
    path: '/account/center',
    component: './Account/Center',
  },
  {
    name: '积分权益专区',
    icon: 'aimOutlined',
    path: '/experience',
    layout: false,
    component: './Experience',
  },
  { path: '/wallet', layout: false, name: '我的权益', icon: 'wallet', component: './Wallet' },
  {
    path: '/',
    redirect: '/experience',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];

const legacy = legacyRoutes.filter((r) =>
  ['/admin', '/lottery', '/rebate', '/strategy', '/auth'].includes(r.path),
);
legacy.forEach((r) => {
  Object.assign(r, { hideInMenu: true });
});
export default [
  {
    path: '/operating/overview',
    name: '经营总览',
    icon: 'dashboard',
    component: './Operating/Overview',
  },
  {
    path: '/operating/segments',
    name: '客群经营',
    icon: 'team',
    component: './Operating/Segments',
  },
  {
    path: '/operating',
    name: '活动经营',
    icon: 'project',
    routes: [
      { path: '/operating', redirect: '/operating/campaigns' },
      { path: '/operating/campaigns', name: '经营方案与投放', component: './Operating/Campaigns' },
      {
        path: '/operating/mechanisms',
        name: '营销玩法',
        routes: [
          { path: '/operating/mechanisms/activity', name: '抽奖活动', component: './Activity' },
          { path: '/operating/mechanisms/rebate', name: '签到返利', component: './BehaviorRebate' },
          { path: '/operating/mechanisms/tree', name: '规则树编排', component: './RuleTreeEditor' },
        ],
      },
    ],
  },
  {
    path: '/operating/merchants',
    name: '商户与权益',
    icon: 'shop',
    component: './Operating/Merchants',
  },
  {
    path: '/credit',
    name: '积分与预算',
    icon: 'wallet',
    routes: [
      { path: '/credit', redirect: '/credit/budget' },
      { path: '/credit/budget', name: '预算与流水', component: './Operating/Budget' },
      { path: '/credit/credit_account', name: '原积分账户', component: './CreditAccount' },
      { path: '/credit/credit_record', name: '原积分流水', component: './CreditRecord' },
    ],
  },
  {
    path: '/operating/review',
    name: '经营复盘',
    icon: 'barChart',
    component: './Operating/Review',
  },
  {
    path: '/settings',
    name: '系统配置',
    icon: 'setting',
    routes: [
      { path: '/settings', redirect: '/settings/demo' },
      { path: '/settings/demo', name: '演示数据', component: './Operating/Settings' },
      ...legacy.flatMap((r) =>
        (r.routes || [])
          .filter((x) => 'component' in x)
          .map((x) => ({ ...x, path: '/settings' + x.path })),
      ),
    ],
  },
  ...legacyRoutes.filter((r) => r.path !== '/credit').map((r) => ({ ...r, hideInMenu: true })),
];
