import { cp, mkdir } from "node:fs/promises";
const dest = new URL("../public/", import.meta.url);
await mkdir(dest, { recursive: true });
await cp(
  new URL("../../assets/screenshots/", import.meta.url),
  new URL("screenshots/", dest),
  { recursive: true },
);
await cp(
  new URL("../../yuhui-web/public/assets/bank-mark.svg", import.meta.url),
  new URL("bank-mark.svg", dest),
);
