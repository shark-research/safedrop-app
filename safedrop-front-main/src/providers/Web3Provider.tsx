"use client"

import React from "react";
import {
  connectorsForWallets,
  darkTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  type CreateConnectorFn,
  WagmiProvider,
  createConfig,
  http,
} from 'wagmi';
import {
  mainnet, arbitrum, bsc, polygon, optimism, base, linea,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import '@rainbow-me/rainbowkit/styles.css';
import {
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';


export const wagmiConnectors: () => CreateConnectorFn[] = () => {
  // Only create connectors on client-side to avoid SSR issues
  if (typeof window === "undefined") {
    return [];
  }

  return connectorsForWallets(
    [
      {
        groupName: 'Installed',
        wallets: [
          injectedWallet,
          rabbyWallet,
          phantomWallet,
          okxWallet,
        ],
      },
      {
        groupName: 'Recommended',
        wallets: [
          metaMaskWallet,
          walletConnectWallet,
          coinbaseWallet,
          ledgerWallet,
          rainbowWallet,
          safeWallet,
        ],
      },
    ],
    {
      appName: 'SafeDrop',
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    }
  );
};

const supportedChains = [bsc, mainnet, polygon, optimism, arbitrum, base, linea] as const;

export const config = createConfig({
  chains: supportedChains,
  connectors: wagmiConnectors(),
  transports: supportedChains.reduce(
    (acc, chain) => ({
      ...acc,
      [chain.id]: http(),
    }),
    {} as Record<number, ReturnType<typeof http>>,
  ),
  ssr: false,
});

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#2dd4bf',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
