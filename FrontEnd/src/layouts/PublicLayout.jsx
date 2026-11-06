import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CookieBanner from "../components/layout/CookieBanner";
export default function PublicLayout() {
    return (
        <div className="public-layout">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
            <CookieBanner /> {/* 2. Inséré ici */}
        </div>
    );
}