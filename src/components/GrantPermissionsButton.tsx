"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { useSessionAccount } from "@/providers/SessionAccountProvider";
import { usePermissions } from "@/providers/PermissionProvider";
import { Loader2, CheckCircle } from "lucide-react";
import Button from "@/components/Button";
import { useChainId, useWalletClient } from "wagmi";

// USDC on Sepolia
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export default function GrantPermissionsButton() {
  const { agentAddress } = useSessionAccount();
  const { savePermission } = usePermissions();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdjustmentAllowed, setIsAdjustmentAllowed] = useState<boolean>(true);

  const handleGrantPermissions = async () => {
    if (!agentAddress) {
      throw new Error("Agent address not set");
    }

    if (!walletClient) {
      throw new Error("Wallet client not connected");
    }

    setIsLoading(true);

    try {
      const client = walletClient.extend(erc7715ProviderActions());
      const currentTime = Math.floor(Date.now() / 1000);
      // 30 days
      const expiry = currentTime + 24 * 60 * 60 * 30;

      const permissions = await client.requestExecutionPermissions([{
        chainId,
        expiry,
        // The agent's gator-cli address is the delegate
        to: agentAddress,
        permission: {
          type: "erc20-token-periodic",
          data: {
            tokenAddress: USDC_ADDRESS,
            // 10 USDC (6 decimals)
            periodAmount: parseUnits("10", 6),
            // 1 day in seconds
            periodDuration: 86400,
            justification: "Permission for AI agent to spend up to 10 USDC per day",
          },
        },
        isAdjustmentAllowed,
      }]);
      await savePermission(permissions[0]);
    } catch (error) {
      console.error('Error granting permissions:', error);
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
      <Button
        className="w-full space-x-2"
        onClick={handleGrantPermissions}
        disabled={isLoading}
      >
        <span>
          {isLoading ? "Requesting Permissions..." : "Grant USDC Permission to Agent"}
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
