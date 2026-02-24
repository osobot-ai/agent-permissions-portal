"use client";

import { useState } from "react";
import { createWalletClient, custom, parseUnits } from "viem";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { useAgentConfig } from "@/providers/SessionAccountProvider";
import { usePermissions } from "@/providers/PermissionProvider";
import { useChain } from "@/providers/AppProvider";
import { Loader2, CheckCircle } from "lucide-react";
import Button from "@/components/Button";

export default function GrantPermissionsButton() {
  const { agentAddress, tokenAddress } = useAgentConfig();
  const { savePermission } = usePermissions();
  const { chain } = useChain();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdjustmentAllowed, setIsAdjustmentAllowed] = useState(true);

  const handleGrantPermissions = async () => {
    if (!agentAddress) {
      setError("Agent address not set");
      return;
    }

    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = createWalletClient({
        chain,
        transport: custom(window.ethereum),
      }).extend(erc7715ProviderActions());

      const currentTime = Math.floor(Date.now() / 1000);
      const expiry = currentTime + 24 * 60 * 60 * 30; // 30 days

      const permissions = await walletClient.requestExecutionPermissions([{
        chainId: chain.id,
        expiry,
        to: agentAddress,
        permission: {
          type: "erc20-token-periodic",
          data: {
            tokenAddress,
            periodAmount: parseUnits("10", 6),
            periodDuration: 86400,
            justification: `Permission for AI agent to spend tokens daily`,
          },
        },
        isAdjustmentAllowed,
      }]);
      await savePermission(permissions[0]);
    } catch (err) {
      console.error("Error granting permissions:", err);
      setError(err instanceof Error ? err.message : "Failed to grant permissions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="adjustment-allowed"
          checked={isAdjustmentAllowed}
          onChange={(e) => setIsAdjustmentAllowed(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <label htmlFor="adjustment-allowed" className="text-sm font-medium">
          Allow user to adjust the requested permission amount
        </label>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 p-3 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <Button
        className="w-full space-x-2"
        onClick={handleGrantPermissions}
        disabled={isLoading}
      >
        <span>
          {isLoading ? "Requesting Permissions..." : "Grant Token Permission to Agent"}
        </span>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
