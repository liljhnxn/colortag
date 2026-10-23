import { Address } from "viem";

// Deployed ColorTag contract address on Botchain Mainnet (Chain ID 677)
export const COLORTAG_MAINNET_CONTRACT_ADDRESS: Address =
  "0x15fF6FfA7005A2fE2eF27cd82D8cb1B02ae9Dc84";

// Ensure no testnet contract address from environment variables or cache is ever used
const envAddress = (process.env.NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS || "").trim();
const isTestnetAddress =
  !envAddress ||
  envAddress.toLowerCase() === "0xc67ccf21a1106937496bcac1f1a1e1071f103922" ||
  envAddress.toLowerCase() === "0x3add26fa7a69e01d94ca4c5473a8dfec1a84076e";

export const COLORTAG_CONTRACT_ADDRESS: Address = (
  !isTestnetAddress && envAddress.startsWith("0x") && envAddress.length === 42
    ? envAddress
    : COLORTAG_MAINNET_CONTRACT_ADDRESS
) as Address;

export const COLORTAG_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "color",
        type: "string",
      },
    ],
    name: "ColorSaved",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getColor",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasColor",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "color",
        type: "string",
      },
    ],
    name: "isValidColor",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "color",
        type: "string",
      },
    ],
    name: "setColor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
