# 渝惠积分｜城市生活权益

个人学习与产品实践项目：重庆城市插画首页、积分签到、积分兑换抽奖机会、九宫格抽奖、中奖记录及权益钱包。非银行官方系统；活动与权益均用于本地模拟体验。

## 启动与入口

依赖 Java 17、Maven、Node.js 20、pnpm、Docker 与 Python 3。

```bash
bash scripts/start.sh
```

- [积分首页与抽奖](http://127.0.0.1:18000/experience)
- [我的权益](http://127.0.0.1:18000/wallet)
- [运营工作台](http://127.0.0.1:18000/admin/activity)

本地使用固定演示客户 `10002`，无需真实登录。服务仅监听回环地址；不要直接按此配置开放公网。停止执行 `bash scripts/stop.sh`，保留数据库数据。

## 当前功能

- 重庆城市主视觉、积分余额、每日签到、新客抽奖次数领取。
- 积分兑换抽奖机会、后端决定开奖结果、次数解锁与中奖记录。
- 生活券和出行礼遇异步到账、权益钱包查询及模拟核销。
- 活动、奖品、积分、返利、策略和规则树配置后台。
- 重复领取、重复发奖、重复核销保护，以及积分并发扣减与消息补偿。

## 技术与边界

Java / Spring Boot、React / Umi / Ant Design，使用 MySQL、Redis、RabbitMQ、ZooKeeper。沿用已有营销工程并进行本地运行适配与页面改造；不声称全部从零实现。DB-Router 用于既有分库分表；本地路径不运行独立认证服务、真实支付、商户清结算或外部调度中心。

## 恢复说明

2026-10-17 恢复重庆插画版积分抽奖主入口和原运营后台，移除首页、钱包中后续加入的 V3 经营区块。已修复的抽奖、积分与发奖实现继续使用。

本次是基于当前工程恢复既有积分版界面与导航，并非声称取得了完整的历史 V2 源码快照。后续经营模块源码、数据和历史验收材料保留，但不再作为当前页面入口。此前的七步经营演示位于 `site/`，不属于当前积分抽奖页面，也不能替代 Java 后端。

[恢复前 README](docs/history/retail-operating-readme-before-rewards-restore.md) 仅用于历史记录，其中相对链接按原仓库根路径解释。

## 验证

```bash
python3 scripts/smoke.py
python3 scripts/check-flow.py
python3 scripts/check-wallet.py
cd yuhui-web
npm run tsc
REPLICA_LOCAL=true npm run build
```

业务验收使用本地模拟数据，部分脚本会创建独立测试客户和流水。当前恢复结果见 [恢复记录](docs/rewards-restore.md)。
