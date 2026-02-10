import type { Metadata } from "next";
import { Nunito, Great_Vibes } from "next/font/google"; // Import Google Fonts
import "./globals.css";
import { SecurityModal } from "@/components/SecurityModal";
import { cookies } from "next/headers";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Akhil's Love Coupons 💖",
  description: "A digital love letter made with ❤️",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("auth_token");

  return (
    <html lang="en" className={`${nunito.variable} ${greatVibes.variable}`}>
      {/* Add fonts to body via variable class names */}
      <body className="antialiased font-sans bg-background text-foreground min-h-screen flex flex-col">
        <SecurityModal isAuthenticated={isAuthenticated} />
        {children}
      </body>
    </html>
  );
}
