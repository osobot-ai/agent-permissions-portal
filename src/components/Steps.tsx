"use client";

import { useEffect, useState } from "react";
import AgentSetup from "@/components/CreateSessionAccount";
import GrantPermissionsButton from "./GrantPermissionsButton";
import DelegationSaved from "./DelegationSaved";
import { useAgentConfig } from "@/providers/SessionAccountProvider";
import { usePermissions } from "@/providers/PermissionProvider";
import { useChain } from "@/providers/AppProvider";
import { Loader2 } from "lucide-react";

export default function Steps() {
  const [step, setStep] = useState<number>(1);
  const { agentAddress } = useAgentConfig();
  const { permission, savedPath, isSaving, saveError } = usePermissions();
  const { chain } = useChain();

  useEffect(() => {
    if (permission && agentAddress) {
      setStep(3);
    } else if (agentAddress) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [agentAddress, permission]);

  return (
    <div className="max-w-4xl mx-auto p-3 space-y-8">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[
          { n: 1, label: "Configure" },
          { n: 2, label: "Grant" },
          { n: 3, label: "Done" },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  n <= step
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                {n}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
            {n < 3 && (
              <div
                className={`w-8 h-0.5 mb-5 ${
                  n < step ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Chain badge */}
      <div className="flex justify-center">
        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          {chain.name}
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-6 flex flex-col gap-4 items-center justify-center">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 max-w-lg text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Enter your agent&apos;s wallet address and select the token to delegate.
              MetaMask will prompt you to approve the permission in the next step.
            </p>
          </div>
          <AgentSetup />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 flex flex-col gap-4 items-center justify-center">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 max-w-lg text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Grant your agent permission to spend <strong>up to 10 tokens per day</strong> on
              your behalf. MetaMask will prompt you to approve.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The delegation will be saved locally for your agent to redeem via gator-cli.
            </p>
          </div>
          <GrantPermissionsButton />
        </div>
      )}

      {step === 3 && (
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
