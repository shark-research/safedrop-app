import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { ReactNode } from "react";
import { SolanaProvider } from "@/providers/SolWalletProvider";

export const metadata: Metadata = {
  title: "SafeDrop - Airdrop Security Platform",
  description: "Safeguard your crypto with official wallet replacement and primary wallet protection",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SolanaProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </SolanaProvider>
      </body>
    </html>
  );
}
