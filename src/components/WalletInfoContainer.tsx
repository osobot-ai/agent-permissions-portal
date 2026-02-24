"use client";

import { useSessionAccount } from "@/providers/SessionAccountProvider";
import WalletInfo from "./WalletInfo";
import { useAccount } from "wagmi";

export default function WalletInfoContainer() {
  const { agentAddress } = useSessionAccount();
  const { address } = useAccount();

  return (
    <div className="w-full max-w-4xl mx-auto p-3 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {address && (
          <WalletInfo address={address} label="Your Account (Delegator)" />
        )}
        {agentAddress && (
          <WalletInfo address={agentAddress} label="Agent Account (Delegate)" />
        )}
      </div>
    </div>
  );
}
