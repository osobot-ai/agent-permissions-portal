"use client";

import { useState } from "react";
import { useAgentConfig } from "@/providers/SessionAccountProvider";
import { ArrowRight } from "lucide-react";
import Button from "@/components/Button";

export default function AgentSetup() {
  const { setAgentAddress, setTokenAddress, tokenAddress, addressError, tokenError } = useAgentConfig();
  const [addressInput, setAddressInput] = useState("");
  const [tokenInput, setTokenInput] = useState(tokenAddress);
  const [showTokenEdit, setShowTokenEdit] = useState(false);

  const handleSubmit = () => {
    // Validate token first if edited
    if (showTokenEdit) {
      const tokenOk = setTokenAddress(tokenInput);
      if (!tokenOk) return;
    }
    setAgentAddress(addressInput);
  };

  return (
    <div className="space-y-5 w-full max-w-lg">
      <div>
        <label
          htmlFor="agent-address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Agent Wallet Address
        </label>
        <input
          id="agent-address"
          type="text"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="0x..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {addressError && (
          <p className="mt-1 text-sm text-red-500">{addressError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          The address that will receive the delegated permissions (e.g. your gator-cli account)
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Token
          </label>
          {!showTokenEdit ? (
            <button
              onClick={() => setShowTokenEdit(true)}
              className="text-xs text-blue-500 hover:text-blue-400 underline"
            >
              Change token
            </button>
          ) : (
            <button
              onClick={() => {
                setShowTokenEdit(false);
                setTokenInput(tokenAddress);
              }}
              className="text-xs text-gray-500 hover:text-gray-400 underline"
            >
              Cancel
            </button>
          )}
        </div>
        {showTokenEdit ? (
          <>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value as `0x${string}`)}
              placeholder="0x... (ERC-20 token address)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {tokenError && (
              <p className="mt-1 text-sm text-red-500">{tokenError}</p>
            )}
          </>
        ) : (
          <div className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-700 dark:text-gray-300">
            <span className="text-gray-500 dark:text-gray-400">$OSO</span>{" "}
            <span className="text-xs break-all">{tokenAddress}</span>
          </div>
        )}
      </div>

      <Button className="w-full space-x-2" onClick={handleSubmit}>
        <span>Continue</span>
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
