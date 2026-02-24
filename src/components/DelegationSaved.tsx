"use client";

import { CheckCircle } from "lucide-react";

interface DelegationSavedProps {
  filePath: string;
}

export default function DelegationSaved({ filePath }: DelegationSavedProps) {
  return (
    <div className="w-full mx-auto p-3 max-w-4xl">
      <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-600 p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">
            Delegation Saved
          </h3>
        </div>
        <p className="text-green-700 dark:text-green-300 mb-3">
          The delegation has been saved to disk. Your agent can now redeem it via gator-cli.
        </p>
        <div className="bg-green-100 dark:bg-green-900/50 rounded-md p-3 font-mono text-sm text-green-800 dark:text-green-300 break-all">
          {filePath}
        </div>
        <div className="mt-4 bg-gray-900 rounded-md p-4 font-mono text-sm text-green-400">
          <p className="text-gray-500 mb-1"># Redeem the delegation with gator-cli:</p>
          <p>$ gator-cli redeem --delegation default</p>
        </div>
      </div>
    </div>
  );
}
