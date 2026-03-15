import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Text2Fluent | Speak your way to fluency",
  description: "Learn languages naturally by speaking aloud with AI-generated scenarios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <nav className="glass-nav">
            <div className="container">
              {/* Empty Header */}
            </div>
          </nav>
          {children}
          <footer className="main-footer">
            <div className="container">
              <p>© 2026 Text2Fluent.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
