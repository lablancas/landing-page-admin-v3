import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";
import { Toaster } from "@/components/ui/sonner";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { auth0 } from "@/lib/auth-client";

export const metadata: Metadata = {
  title: "Next.js + MongoDB + Better Auth",
  description: "Use MongoDB with Next.js and Better Auth for authentication",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body>
        <Auth0Provider user={session?.user}>{children}</Auth0Provider>
        <Toaster />
      </body>
    </html>
  );
}
