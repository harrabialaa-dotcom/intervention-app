import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valeo Tracking Involvement",
  description: "Digital Authorization System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-wrapper">
          <header className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Request for an Involvement</h1>
              <p className="hero-subtitle">Digital Authorization System</p>
            </div>
          </header>
          
          <div className="app-container">
            <nav className="navbar">
              <div className="nav-top">
                <img src="/logo2.png" alt="Valeo" className="nav-logo" />
              </div>
              <div className="nav-bottom">
                <span>Authorizations</span>
              </div>
            </nav>
            <main>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
