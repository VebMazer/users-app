import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import appApi from "./api/apps";

import { LocalStorageSync } from "./utils/LocalStorageSync";
import { ThemeProvider } from "./components/theme-provider";
import { useStore } from "./utils/store";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";
import Apps from "./pages/Apps";
import AppForm from "./pages/AppForm";
import Users from "./pages/Users";
import Confirmed from "./components/ui/Confirmed";

import { Navbar } from "./components/header";

export default function App() {
  const { setPublicApps } = useStore();

  // Load all apps from the server and save them to the state.
  const loadPublicApps = async () => {
    try {
      const apps = await appApi.getAllPublic();
      setPublicApps(apps);
    } catch (exception) {
      console.log("exception: ", exception);
    }
  };

  useEffect(() => {
    loadPublicApps();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LocalStorageSync />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/confirmed" element={<Confirmed />} />

          <Route path="/resetpassword" element={<Reset />} />

          <Route path="/apps" element={<Apps />} />
          <Route path="/apps/:id" element={<AppForm />} />
          <Route path="/apps/add" element={<AppForm />} />

          <Route path="/users" element={<Users />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
