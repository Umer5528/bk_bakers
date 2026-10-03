import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import MobileTabBar from "../components/layout/MobileTabBar";
import FloatingWhatsApp from "../components/common/FloatingWhatsApp";

const MainLayout = () => (
  <div className="flex min-h-screen flex-col bg-cream-100">
    <Navbar />
    {/* pb-20 reserves room above the fixed mobile tab bar so it never
       covers the last piece of content or a sticky action button. */}
    <main className="flex-1 pb-20 md:pb-0">
      <Outlet />
    </main>
    <Footer />
    <MobileTabBar />
    <FloatingWhatsApp />
  </div>
);

export default MainLayout;
