import { defineChain } from "viem";

/**
 * Official Botchain Mainnet definition
 * Chain ID: 677
 * RPC URL: https://rpc.botchain.ai
 * Explorer: https://scan.botchain.ai
 * Native currency: BOT (Total Supply: 150 Million)
 */
export const botchainMainnet = defineChain({
  id: 677,
  name: "Botchain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOT",
    symbol: "BOT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.botchain.ai"],
    },
    public: {
      http: ["https://rpc.botchain.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "BotchainScan",
      url: "https://scan.botchain.ai",
    },
  },
  testnet: false,
});

export const activeChain = botchainMainnet;
