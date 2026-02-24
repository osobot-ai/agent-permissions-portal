"use client";

import { CheckCircle } from "lucide-react";
import { Hex } from "viem";

interface DelegationSavedProps {
  delegations: { hash: Hex; delegation: unknown }[];
}

export default function DelegationSaved({ delegations }: DelegationSavedProps) {
  return (
    <div className="w-full mx-auto p-3 max-w-4xl">
      <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-600 p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">
            Delegation Stored
          </h3>
        </div>
        <p className="text-green-700 dark:text-green-300 mb-4">
          {delegations.length === 1
            ? "The delegation has been stored in the delegation storage service. Your agent can now fetch and redeem it via gator-cli."
            : `${delegations.length} delegations have been stored. Your agent can now fetch and redeem them via gator-cli.`}
        </p>

        {delegations.map((d, i) => (
          <div key={i} className="mb-3">
            <div className="bg-green-100 dark:bg-green-900/50 rounded-md p-3 font-mono text-sm text-green-800 dark:text-green-300 break-all">
              <span className="text-green-600 dark:text-green-400 text-xs">Hash:</span>{" "}
              {d.hash}
            </div>
          </div>
        ))}

        <div className="mt-4 bg-gray-900 rounded-md p-4 font-mono text-sm text-green-400 space-y-1">
          <p className="text-gray-500"># Your agent can now redeem via gator-cli:</p>
          <p>$ gator-cli redeem --action transfer-erc20 \</p>
          <p>    --token &lt;token_address&gt; --to &lt;recipient&gt; --amount &lt;amount&gt;</p>
        </div>
      </div>
    </div>
  );
}
