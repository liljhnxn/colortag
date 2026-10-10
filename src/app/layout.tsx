import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ColorTag | Your Wallet. Your Color.",
  description:
    "Choose a color that represents you and save it on-chain with ColorTag on the Botchain Testnet.",
  keywords: ["ColorTag", "Web3", "Botchain", "Ethereum", "dApp", "Wallet Identity"],
  authors: [{ name: "ColorTag" }],
  openGraph: {
    title: "ColorTag | Your Wallet. Your Color.",
    description: "Save your personal color identity on-chain on Botchain Testnet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08090e] text-slate-100 antialiased min-h-screen selection:bg-purple-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
