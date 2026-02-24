# Agent Permissions Portal — Demo App

## Purpose
Demo app for Ethereum Foundation livestream. Shows how a MetaMask extension user grants ERC-7715 scoped permissions to an AI agent via a dapp, and the agent can then use gator-cli to redeem those permissions.

## Key Flow
1. User connects MetaMask extension wallet (must be upgraded to Smart Account)
2. App creates a session account (agent's account)
3. User grants ERC-20 USDC periodic permission via `requestExecutionPermissions`
4. App decodes the returned delegations and saves them to `~/.gator-cli/delegations/default.json`
5. Ryan then opens a terminal and uses gator-cli to redeem the delegation

## Tech Stack
- Next.js 15 (already scaffolded from templated-gator-7715)
- `@metamask/smart-accounts-kit@0.4.0-beta.1` (UPGRADE from 0.3.0)
- wagmi, viem, tanstack/react-query
- Tailwind CSS v4
- Sepolia testnet

## Critical Changes from Template

### 1. Upgrade SAK to 0.4.0-beta.1
In package.json, change `@metamask/smart-accounts-kit` to `^0.4.0-beta.1`.

### 2. Change permission type to ERC-20 USDC
Instead of native-token-periodic, use `erc20-token-periodic`:
```ts
const permissions = await client.requestExecutionPermissions([{
  chainId,
  expiry,
  to: sessionAccount.address, // NOTE: in 0.4.0 the API uses `to` not `signer`
  permission: {
    type: "erc20-token-periodic",
    data: {
      tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
      periodAmount: parseUnits("10", 6), // 10 USDC
      periodDuration: 86400, // 1 day
      justification: "Permission for AI agent to spend up to 10 USDC per day",
    },
  },
  isAdjustmentAllowed: true,
}]);
```

### 3. API changes in 0.4.0-beta.1
The `requestExecutionPermissions` call in 0.4.0 uses `to` field instead of `signer` object. Check the docs:
- Old (0.3.0): `signer: { type: "account", data: { address: sessionAccount.address } }`
- New (0.4.0): `to: sessionAccount.address`

### 4. Save delegation to disk via API route
When permission is granted:
1. Decode delegations using `decodeDelegations` from `@metamask/smart-accounts-kit/utils`
2. POST to `/api/save-delegation` which writes to `~/.gator-cli/delegations/default.json`

The delegation file format should be:
```json
{
  "version": "0x1",
  "delegations": [
    {
      "hash": "0x...",
      "delegation": {
        "delegate": "0x...",
        "delegator": "0x...",
        "authority": "0x...",
        "caveats": [...],
        "salt": "0x...",
        "signature": "0x..."
      }
    }
  ]
}
```

The raw permission response has a `context` field with encoded delegations. Use `decodeDelegations(context)` to decode them. The decoded delegation objects should have the fields above. You may need to also compute the hash using `getDelegationHashOffchain` from the same utils package.

Create `src/app/api/save-delegation/route.ts`:
```ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dir = path.join(os.homedir(), '.gator-cli', 'delegations');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'default.json'), JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

### 5. Update PermissionProvider
After saving permission to state, also:
1. Decode delegations from `permission.context`
2. Compute hashes
3. POST the formatted delegation JSON to `/api/save-delegation`
4. Show a success toast/indicator that delegation was saved to disk

### 6. Rebrand UI
- Hero: "Agent Permissions Portal" / "Grant your AI agent scoped permissions"
- Remove "Steps" tutorial text, make it cleaner and more demo-friendly
- Show the delegation JSON after granting (already exists in PermissionInfo)
- Add a status indicator showing "✅ Delegation saved to ~/.gator-cli/delegations/default.json"
- Keep it dark theme friendly

### 7. Remove the redeem button
The whole point is that redemption happens via gator-cli in the terminal, NOT in the web app. Remove RedeemPermissionButton entirely. After granting permissions, just show the saved delegation JSON and the file path.

### 8. Add next.config.mjs
```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

### 9. .env setup
Create `.env.local` with:
```
NEXT_PUBLIC_PIMLICO_API_KEY=pim_placeholder
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
```
(Ryan will fill in real keys)

## File Structure
```
src/
  app/
    api/save-delegation/route.ts  (NEW)
    page.tsx
    layout.tsx
    globals.css
  components/
    Hero.tsx (updated branding)
    ConnectButton.tsx
    CreateSessionAccount.tsx
    GrantPermissionsButton.tsx (updated for USDC + save to disk)
    WalletInfoContainer.tsx
    WalletInfo.tsx
    PermissionInfo.tsx (updated to show save status)
    DelegationSaved.tsx (NEW - shows success + file path)
    Button.tsx
    Footer.tsx
  providers/
    AppProvider.tsx
    SessionAccountProvider.tsx
    PermissionProvider.tsx (updated to decode + save)
  services/
    bundlerClient.ts (keep but unused for now)
    pimlicoClient.ts (keep but unused for now)
```

## Important Notes
- This is a LOCAL demo app. The API route writing to disk only works in dev mode.
- Don't worry about production deployment.
- Keep it simple and visually clean for a livestream demo.
- The `decodeDelegations` import is from `@metamask/smart-accounts-kit/utils`
- The `getDelegationHashOffchain` import is also from `@metamask/smart-accounts-kit/utils`
- If the 0.4.0-beta.1 API surface differs from what's documented, just make it compile and add TODO comments.

## Run
```bash
yarn install
yarn dev
```
