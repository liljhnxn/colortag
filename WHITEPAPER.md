# ColorTag — Whitepaper

**Sovereign On-Chain Visual Identity Primitive on Botchain**  
*Version 1.0 — October 2026*  
*Repository: [https://github.com/liljhnxn/colortag](https://github.com/liljhnxn/colortag)*  
*Network: Botchain Mainnet (Chain ID: 677)*  
*Verified Contract: [0x15fF6FfA7005A2fE2eF27cd82D8cb1B02ae9Dc84](https://scan.botchain.ai/address/0x15fF6FfA7005A2fE2eF27cd82D8cb1B02ae9Dc84)*  

---

## Executive Summary

Decentralized identity in Web3 has historically skewed toward either high-cost, speculative assets (such as Profile Picture NFTs) or complex domain name resolution protocols (such as ENS) with recurring renewal rents. While these systems provide utility, they introduce friction, custody issues, secondary market distortion, and high barrier to entry for everyday decentralized applications.

**ColorTag** introduces a lightweight, zero-maintenance, and immutable visual identity standard natively built on **Botchain**. The protocol allows any wallet holder to bind a custom 6-digit hexadecimal color code (`#RRGGBB`) directly to their address on the blockchain ledger. ColorTag functions with zero centralized servers, zero databases, zero administrative backdoors, and zero token fees beyond network gas. It serves as an open, composable public good primitive for user badges, dApp theming, avatar accents, on-chain social graphs, and wallet verification across the Botchain ecosystem.

---

## 1. Problem Statement

### 1.1 The Identity Gap in Web3
Public blockchain addresses are 42-character hexadecimal strings (e.g., `0x15fF...Dc84`). While mathematically secure, they are cognitively indistinguishable to human eyes. When users interact with wallets, DeFi protocols, block explorers, or governance portals, addresses blur into an undifferentiated wall of alphanumeric noise, causing friction and increasing the likelihood of phishing or misdirected transactions.

### 1.2 Over-Engineered Solutions
Existing identity paradigms suffer from major structural shortcomings:
- **NFT Avatars (PFP ERC-721s)**: Costly to mint, volatile, tradeable on secondary marketplaces (meaning identity can be bought and sold rather than uniquely tied to a creator), and heavily reliant on fragile off-chain IPFS/HTTP metadata gateways.
- **Naming Services (.eth/.bot)**: Incur recurring yearly renewal fees, squatted names, complex resolver smart contracts, and gas-heavy lookup mechanics.
- **Centralized Off-Chain Profiles**: Storing user preferences in Web2 databases (Supabase, Firebase, AWS) strips identity of its decentralized, censorship-resistant sovereignty.

---

## 2. The ColorTag Solution

ColorTag solves this by introducing a **sovereign visual anchor** for every Web3 wallet:

1. **Lightweight & Permanent**: Users store a simple 7-byte hexadecimal string (`#RRGGBB`) directly in contract storage on Botchain.
2. **Sovereign Ownership**: Each address has exclusive authority to update or maintain its personal color tag.
3. **Strict Byte-Level Validation**: The Solidity contract rigorously enforces format validity (`#` followed by six valid hex characters `[0-9, a-f, A-F]`), preventing malformed input or injection attacks.
4. **Universal Composability**: Any dApp, wallet UI, or smart contract on Botchain can query `getColor(address)` or `hasColor(address)` via a single view call without paying gas fees.
5. **Zero Custody / Admin-Free**: There are no owner keys, pause triggers, proxy upgrade vectors, or administrative backdoors. The contract is 100% immutable and trustless.

---

## 3. Technical Architecture & Smart Contract Specification

### 3.1 Smart Contract: `ColorTag.sol`
- **Compiler Version**: Solidity `^0.8.24`
- **License**: MIT
- **Design Pattern**: Minimalist Registry Mapping

#### State Variables
```solidity
// Mapping from wallet address to saved hex color string (#RRGGBB)
mapping(address => string) private _colors;

// Mapping from wallet address to whether a color has been saved
mapping(address => bool) private _hasColor;
```

#### Event Specification
```solidity
event ColorSaved(address indexed user, string color);
```
The `ColorSaved` event indexes the caller's address, facilitating instant off-chain subscription, subgraphs, and real-time reactive UI updates via Viem/Wagmi event listeners.

#### Core Functions

##### 1. `setColor(string calldata color)`
- Validates the incoming string via `isValidColor(color)`.
- Updates `_colors[msg.sender] = color`.
- Flags `_hasColor[msg.sender] = true`.
- Emits the `ColorSaved` event.
- Reverts if format is not exactly 7 characters starting with `#` followed by six valid hex characters.

##### 2. `isValidColor(string memory color) public pure returns (bool)`
- Pure computational helper inspecting ASCII byte values:
  - Byte 0 must equal `0x23` (`#`).
  - Bytes 1 through 6 must fall within ASCII intervals `0x30-0x39` (`0-9`), `0x61-0x66` (`a-f`), or `0x41-0x46` (`A-F`).

##### 3. `getColor(address user) external view returns (string memory)`
- Returns the saved color string (e.g., `"#8B5CF6"`), or an empty string `""` if unassigned.

##### 4. `hasColor(address user) external view returns (bool)`
- Returns boolean flag indicating if the specified address has committed an on-chain color identity.

---

## 4. Frontend & User Experience

ColorTag frontend is built with state-of-the-art Web3 design principles:
- **Next.js 14 App Router & TypeScript**: Fast SSR/CSR hybrid architecture.
- **Wagmi & Viem**: Type-safe EVM connector with automated chain switching to Botchain Mainnet (Chain ID 677).
- **TanStack React Query**: Stale-while-revalidate caching for wallet color queries.
- **Real-Time Visual Playground**: Interactive color picker with live HEX inputs, dynamic ambient glow, badge previews, and one-click random color palette generation.
- **Universal Explorer Lookup**: Instant search field enabling users to paste any EVM address to inspect its assigned on-chain color tag, raw hex code, and BotchainScan transaction links.

---

## 5. Security & Gas Efficiency

| Metric / Aspect | ColorTag Specification | Advantage |
| :--- | :--- | :--- |
| **Storage Footprint** | 1 string + 1 boolean per wallet | Minimal SSTORE cost (~20,000–45,000 gas) |
| **View Gas Cost** | 0 gas (read-only execution) | Instantaneous UI rendering & cross-contract integration |
| **Access Control** | Solely `msg.sender` | Impossible for any third-party to alter another wallet's color |
| **Reentrancy Risk** | None | No external contract calls or ether transfers |
| **Admin Privilege** | None | Contract is un-upgradeable, non-pausable, fully autonomous |

---

## 6. Ecosystem Applications on Botchain

1. **dApp Accent Personalization**: Web3 applications on Botchain can dynamically tint their UI header, buttons, or avatar rings using the user's on-chain color.
2. **Bot & AI Agent Signatures**: Autonomous AI agents on Botchain can register a signature color tag for visual distinction in bot fleets and multi-agent coordination.
3. **Sybil & Human Verification Signal**: Having an established color tag provides an immediate, verifiable badge of active wallet interaction on Botchain.
4. **Gaming & Metaverse Accents**: In-game player characters or leaderboard entries styled according to the player's authenticated wallet tag.

---

## 7. Roadmap & Future Vision

- **Phase 1 (Completed)**: Smart contract architecture, Hardhat test suite (100% coverage), Mainnet deployment to Botchain (Chain ID 677), and live Next.js dApp.
- **Phase 2 (Q4 2026)**: ColorTag SDK (npm package `@colortag/sdk`) for zero-line integration into third-party Botchain frontend apps.
- **Phase 3 (Q1 2027)**: Multi-tag theme palettes (Primary, Secondary, Accent), and Botchain AI Agent registry integrations.

---

## 8. Conclusion

ColorTag delivers a lightweight, elegant, and frictionless identity standard for Botchain. By stripping away financialization, maintenance fees, and centralized points of failure, ColorTag restores the core promise of Web3: simple, sovereign, and verifiable on-chain self-expression.
