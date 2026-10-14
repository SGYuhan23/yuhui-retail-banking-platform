# 演示配置与测试数据

- DEMO_ONLY：compose.local.yml 与 application-local.properties 中的 yuhui_local_only 是公开的本机容器演示口令。服务绑定回环地址，不得复用于生产。
- DEMO_ONLY：demo-token、change-me、example-password、local、guest 等示例值不是实际服务授权；外部服务默认未接入当前 local 主线。
- TEST_ONLY：scripts/check-*.py 的用户、业务 ID、Basic 认证与合成核销码仅操作本地演示服务；没有真实客户账号。
- 代码中的 password/token/cookie/authorization 是接口字段、环境配置引用或运行时读取，不是嵌入的个人登录凭据。
- 扫描中的邮箱：锁文件维护者及模板归属邮箱属于公开第三方元数据；x@qq.com 是登录表单示例，不是项目使用者联系方式。未发现真实客户手机号。

正式验收日志单独保留；本机运行日志和生成目录永不导出。扫描属于工程检查，不是第三方安全认证。
