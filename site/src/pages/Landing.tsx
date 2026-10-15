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
              <a href={source}>查看源码 ↗</a>
            </div>
          </div>
          <div className="hero-aside">
            <span className="eyebrow">一次经营活动，三个关键判断</span>
            <h3>
              一笔权益预算，
              <br />
              什么时候才算真正花掉？
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
          <h2>快速看懂渝惠</h2>
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
          <h3 className="flow-heading">一次活动怎么跑完</h3>
          <div className="flow">
            {flow.map((x, i) => (
              <div key={x}>
                <small>{String(i + 1).padStart(2, "0")}</small>
                {x}
                {i < flow.length - 1 && <span>→</span>}
              </div>
            ))}
          </div>
          <p className="muted">
            发布时冻结实际经营名单；核销形成实际成本，未使用权益到期释放预算；复盘后记录下一轮扩大、保持、缩减或停止。
          </p>
        </section>
        <section className="demo-entry">
          <div>
            <p className="eyebrow">从经营端，到客户，再到商户</p>
            <h2>亲手走完这次活动</h2>
            <p>
              七个步骤，体验一份权益从领取、核销到最终复盘的完整过程。
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
          <h2>演示说明</h2>
          <p>
            {boundary}
            页面中的客户、商户、交易和经营结果仅用于展示系统如何执行与复盘，不代表真实经营业绩或营销因果效果。
          </p>
        </section>
        <section className="source">
          <h2>查看完整项目实现</h2>
          <p>完整前后端源码、数据库初始化、运行说明和工程验收记录均可查看。</p>
          <a href={source} target="_blank" rel="noreferrer">
            <Button>查看源码 ↗</Button>
          </a>
        </section>
      </main>
      <footer>渝惠 · 零售客户经营与场景权益平台</footer>
    </>
  );
}
