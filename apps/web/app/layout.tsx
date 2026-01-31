import "./globals.css";

import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${sora.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
