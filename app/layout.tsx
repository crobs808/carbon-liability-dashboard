import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Carbon Liability Dashboard",
  description: "Graphs included for carbon-based observers."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
