import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ title, children }) {
    return (
        <>
            <Head>
                <title>{title ? `${title} - Code Insights` : 'Code Insights'}</title>
            </Head>

            <div className="flex flex-col min-h-screen">
                <Header />

                <main className="flex flex-1">
                    {children}
                </main>

                <div className="">
                    <Footer />
                </div>
            </div>
        </>
    );
}