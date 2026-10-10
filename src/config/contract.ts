import { Address } from "viem";

// Deployed ColorTag contract address on Botchain Testnet (Chain ID 968)
export const COLORTAG_CONTRACT_ADDRESS: Address = (
  process.env.NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS ||
  "0xC67ccf21A1106937496Bcac1F1a1e1071F103922"
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
