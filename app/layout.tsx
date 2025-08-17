import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning // Add this to suppress hydration warnings
    >
      <head>
        <style>{`
          :root {
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Script
          src="https://www.paypal.com/sdk/js?client-id=AeK2GE53XcONEKKRB33IFEW6sDmJrywHU_oBwWlW3EFpXvxqsE-y8DvMcGCtzA2RAB-1ovDRHgeIsSRR&currency=USD&intent=capture&enable-funding=venmo,paylater"
          strategy="lazyOnload" // Changed to lazyOnload for better performance
        />
      </body>
    </html>
  );
}
