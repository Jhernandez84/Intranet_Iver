import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeInit } from "../.flowbite-react/init";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Navbar from "./components/navbar/Navbar";

import { UserProvider } from "./context/UserProvider";
import { CompanyProvider } from "./context/CompanyProvider";
import { CompanyBranchesProvider } from "./context/CompanyBranchesProvider";
import { UserAccessProvider } from "./context/UserAccessProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Church Manager - IverChile",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // console.log("🌐 Sesión desde layout:", user);
  // console.log("❌ Error desde layout:", error);

  return (
    <UserProvider>
      <CompanyProvider>
        <UserAccessProvider>
          <CompanyBranchesProvider>
            <html lang="es" suppressHydrationWarning>
              <head>
                <ThemeModeScript />
              </head>
              <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
              >
                {/* Navbar fijo en la primera fila */}
                <div className="sticky top-0 z-50 h-[var(--navbar-h)]">
                  <Navbar />
                </div>

                {/* Contenido con scroll propio */}
                <main className="h-[calc(100vh-70px)] w-full bg-gray-500 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {/* Si tienes Sidebar/AppsMenu dentro del contenido, envuélvelos aquí */}
                  {/* <Sidebar /> / <AppsMenu /> si aplica */}
                  <div>{children}</div>
                </main>
              </body>
            </html>
          </CompanyBranchesProvider>
        </UserAccessProvider>
      </CompanyProvider>
    </UserProvider>
  );
}
