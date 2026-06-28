import type { Metadata } from "next";
import { Sidebar } from "@/components/organisms/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecondBrain",
  description: "Your knowledge, connected",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="flex min-h-screen">
        <Sidebar />
        <div className="ml-60 flex-1 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
