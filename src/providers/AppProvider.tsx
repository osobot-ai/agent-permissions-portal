"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { Chain } from "viem";
import { base, sepolia, baseSepolia } from "viem/chains";
import { PermissionProvider } from "@/providers/PermissionProvider";
import { AgentConfigProvider } from "@/providers/SessionAccountProvider";

const CHAINS: Record<string, Chain> = {
  base,
  sepolia,
  "base-sepolia": baseSepolia,
};

const DEFAULT_CHAIN = base;

interface ChainContextType {
  chain: Chain;
}

const ChainContext = createContext<ChainContextType>({ chain: DEFAULT_CHAIN });

export const useChain = () => useContext(ChainContext);

export function AppProvider({ children }: { children: ReactNode }) {
  const [chain, setChain] = useState<Chain>(DEFAULT_CHAIN);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chainParam = params.get("chain")?.toLowerCase();
    if (chainParam && CHAINS[chainParam]) {
      setChain(CHAINS[chainParam]);
    }
  }, []);

  return (
    <ChainContext.Provider value={{ chain }}>
      <AgentConfigProvider>
        <PermissionProvider>
          {children}
        </PermissionProvider>
      </AgentConfigProvider>
    </ChainContext.Provider>
  );
}
