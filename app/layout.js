import React from "react";
import "./globals.css";
import Link from 'next/link';

export const metadata = {
  title: "Survey Application",
  description: "Manage and analyze surveys",
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body>
        {/* <nav className="nav-container">
          <div className="container">
            <div className="button-group">
              <Link href="/answer-survey" className="nav-link">
                Answer Survey
              </Link>
              <Link href="/manage-surveys" className="nav-link">
                Manage Surveys
              </Link>
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </div>
          </div>
        </nav> */}
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
