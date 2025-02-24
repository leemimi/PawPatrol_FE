import { Outlet } from 'react-router-dom';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow pb-[88px]">
                <Outlet />
            </main>
            <footer className="fixed bottom-0 w-full z-50">
                <Footer />
            </footer>
        </div>
    );
};

export default Layout;