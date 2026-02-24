import { type Hex, keccak256, encodeAbiParameters, hexToBytes, getAddress, toHex } from 'viem';

const DELEGATION_STORAGE_API_URL = 'https://passkeys.dev-api.cx.metamask.io/api/v0';

const DELEGATION_TYPEHASH: Hex = '0x88c1d2ecf185adf710588203a5f263f0ff61be0d33da39792cde19ba9aa4331e';
const CAVEAT_TYPEHASH: Hex = '0x80ad7e1b04ee6d994a125f4714ca0720908bd80ed16063ec8aee4b88e9253e2d';

interface Caveat {
  enforcer: Hex;
  terms: Hex;
}

export interface Delegation {
  delegate: Hex;
  delegator: Hex;
  authority: Hex;
  caveats: Caveat[];
  salt: Hex;
  signature: Hex;
}

function getCaveatHash(caveat: Caveat): Uint8Array {
  const termsHash = keccak256(hexToBytes(caveat.terms));
  const encoded = encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'address' }, { type: 'bytes32' }],
    [CAVEAT_TYPEHASH, caveat.enforcer, termsHash],
  );
  return hexToBytes(keccak256(encoded));
}

function getCaveatsArrayHash(caveats: Caveat[]): Hex {
  if (caveats.length === 0) {
    return keccak256(new Uint8Array(0));
  }
  const parts = caveats.map((c) => getCaveatHash(c));
  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }
  return keccak256(combined);
}

function jsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' || typeof value === 'number'
    ? toHex(value)
    : value;
}

export function getDelegationHash(delegation: Delegation): Hex {
  const salt = delegation.salt === '0x' ? 0n : BigInt(delegation.salt);

  const caveatsHash = getCaveatsArrayHash(
    delegation.caveats.map((c) => ({
      enforcer: getAddress(c.enforcer),
      terms: c.terms,
    })),
  );

  const encoded = encodeAbiParameters(
    [
      { type: 'bytes32' },
      { type: 'address' },
      { type: 'address' },
      { type: 'bytes32' },
      { type: 'bytes32' },
      { type: 'uint256' },
    ],
    [
      DELEGATION_TYPEHASH,
      getAddress(delegation.delegate),
      getAddress(delegation.delegator),
      delegation.authority,
      caveatsHash,
      salt,
    ],
  );

  return keccak256(encoded);
}

export async function storeDelegation(
  delegation: Delegation,
  apiKey: string,
  apiKeyId: string,
): Promise<Hex> {
  if (!delegation.signature || delegation.signature === '0x') {
    throw new Error('Delegation must be signed to be stored');
  }

  const expectedHash = getDelegationHash(delegation);

  const body = JSON.stringify(
    { ...delegation, metadata: [] },
    jsonReplacer,
    2,
  );

  const response = await fetch(
    `${DELEGATION_STORAGE_API_URL}/delegation/store?metadataCategory=*`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'x-api-key-id': apiKeyId,
        'Content-Type': 'application/json',
      },
      body,
    },
  );

  const data = await response.json();

  if (!response.ok || 'error' in data) {
    throw new Error(
      `Failed to store delegation: ${'error' in data ? data.error : response.statusText}`,
    );
  }

  if (data.delegationHash !== expectedHash) {
    console.warn(
      `Hash mismatch: API returned ${data.delegationHash}, expected ${expectedHash}`,
    );
  }

  return data.delegationHash;
}
