import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./theme";
import { ToastProvider } from "./components/Toast";
import Home from "./pages/Home";
import RoomPage from "./pages/RoomPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:sessionId" element={<RoomPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
