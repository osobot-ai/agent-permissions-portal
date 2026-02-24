"use client";

import { useAgentConfig } from "@/providers/SessionAccountProvider";
import { useChain } from "@/providers/AppProvider";
import { ExternalLink } from "lucide-react";

export default function WalletInfoContainer() {
  const { agentAddress, tokenAddress } = useAgentConfig();
  const { chain } = useChain();

  if (!agentAddress) return null;

  const explorer = chain.blockExplorers?.default?.url;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Agent (Delegate)</h3>
          <div className="flex items-center gap-2">
            <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">
              {`${agentAddress.slice(0, 6)}...${agentAddress.slice(-4)}`}
            </p>
            {explorer && (
              <a href={`${explorer}/address/${agentAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Token</h3>
          <div className="flex items-center gap-2">
            <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">
              {`${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`}
            </p>
            {explorer && (
              <a href={`${explorer}/token/${tokenAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">{chain.name}</p>
        </div>
      </div>
    </div>
  );
}
