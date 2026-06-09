import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "goodgtm",
  description: "good go to market.",
  openGraph: {
    title: "goodgtm",
    description: "good go to market.",
  },
};

// viewport-fit: cover lets the page (and the fixed WebGL background) extend
// edge-to-edge into the iOS safe areas — behind the notch/status bar and the
// bottom URL bar / home indicator. Without it iOS confines everything to the
// inset viewport, leaving black bars top and bottom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
