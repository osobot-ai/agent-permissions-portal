"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { Hex } from "viem";
import { RequestExecutionPermissionsReturnType } from "@metamask/smart-accounts-kit/actions";
import { type Delegation, getDelegationHash, storeDelegation } from "@/lib/storage";

export type Permission = NonNullable<RequestExecutionPermissionsReturnType>[number];

interface StoredDelegationInfo {
  hash: Hex;
  delegation: Delegation;
}

interface PermissionContextType {
  permission: Permission | null;
  storedDelegations: StoredDelegationInfo[];
  isSaving: boolean;
  saveError: string | null;
  savePermission: (permission: Permission) => Promise<void>;
  removePermission: () => void;
}

export const PermissionContext = createContext<PermissionContextType>({
  permission: null,
  storedDelegations: [],
  isSaving: false,
  saveError: null,
  savePermission: async () => {},
  removePermission: () => {},
});

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [storedDelegations, setStoredDelegations] = useState<StoredDelegationInfo[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const savePermission = useCallback(async (perm: Permission) => {
    setPermission(perm);
    setIsSaving(true);
    setSaveError(null);

    const apiKey = process.env.NEXT_PUBLIC_STORAGE_API_KEY;
    const apiKeyId = process.env.NEXT_PUBLIC_STORAGE_API_KEY_ID;

    if (!apiKey || !apiKeyId) {
      setSaveError("Storage API credentials not configured. Set NEXT_PUBLIC_STORAGE_API_KEY and NEXT_PUBLIC_STORAGE_API_KEY_ID in .env.local");
      setIsSaving(false);
      return;
    }

    try {
      // Decode delegations from the permission context
      let delegations: Delegation[];

      try {
        const utils = await import("@metamask/smart-accounts-kit/utils");
        const decoded = utils.decodeDelegations(perm.context);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delegations = decoded as any as Delegation[];
      } catch {
        console.warn("decodeDelegations not available, attempting to parse context directly");
        // If decodeDelegations isn't available, try parsing the context as JSON
        try {
          const parsed = JSON.parse(perm.context);
          delegations = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          throw new Error("Could not decode delegations from permission context");
        }
      }

      // Store each delegation in the storage service
      const stored: StoredDelegationInfo[] = [];
      for (const delegation of delegations) {
        const hash = await storeDelegation(delegation, apiKey, apiKeyId);
        stored.push({ hash, delegation });
      }

      setStoredDelegations(stored);
    } catch (error) {
      console.error("Error storing delegation:", error);
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  }, []);

  const removePermission = () => {
    setPermission(null);
    setStoredDelegations([]);
    setSaveError(null);
  };

  return (
    <PermissionContext.Provider
      value={{
        permission,
        storedDelegations,
        isSaving,
        saveError,
        savePermission,
        removePermission,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionContext);
};
