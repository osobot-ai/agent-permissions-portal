"use client";

import { useEffect, useState } from "react";
import ConnectButton from "@/components/ConnectButton";
import CreateSessionAccountButton from "@/components/CreateSessionAccount";
import GrantPermissionsButton from "./GrantPermissionsButton";
import DelegationSaved from "./DelegationSaved";
import { useSessionAccount } from "@/providers/SessionAccountProvider";
import { usePermissions } from "@/providers/PermissionProvider";
import { useAccount, useChainId } from "wagmi";
import { Loader2 } from "lucide-react";

export default function Steps() {
  const [step, setStep] = useState<number>(1);
  const { sessionAccount } = useSessionAccount();
  const { permission, savedPath, isSaving, saveError } = usePermissions();
  const { isConnected, chainId: connectedChainId } = useAccount();
  const currentChainId = useChainId();

  useEffect(() => {
    if (!isConnected) {
      setStep(1);
      return;
    }

    if (permission && sessionAccount) {
      setStep(4);
    } else if (sessionAccount) {
      setStep(3);
    } else if (isConnected && connectedChainId === currentChainId) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [sessionAccount, permission, isConnected, connectedChainId, currentChainId]);

  return (
    <div className="max-w-4xl mx-auto p-3 space-y-8">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s <= step
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`w-8 h-0.5 ${
                  s < step ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 flex flex-col gap-4 items-center justify-center">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 max-w-lg text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Connect your MetaMask wallet. Your account must be upgraded to a{" "}
              <a
                href="https://support.metamask.io/configure/accounts/switch-to-or-revert-from-a-smart-account/"
                className="text-blue-500 hover:text-blue-400 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Smart Account
              </a>{" "}
              to grant permissions.
            </p>
          </div>
          <ConnectButton />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 flex flex-col gap-4 items-center justify-center">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 max-w-lg text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Create a session account for your AI agent. This is the account that will receive
              the delegated permissions.
            </p>
          </div>
          <CreateSessionAccountButton />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 flex flex-col gap-4 items-center justify-center">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 max-w-lg text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Grant your agent permission to spend <strong>up to 10 USDC per day</strong> on
              your behalf. MetaMask will prompt you to approve.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The delegation will be saved locally so your agent can redeem it via gator-cli.
            </p>
          </div>
          <GrantPermissionsButton />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          {isSaving && (
            <div className="flex items-center justify-center gap-3 p-6">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-gray-600 dark:text-gray-300">Saving delegation to disk...</span>
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 p-4 rounded-lg text-red-700 dark:text-red-300">
              Error saving delegation: {saveError}
            </div>
          )}

          {savedPath && <DelegationSaved filePath={savedPath} />}
        </div>
      )}
    </div>
  );
}
