import { Button, Card, Tag } from "antd";
import {
  TeamOutlined,
  GiftOutlined,
  WalletOutlined,
  ShopOutlined,
  BarChartOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { asset, source } from "../demo/fixtures";
import { cards, flow, shots, boundary } from "../demo/copy";
const icons = [
  TeamOutlined,
  GiftOutlined,
  WalletOutlined,
  ShopOutlined,
  BarChartOutlined,
];
export function PublicHeader() {
  return (
    <header className="public-header">
      <Link className="brand" to="/">
        <img src={asset("bank-mark.svg")} alt="渝惠项目标识" />
        渝惠
      </Link>
      <nav>
        <Link to="/demo/overview">交互演示</Link>
        <Link to="/screenshots">真实系统截图</Link>
        <a href={source} target="_blank" rel="noreferrer">
          源码 ↗
        </a>
      </nav>
    </header>
  );
}
export default function Landing() {
  return (
    <>
      <PublicHeader />
      <main className="landing">
        <section className="hero">
          <div>
            <Tag color="red">交互式合成数据演示 · 无需登录</Tag>
            <h1>渝惠</h1>
            <h2>零售客户经营与场景权益平台</h2>
            <p className="lead">
              把一次客户经营活动，从选人、配置权益和预算，到领取、核销和经营复盘，完整跑一遍。
            </p>
            <p className="muted">
              所有客户、商户、交易和经营结果均为合成演示数据，不连接任何真实银行系统。
            </p>
            <div className="actions">
              <Link to="/demo/overview">
                <Button
                  size="large"
                  type="primary"
                  icon={<ArrowRightOutlined />}
                >
                  开始交互演示
                </Button>
              </Link>
              <Button
                size="large"
                onClick={() =>
                  document
                    .getElementById("understand")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                30 秒看懂
              </Button>
              <a href={source}>查看源码 ↗</a>
            </div>
          </div>
          <div className="hero-aside">
            <span className="eyebrow">一次经营活动，三个关键判断</span>
            <h3>
              钱什么时候
              <br />
              才算真正花掉？
            </h3>
            <ol>
              <li>
                <strong>领取</strong>
                <span>先预占，承诺给客户</span>
              </li>
              <li>
                <strong>核销</strong>
                <span>转实扣，成为实际成本</span>
              </li>
              <li>
                <strong>到期</strong>
                <span>未使用，释放预占预算</span>
              </li>
            </ol>
            <div className="aside-note">停止投放 ≠ 权益履约完成</div>
          </div>
        </section>
        <section id="understand">
          <p className="eyebrow">从一次经营活动说起</p>
          <h2>30 秒看懂渝惠</h2>
          <div className="five-cards">
            {cards.map(([title, text], i) => {
              const Icon = icons[i];
              return (
                <Card key={title}>
                  <Icon className="card-icon" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Card>
              );
            })}
          </div>
        </section>
        <section>
          <h2>一条业务闭环</h2>
          <div className="flow">
            {flow.map((x, i) => (
              <div key={x}>
                <small>{String(i + 1).padStart(2, "0")}</small>
                {x}
                <span>→</span>
              </div>
            ))}
          </div>
          <p className="muted">
            先观察并留存客群；正式经营名单在复核发布时冻结。审核什么，就执行什么。
          </p>
        </section>
        <section className="demo-entry">
          <div>
            <p className="eyebrow">从经营端，到客户，再到商户</p>
            <h2>亲手走完这次活动</h2>
            <p>
              七个步骤，预设好全部重要字段。领取一张券、核销一次，再看预算和经营复盘如何变化。
            </p>
          </div>
          <Link to="/demo/overview">
            <Button type="primary" size="large">
              进入交互演示
            </Button>
          </Link>
        </section>
        <section>
          <div className="section-heading">
            <h2>真实系统截图预览</h2>
            <Link to="/screenshots">查看全部 7 张 →</Link>
          </div>
          <div className="preview-grid">
            {[shots[0], shots[6]].map(([file, title, caption]) => (
              <Link to="/screenshots" key={file}>
                <img src={asset("screenshots/" + file)} alt={title} />
                <h3>{title}</h3>
                <p>{caption}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="boundary">
          <h2>Synthetic Demo 边界</h2>
          <p>
            {boundary}{" "}
            交互按钮回放预设流程，不产生实际交易；观察结果不代表真实经营业绩或营销因果效果。
          </p>
        </section>
        <section className="source">
          <h2>完整实现，保留在源码中</h2>
          <p>后端、前端、数据库初始化与工程验收记录均可查看。</p>
          <a href={source} target="_blank" rel="noreferrer">
            <Button>查看源码 ↗</Button>
          </a>
        </section>
      </main>
      <footer>渝惠 · 零售客户经营与场景权益平台</footer>
    </>
  );
}
