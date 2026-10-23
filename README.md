# ColorTag 🎨

> **Your Wallet. Your Color.** — A lightweight, decentralized Web3 dApp for binding a personal hexadecimal color identity to your wallet address directly on the blockchain.

---

## 📖 Overview

ColorTag provides a simple, verifiable on-chain identity mechanism. Users select a color that represents them (e.g. `#8B5CF6`) and commit it to their wallet address on **Botchain Mainnet**. Anyone in the world can look up any public address to inspect the color chosen by that wallet owner.

- **Zero backend:** Pure Web3 architecture communicating directly with the smart contract.
- **Zero databases:** State is stored immutably on-chain.
- **Zero non-gas fees:** Contract requires only standard network gas; no tokens, staking, or NFTs.

---

## ✨ Features

- **Personal On-Chain Identity:** Associate your EVM wallet address with any valid 6-digit hex color (`#RRGGBB`).
- **Real-Time Live Preview:** Instant visual feedback with ambient glow, badge previews, and live hex validation as you interact with the color picker.
- **Universal Address Lookup:** Enter any EVM wallet address to view their assigned on-chain color or discover if they have yet to tag themselves.
- **Botchain Mainnet Native:** Configured for Botchain Mainnet (Chain ID `677`), with network detection and automatic chain-switching prompts.
- **Secure Validation:** Solidity smart contract strictly validates color formats (`#` prefix + 6 hexadecimal characters `0-9`, `a-f`, `A-F`), preventing corrupt data.
- **Event-Driven Updates:** Emits `ColorSaved(address indexed user, string color)` on updates, allowing instant frontend state refreshes.

---

## 🛠️ Technology Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Web3 Integrations:** [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/), [@tanstack/react-query](https://tanstack.com/query)
- **Smart Contract:** [Solidity ^0.8.24](https://soliditylang.org/)
- **Development & Testing:** [Hardhat](https://hardhat.org/) with Mocha & Chai
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🌐 Network Configuration (Mainnet)

ColorTag runs live on **Botchain Mainnet**:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Mainnet |
| **Chain ID** | `677` (`0x2a5`) |
| **RPC URL** | [https://rpc.botchain.ai](https://rpc.botchain.ai) |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Native Currency** | BOT (Total Supply: 150 Million) |
| **Live Contract Address** | [`0x15fF6FfA7005A2fE2eF27cd82D8cb1B02ae9Dc84`](https://scan.botchain.ai/address/0x15fF6FfA7005A2fE2eF27cd82D8cb1B02ae9Dc84) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+
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
Contents of `.env`:
```env
# Private key for deploying the smart contract to Botchain Mainnet
PRIVATE_KEY="your_private_key_here"

# Botchain Mainnet RPC URL
BOTCHAIN_MAINNET_RPC_URL="https://rpc.botchain.ai"
BOTCHAIN_RPC_URL="https://rpc.botchain.ai"

# Deployed ColorTag contract address on Botchain Mainnet
NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS="0x15fF6FfA7005A2fE2eF27cd82D8cb1B02ae9Dc84"
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

## 📦 Smart Contract Deployment

```bash
npm run deploy:mainnet
```

Outputs:
```text
====================================================
ColorTag deployed successfully!
Contract Address: 0x15fF6FfA7005A2fE2eF27cd82D8cb1B02ae9Dc84
Network: botchainMainnet (Chain ID: 677)
Explorer: https://scan.botchain.ai/address/0x15fF6FfA7005A2fE2eF27cd82D8cb1B02ae9Dc84
====================================================
```

---

## 💻 Running the Frontend Locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
1. Connect your Web3 wallet (MetaMask, Rabby, etc.).
2. If your wallet is on another network, click **"Switch to Botchain Mainnet"** in the header.
3. Pick a color or enter a custom hex code.
4. Click **"Save My Color"** to execute the on-chain transaction.
5. Once confirmed, view your transaction directly on [BotchainScan](https://scan.botchain.ai).
6. Use the **"Wallet Lookup"** section to search any wallet address on-chain.

---

## 🏗️ Production Build

```bash
npm run build
npm run start
```

---

## 🔒 Security & Simplicity Guarantees

- **No external API dependency**: Direct RPC connection using Viem & Wagmi.
- **Strict character verification**: Solidity byte-by-byte inspection ensures only legitimate `#RRGGBB` hex strings enter the contract.
- **Zero custody**: No administrative owner keys, pause mechanisms, or proxy risks; the contract is immutable and autonomous.
