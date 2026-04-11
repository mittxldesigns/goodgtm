import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoodGTM",
  description: "Go-To-Market, Redefined",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://assets.calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
        <script
          src="https://assets.calendly.com/assets/external/widget.js"
          async
        />
      </head>
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
