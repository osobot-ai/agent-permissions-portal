"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { RequestExecutionPermissionsReturnType } from "@metamask/smart-accounts-kit/actions";

export type Permission = NonNullable<RequestExecutionPermissionsReturnType>[number];

interface DelegationFile {
  version: string;
  delegations: Array<{
    hash: string;
    delegation: Record<string, unknown>;
  }>;
}

interface PermissionContextType {
  permission: Permission | null;
  delegationFile: DelegationFile | null;
  savedPath: string | null;
  isSaving: boolean;
  saveError: string | null;
  savePermission: (permission: Permission) => Promise<void>;
  fetchPermission: () => Permission | null;
  removePermission: () => void;
}

export const PermissionContext = createContext<PermissionContextType>({
  permission: null,
  delegationFile: null,
  savedPath: null,
  isSaving: false,
  saveError: null,
  savePermission: async () => {},
  fetchPermission: () => null,
  removePermission: () => {},
});

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [delegationFile, setDelegationFile] = useState<DelegationFile | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const savePermission = useCallback(async (perm: Permission) => {
    setPermission(perm);
    setIsSaving(true);
    setSaveError(null);

    try {
      // Try to decode delegations from the permission context
      // The context field contains encoded delegations from the 7715 response
      let delegationData: DelegationFile;

      try {
        // Try importing decodeDelegations and getDelegationHashOffchain
        const utils = await import("@metamask/smart-accounts-kit/utils");
        const { decodeDelegations, getDelegationHashOffchain } = utils;

        const delegations = decodeDelegations(perm.context);

        delegationData = {
          version: "0x1",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delegations: delegations.map((d: any) => ({
            hash: getDelegationHashOffchain(d),
            delegation: d,
          })),
        };
      } catch {
        // If decodeDelegations is not available in this version,
        // fall back to saving the raw permission context
        console.warn("decodeDelegations not available, saving raw permission data");
        delegationData = {
          version: "0x1",
          delegations: [{
            hash: "0x0",
            delegation: perm as unknown as Record<string, unknown>,
          }],
        };
      }

      setDelegationFile(delegationData);

      // Save to disk via API route
      const res = await fetch("/api/save-delegation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(delegationData),
      });

      const result = await res.json();
      if (result.success) {
        setSavedPath(result.path);
      } else {
        setSaveError(result.error || "Failed to save delegation");
      }
    } catch (error) {
      console.error("Error saving delegation:", error);
      setSaveError(String(error));
    } finally {
      setIsSaving(false);
    }
  }, []);

  const fetchPermission = () => permission;

  const removePermission = () => {
    setPermission(null);
    setDelegationFile(null);
    setSavedPath(null);
    setSaveError(null);
  };

  return (
    <PermissionContext.Provider
      value={{
        permission,
        delegationFile,
        savedPath,
        isSaving,
        saveError,
        savePermission,
        fetchPermission,
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
