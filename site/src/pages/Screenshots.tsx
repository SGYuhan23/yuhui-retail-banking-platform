import { Image } from "antd";
import { PublicHeader } from "./Landing";
import { shots } from "../demo/copy";
import { asset } from "../demo/fixtures";
export default function Screenshots() {
  return (
    <>
      <PublicHeader />
      <main className="screenshots">
        <h1>真实系统截图</h1>
        <p>
          以下截图来自完整本地系统；交互演示使用相同业务流程和固定合成数据在浏览器中静态回放。
        </p>
        <p className="muted">
          履约进行中的截图来自独立验收活动，最终复盘来自固定案例；截图保留原始内容。
        </p>
        <Image.PreviewGroup>
          {shots.map(([file, title, caption], i) => (
            <section key={file}>
              <h2>
                {i + 1}. {title}
              </h2>
              <Image src={asset("screenshots/" + file)} alt={title} />
              <p>{caption}</p>
            </section>
          ))}
        </Image.PreviewGroup>
      </main>
    </>
  );
}
