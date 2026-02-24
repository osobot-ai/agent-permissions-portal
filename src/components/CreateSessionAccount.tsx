"use client";

import { useState } from "react";
import { useSessionAccount } from "@/providers/SessionAccountProvider";
import { ArrowRight } from "lucide-react";
import Button from "@/components/Button";

export default function SetAgentAddress() {
  const { setAgentAddress, error } = useSessionAccount();
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    setAgentAddress(input);
  };

  return (
    <div className="space-y-4 w-full max-w-lg">
      <div>
        <label
          htmlFor="agent-address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Agent Wallet Address (gator-cli)
        </label>
        <input
          id="agent-address"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="0x..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
      <Button className="w-full space-x-2" onClick={handleSubmit}>
        <span>Set Agent Address</span>
        <ArrowRight className="w-5 h-5" />
      </Button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">gator-cli account</code> to get your agent&apos;s address
      </p>
    </div>
  );
}
