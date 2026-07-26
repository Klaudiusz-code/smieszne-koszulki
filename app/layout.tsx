import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: {
    default: "Śmieszne Koszulki – Koszulki, Bluzy, Kubki | Zamość",
    template: "%s | Śmieszne Koszulki",
  },
  description:
    "Profesjonalny druk odzieży w Zamościu. Koszulki, bluzy i gadżety z własnym nadrukiem. Wysyłka 24h.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body
        className={`${inter.className} bg-white text-gray-900 antialiased selection:bg-[#ddb745] selection:text-black`}
      >
        <CartProvider>
          <TopBar />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
