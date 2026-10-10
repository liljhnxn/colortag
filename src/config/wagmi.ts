import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors/injected";
import { botchainTestnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [botchainTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [botchainTestnet.id]: http("https://rpc.bohr.life"),
  },
  ssr: true,
});
