# ColorTag 🎨

> **Your Wallet. Your Color.** — A lightweight, decentralized Web3 dApp for binding a personal hexadecimal color identity to your wallet address directly on the blockchain.

---

## 📖 Overview

ColorTag provides a simple, verifiable on-chain identity mechanism. Users select a color that represents them (e.g. `#8B5CF6`) and commit it to their wallet address on the **Botchain Testnet**. Anyone in the world can look up any public address to inspect the color chosen by that wallet owner.

- **Zero backend:** Pure Web3 architecture communicating directly with the smart contract.
- **Zero databases:** State is stored immutably on-chain.
- **Zero non-gas fees:** Contract requires only standard network gas; no tokens, staking, or NFTs.

---

## ✨ Features

- **Personal On-Chain Identity:** Associate your Ethereum-compatible wallet address with any valid 6-digit hex color (`#RRGGBB`).
- **Real-Time Live Preview:** Instant visual feedback with ambient glow, badge previews, and live hex validation as you interact with the color picker.
- **Universal Address Lookup:** Enter any EVM wallet address to view their assigned on-chain color or discover if they have yet to tag themselves.
- **Botchain Testnet Ready:** Pre-configured for Botchain Testnet (Chain ID `968`), with network detection and automatic chain-switching prompts.
- **Secure Validation:** Solidity smart contract strictly validates color formats (`#` prefix + 6 hexadecimal characters `0-9`, `a-f`, `A-F`), preventing corrupt data.
- **Event-Driven Updates:** Emits `ColorSaved(address indexed user, string color)` on updates, allowing instant frontend state refreshes.

---

## 🛠️ Technology Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Web3 Integrations:** [Wagmi v2/v3](https://wagmi.sh/), [Viem](https://viem.sh/), [@tanstack/react-query](https://tanstack.com/query)
- **Smart Contract:** [Solidity ^0.8.24](https://soliditylang.org/)
- **Development & Testing:** [Hardhat](https://hardhat.org/) with Mocha & Chai
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🌐 Network Configuration

ColorTag runs on **Botchain Testnet**:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` (`0x3c8`) |
| **RPC URL** | [https://rpc.bohr.life](https://rpc.bohr.life) |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |
| **Native Currency** | BOT |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on v20+ and v25+)
- **npm** or **pnpm** / **yarn**
- A browser wallet (e.g., MetaMask, Rabby, Brave Wallet)

### 2. Installation
Clone the repository and install the dependencies:

```bash
git clone <your-repo-url>
cd Colortag
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to create your `.env` file:

```bash
cp .env.example .env
```

Contents of `.env`:
```env
# Private key for deploying the smart contract to Botchain Testnet
PRIVATE_KEY="your_private_key_here"

# Botchain Testnet RPC URL
BOTCHAIN_RPC_URL="https://rpc.bohr.life"

# Deployed ColorTag contract address on Botchain Testnet
NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS="0xC67ccf21A1106937496Bcac1F1a1e1071F103922"
```

---

## 🧪 Testing the Smart Contract

Run the Hardhat test suite:

```bash
npm test
```

The test suite covers:
- ✅ Return of empty/default state for unset wallets (`getColor` returns `""`, `hasColor` returns `false`).
- ✅ Successful color saving for a wallet.
- ✅ Correct emission of the `ColorSaved` event with indexed address and color.
- ✅ Color updating by the wallet owner.
- ✅ Multiple wallets maintaining separate, isolated colors.
- ✅ Validation: Case-insensitivity (lowercase, uppercase, mixed hex accepted).
- ✅ Rejections: Missing `#` prefix, 3-digit shorthand, 8-digit hex with alpha, non-hex characters, and empty strings.

---

## 📦 Deploying the Smart Contract

### Deploying to Botchain Testnet:
1. Ensure your deployer wallet on Botchain Testnet has some `BOT` testnet tokens for gas.
2. Put your private key into `.env`:
   ```env
   PRIVATE_KEY="0xabcdef..."
   ```
3. Run the automated deployment script:
   ```bash
   npm run deploy:testnet
   ```
4. The script will output the deployed contract address and BohrScan block explorer link:
   ```text
   ====================================================
   ColorTag deployed successfully!
   Contract Address: 0x1234567890abcdef1234567890abcdef12345678
   Network: botchainTestnet
   Explorer: https://scan.bohr.life/address/0x1234...
   ====================================================
   ```

### 5. Verifying the Smart Contract on BohrScan
To verify the contract source code on BohrScan block explorer:
```bash
npm run verify:testnet 0xC67ccf21A1106937496Bcac1F1a1e1071F103922
```

### 6. Configuring the Frontend with the Contract Address
Copy the deployed address into `.env.local` (or update `src/config/contract.ts`):

```env
NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS="0xYourDeployedContractAddress"
```

---

## 💻 Running the Frontend Locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
1. Connect your Web3 wallet (MetaMask, Rabby, etc.).
2. If your wallet is on another network, click **"Switch to Botchain"** in the header.
3. Pick a color or enter a custom hex code.
4. Click **"Save My Color"** to execute the on-chain transaction.
5. Once confirmed, view your transaction directly on BohrScan.
6. Use the **"Wallet Lookup"** section to search any wallet address on-chain.

---

## 🏗️ Production Build

Verify that the production build compiles without any errors:

```bash
npm run build
npm run start
```

---

## ☁️ Deploying to Vercel

1. Push your code to a GitHub / GitLab / Bitbucket repository.
2. Import the project into [Vercel](https://vercel.com/).
3. Framework Preset: **Next.js**.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS`: The deployed contract address on Botchain Testnet.
5. Click **Deploy**.

---

## 🔒 Security & Simplicity Guarantees

- **No external API dependency**: Direct RPC connection using Viem & Wagmi.
- **Strict character verification**: Solidity byte-by-byte inspection ensures only legitimate `#RRGGBB` hex strings enter the contract.
- **Zero custody**: No administrative owner keys, pause mechanisms, or proxy risks; the contract is immutable and autonomous.
