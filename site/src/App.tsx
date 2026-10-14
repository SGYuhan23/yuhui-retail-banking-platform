import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Demo from "./pages/Demo";
import Screenshots from "./pages/Screenshots";
export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#a92e35",
          borderRadius: 7,
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
        },
      }}
    >
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/demo"
            element={<Navigate to="/demo/overview" replace />}
          />
          <Route path="/demo/:section" element={<Demo />} />
          <Route path="/screenshots" element={<Screenshots />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}
