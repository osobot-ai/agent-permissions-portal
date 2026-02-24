"use client";

import { createContext, useState, useContext } from "react";
import { Address, isAddress } from "viem";

interface AgentAddressContext {
  agentAddress: Address | null;
  setAgentAddress: (address: string) => boolean;
  error: string | null;
}

export const AgentAddressContext = createContext<AgentAddressContext>({
  agentAddress: null,
  setAgentAddress: () => false,
  error: null,
});

export const SessionAccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [agentAddress, setAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAgentAddress = (input: string): boolean => {
    setError(null);
    if (!input.trim()) {
      setError("Address is required");
      return false;
    }
    if (!isAddress(input.trim())) {
      setError("Invalid Ethereum address");
      return false;
    }
    setAddress(input.trim() as Address);
    return true;
  };

  return (
    <AgentAddressContext.Provider
      value={{ agentAddress, setAgentAddress, error }}
    >
      {children}
    </AgentAddressContext.Provider>
  );
};

export const useSessionAccount = () => {
  return useContext(AgentAddressContext);
};
