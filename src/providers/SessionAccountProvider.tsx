"use client";

import { createContext, useState, useContext } from "react";
import { Address, isAddress } from "viem";

// $OSO token on Base
const DEFAULT_TOKEN = "0xc78fabc2cb5b9cf59e0af3da8e3bc46d47753a4e";

interface AgentConfigContextType {
  agentAddress: Address | null;
  tokenAddress: Address;
  setAgentAddress: (address: string) => boolean;
  setTokenAddress: (address: string) => boolean;
  addressError: string | null;
  tokenError: string | null;
}

const AgentConfigContext = createContext<AgentConfigContextType>({
  agentAddress: null,
  tokenAddress: DEFAULT_TOKEN as Address,
  setAgentAddress: () => false,
  setTokenAddress: () => false,
  addressError: null,
  tokenError: null,
});

export const AgentConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [agentAddress, setAddress] = useState<Address | null>(null);
  const [tokenAddress, setToken] = useState<Address>(DEFAULT_TOKEN as Address);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const setAgentAddress = (input: string): boolean => {
    setAddressError(null);
    if (!input.trim()) {
      setAddressError("Address is required");
      return false;
    }
    if (!isAddress(input.trim())) {
      setAddressError("Invalid Ethereum address");
      return false;
    }
    setAddress(input.trim() as Address);
    return true;
  };

  const setTokenAddress = (input: string): boolean => {
    setTokenError(null);
    if (!input.trim()) {
      setTokenError("Token address is required");
      return false;
    }
    if (!isAddress(input.trim())) {
      setTokenError("Invalid token address");
      return false;
    }
    setToken(input.trim() as Address);
    return true;
  };

  return (
    <AgentConfigContext.Provider
      value={{ agentAddress, tokenAddress, setAgentAddress, setTokenAddress, addressError, tokenError }}
    >
      {children}
    </AgentConfigContext.Provider>
  );
};

export const useAgentConfig = () => {
  return useContext(AgentConfigContext);
};

// Keep backward compat alias
export const useSessionAccount = useAgentConfig;
