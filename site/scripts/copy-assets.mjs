import { cp, mkdir, rm } from "node:fs/promises";
const dest = new URL("../public/", import.meta.url);
await mkdir(dest, { recursive: true });
await rm(new URL("screenshots/", dest), { recursive: true, force: true });
await cp(
  new URL("../../yuhui-web/public/assets/bank-mark.svg", import.meta.url),
  new URL("bank-mark.svg", dest),
);
