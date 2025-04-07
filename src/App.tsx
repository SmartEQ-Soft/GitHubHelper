import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Cameras from "./pages/Cameras";
import Records from "./pages/Records";
import Templates from "./pages/Templates";
import IO from "./pages/IO";
import Settings from "./pages/Settings";
import SlaveDevices from "./pages/SlaveDevices";
import Login from "./pages/Login";
import AutoLoginProvider from "./components/AutoLoginProvider";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="movita-theme">
      <Router>
        <AutoLoginProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="cameras" element={<Cameras />} />
              <Route path="records" element={<Records />} />
              <Route path="templates" element={<Templates />} />
              <Route path="io" element={<IO />} />
              <Route path="settings" element={<Settings />} />
              <Route path="ecs" element={<SlaveDevices />} />
            </Route>
          </Routes>
        </AutoLoginProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
