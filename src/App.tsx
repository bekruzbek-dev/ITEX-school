import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import { Spinner } from "./components/ui";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Register from "./pages/Register";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Projects from "./pages/Projects";
import Achievements from "./pages/Achievements";
import Contact from "./pages/Contact";

const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ApplicationsAdmin = lazy(() => import("./pages/admin/ApplicationsAdmin"));
const ContentAdmin = lazy(() => import("./pages/admin/ContentAdmin"));
const SettingsAdmin = lazy(() => import("./pages/admin/SettingsAdmin"));
const AccountAdmin = lazy(() => import("./pages/admin/AccountAdmin"));

function NotFound() {
  return (
    <div className="container" style={{ padding: "6rem 0", textAlign: "center" }}>
      <h1>404</h1>
      <p className="muted">Bunday sahifa topilmadi.</p>
      <Link to="/" className="btn btn-primary">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/register" element={<Register />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/achievements" element={<Achievements />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<ApplicationsAdmin />} />
          <Route path="courses" element={<ContentAdmin kind="courses" />} />
          <Route path="news" element={<ContentAdmin kind="news" />} />
          <Route path="projects" element={<ContentAdmin kind="projects" />} />
          <Route path="achievements" element={<ContentAdmin kind="achievements" />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="account" element={<AccountAdmin />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
