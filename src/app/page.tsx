"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { createPublicClient, http, isAddress, Address } from "viem";
import {
  Palette,
  Wallet,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Copy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { botchainTestnet } from "../config/chain";
import {
  COLORTAG_ABI,
  COLORTAG_CONTRACT_ADDRESS,
} from "../config/contract";

// Pre-curated vibrant color presets for quick selection
const PRESET_COLORS = [
  { name: "Electric Indigo", hex: "#6366F1" },
  { name: "Neon Violet", hex: "#8B5CF6" },
  { name: "Cyber Pink", hex: "#EC4899" },
  { name: "Sunset Crimson", hex: "#EF4444" },
  { name: "Solar Amber", hex: "#F59E0B" },
  { name: "Emerald Pulse", hex: "#10B981" },
  { name: "Hyper Cyan", hex: "#06B6D4" },
  { name: "Azure Blue", hex: "#3B82F6" },
];

export default function Home() {
  // Wallet state
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Color picker state
  const [selectedColor, setSelectedColor] = useState<string>("#8B5CF6");
  const [inputHex, setInputHex] = useState<string>("#8B5CF6");
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);

  // Address lookup state
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    searchedAddress: string;
    hasColor: boolean;
    color: string;
  } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const isContractConfigured = useMemo(() => {
    return (
      COLORTAG_CONTRACT_ADDRESS &&
      COLORTAG_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"
    );
  }, []);

  const isWrongChain = isConnected && chain?.id !== botchainTestnet.id;

  // Read current connected wallet's saved color
  const {
    data: connectedUserColor,
    refetch: refetchConnectedColor,
    isLoading: isLoadingConnectedColor,
  } = useReadContract({
    address: COLORTAG_CONTRACT_ADDRESS,
    abi: COLORTAG_ABI,
    functionName: "getColor",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && isContractConfigured && !isWrongChain,
    },
  });

  const {
    data: connectedUserHasColor,
    refetch: refetchConnectedHasColor,
  } = useReadContract({
    address: COLORTAG_CONTRACT_ADDRESS,
    abi: COLORTAG_ABI,
    functionName: "hasColor",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && isContractConfigured && !isWrongChain,
    },
  });

  // Contract write hook
  const {
    data: txHash,
    writeContractAsync,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // Transaction receipt watcher
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // When transaction confirms, refetch connected wallet's data
  useEffect(() => {
    if (isConfirmed) {
      refetchConnectedColor();
      refetchConnectedHasColor();
    }
  }, [isConfirmed, refetchConnectedColor, refetchConnectedHasColor]);

  // Sync color picker with text input
  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor.toUpperCase());
    setInputHex(newColor.toUpperCase());
    setColorError(null);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim().toUpperCase();
    if (!val.startsWith("#") && val.length > 0) {
      val = "#" + val;
    }
    setInputHex(val);

    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (hexRegex.test(val)) {
      setSelectedColor(val);
      setColorError(null);
    } else if (val.length === 7) {
      setColorError("Invalid hex color format. Must be #RRGGBB.");
    }
  };

  // Save color handler
  const handleSaveColor = async () => {
    setColorError(null);
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(selectedColor)) {
      setColorError("Please enter a valid 6-digit hex color (e.g., #8B5CF6).");
      return;
    }

    if (!isContractConfigured) {
      setColorError(
        "ColorTag contract address is not configured yet. Please deploy the contract to Botchain Testnet and set NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS."
      );
      return;
    }

    try {
      resetWrite();
      await writeContractAsync({
        address: COLORTAG_CONTRACT_ADDRESS,
        abi: COLORTAG_ABI,
        functionName: "setColor",
        args: [selectedColor],
      });
    } catch (err: unknown) {
      console.error("Save color transaction error:", err);
    }
  };

  // Lookup address handler
  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLookupError(null);
    setLookupResult(null);

    const cleanAddress = lookupAddress.trim();
    if (!isAddress(cleanAddress)) {
      setLookupError("Please enter a valid Ethereum address (0x...)");
      return;
    }

    if (!isContractConfigured) {
      setLookupError(
        "ColorTag contract is not configured yet. Please configure the contract address to enable lookups."
      );
      return;
    }

    setLookupLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: botchainTestnet,
        transport: http("https://rpc.bohr.life"),
      });

      const [hasColor, color] = await Promise.all([
        publicClient.readContract({
          address: COLORTAG_CONTRACT_ADDRESS,
          abi: COLORTAG_ABI,
          functionName: "hasColor",
          args: [cleanAddress as Address],
        }),
        publicClient.readContract({
          address: COLORTAG_CONTRACT_ADDRESS,
          abi: COLORTAG_ABI,
          functionName: "getColor",
          args: [cleanAddress as Address],
        }),
      ]);

      setLookupResult({
        searchedAddress: cleanAddress,
        hasColor: Boolean(hasColor),
        color: String(color),
      });
    } catch (err: unknown) {
      console.error("Lookup error:", err);
      setLookupError(
        "Failed to read contract. Ensure network connection to Botchain RPC."
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "tx" | "address") => {
    navigator.clipboard.writeText(text);
    if (type === "tx") {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const shortenAddress = (addr?: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const isSaving = isWritePending || isConfirming;

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden pb-20">
      {/* Ambient glowing backdrop based on selected color */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px] opacity-25 transition-all duration-700 ease-out z-0"
        style={{ backgroundColor: selectedColor }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.08] bg-[#090b12]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo & Name */}
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${selectedColor}, #1e1b4b)`,
                boxShadow: `0 0 20px ${selectedColor}40`,
              }}
            >
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">
                  Color<span className="text-purple-400">Tag</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Botchain
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                On-Chain Color Identity
              </p>
            </div>
          </div>

          {/* Right Header Controls: Network + Wallet Button */}
          <div className="flex items-center space-x-3">
            {/* Wrong Network Warning / Switcher */}
            {isWrongChain && (
              <button
                id="switch-network-btn"
                onClick={() => switchChain({ chainId: botchainTestnet.id })}
                disabled={isSwitchingChain}
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>
                  {isSwitchingChain ? "Switching..." : "Switch to Botchain"}
                </span>
              </button>
            )}

            {/* Network Indicator */}
            {isConnected && !isWrongChain && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Botchain (968)</span>
              </div>
            )}

            {/* Wallet Connect / Disconnect */}
            {isConnected && address ? (
              <div className="flex items-center space-x-2 bg-slate-900/90 border border-white/10 rounded-xl p-1 pl-3 shadow-md">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        connectedUserHasColor && connectedUserColor
                          ? connectedUserColor
                          : "#10B981",
                    }}
                  />
                  <span className="text-xs font-mono font-medium text-slate-200">
                    {shortenAddress(address)}
                  </span>
                </div>
                <button
                  id="copy-address-header-btn"
                  onClick={() => copyToClipboard(address, "address")}
                  title="Copy address"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  {copiedAddress ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  id="disconnect-wallet-btn"
                  onClick={() => disconnect()}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                id="connect-wallet-header-btn"
                onClick={() => {
                  const injectedConnector = connectors[0];
                  if (injectedConnector) {
                    connect({ connector: injectedConnector });
                  }
                }}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 active:scale-95 transition-all duration-200"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-purple-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Pure On-Chain Identity • Zero External APIs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your Wallet. <br className="hidden sm:inline" />
            <span
              className="transition-colors duration-500"
              style={{
                backgroundImage: `linear-gradient(135deg, ${selectedColor}, #9333ea, #38bdf8)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your Color.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg">
            Choose a color that represents you and save it on-chain.
          </p>
        </div>

        {/* Contract Configuration Warning if not deployed */}
        {!isContractConfigured && (
          <div className="glass-panel p-4 rounded-2xl border-amber-500/30 bg-amber-500/5 text-amber-200 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">
                Contract Deployment Notice
              </p>
              <p className="text-amber-200/90 text-xs sm:text-sm">
                The smart contract is ready to deploy to Botchain Testnet (Chain ID 968).
                Run <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-300 font-mono text-xs">npm run deploy:testnet</code> with your private key in <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-300 font-mono text-xs">.env</code>, then set <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-300 font-mono text-xs">NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS</code> in <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-300 font-mono text-xs">.env.local</code>.
              </p>
            </div>
          </div>
        )}

        {/* Connected Wallet On-Chain Status Banner */}
        {isConnected && connectedUserHasColor && connectedUserColor && (
          <div className="glass-panel p-4 rounded-2xl border-purple-500/30 bg-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg shadow-md border border-white/20"
                style={{ backgroundColor: connectedUserColor }}
              />
              <div>
                <p className="text-xs text-purple-300 font-medium">
                  Your Current On-Chain Color
                </p>
                <p className="text-base font-bold font-mono text-white">
                  {connectedUserColor}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleColorChange(connectedUserColor)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              Load into Picker
            </button>
          </div>
        )}

        {/* Main Grid: Color Picker & Live Preview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Color Selector */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Choose Your Color</h2>
              </div>
              <span className="text-xs text-slate-400">Hexadecimal #RRGGBB</span>
            </div>

            {/* Input Row: Native Picker + Hex Input */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select or Type Hex Color
              </label>
              <div className="flex items-center space-x-3">
                {/* Native Color Picker */}
                <div className="relative group shrink-0">
                  <input
                    id="native-color-picker"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-14 h-14 cursor-pointer rounded-2xl transition-transform active:scale-95"
                    title="Click to open color wheel"
                  />
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-white/30 shadow-inner group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: selectedColor }}
                  />
                </div>

                {/* Hex Text Input */}
                <div className="relative flex-1">
                  <input
                    id="hex-color-input"
                    type="text"
                    value={inputHex}
                    maxLength={7}
                    onChange={handleHexInputChange}
                    placeholder="#8B5CF6"
                    className="w-full h-14 px-4 glass-input rounded-2xl font-mono text-lg font-semibold tracking-wide focus:ring-2 focus:ring-purple-500/30 transition-all uppercase"
                  />
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow"
                    style={{ backgroundColor: selectedColor }}
                  />
                </div>
              </div>

              {colorError && (
                <p className="text-rose-400 text-xs flex items-center space-x-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{colorError}</span>
                </p>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Popular Palettes
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleColorChange(preset.hex)}
                    title={`${preset.name} (${preset.hex})`}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                      selectedColor.toUpperCase() === preset.hex.toUpperCase()
                        ? "border-white ring-2 ring-white/30 scale-105"
                        : "border-white/10 hover:scale-105 hover:border-white/30"
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {selectedColor.toUpperCase() === preset.hex.toUpperCase() && (
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button & Interaction State */}
            <div className="pt-4 border-t border-white/[0.08] space-y-4">
              {!isConnected ? (
                <button
                  id="save-color-connect-prompt-btn"
                  onClick={() => {
                    const injectedConnector = connectors[0];
                    if (injectedConnector) {
                      connect({ connector: injectedConnector });
                    }
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 active:scale-[0.99] transition-all"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet to Save Color</span>
                </button>
              ) : isWrongChain ? (
                <button
                  id="save-color-switch-chain-btn"
                  onClick={() => switchChain({ chainId: botchainTestnet.id })}
                  disabled={isSwitchingChain}
                  className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 transition-all"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>
                    {isSwitchingChain
                      ? "Switching Network..."
                      : "Switch to Botchain Testnet (968)"}
                  </span>
                </button>
              ) : (
                <button
                  id="save-my-color-btn"
                  onClick={handleSaveColor}
                  disabled={isSaving || !isContractConfigured}
                  className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-[0.99] ${
                    isSaving || !isContractConfigured
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                      : "text-white"
                  }`}
                  style={
                    !isSaving && isContractConfigured
                      ? {
                          backgroundColor: selectedColor,
                          boxShadow: `0 10px 30px ${selectedColor}40`,
                        }
                      : undefined
                  }
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>
                        {isWritePending
                          ? "Confirm in Wallet..."
                          : "Saving On-Chain..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Save My Color</span>
                    </>
                  )}
                </button>
              )}

              {/* Transaction Feedback */}
              {writeError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-semibold">Transaction Failed: </span>
                    <span>
                      {writeError.message.includes("User rejected")
                        ? "Transaction was rejected in your wallet."
                        : writeError.message.slice(0, 160)}
                    </span>
                  </div>
                </div>
              )}

              {isConfirmed && txHash && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-emerald-300">
                      Color Saved Successfully On-Chain!
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl text-xs font-mono text-slate-300">
                    <span className="truncate mr-2">Tx: {txHash}</span>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(txHash, "tx")}
                        className="p-1 hover:text-white rounded transition-colors"
                        title="Copy Transaction Hash"
                      >
                        {copiedTx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://scan.bohr.life/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 hover:underline"
                      >
                        <span>View Explorer</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live On-Chain Preview Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Live Identity Card
                </span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span>Live Preview</span>
                </span>
              </div>

              {/* Card Visualization */}
              <div
                className="relative rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl transition-all duration-500 border border-white/20"
                style={{
                  background: `linear-gradient(145deg, #12141f 0%, #1a1e2d 100%)`,
                }}
              >
                {/* Decorative Colored Fluid Shapes */}
                <div
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-60 transition-all duration-500"
                  style={{ backgroundColor: selectedColor }}
                />
                <div
                  className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-2xl opacity-40 transition-all duration-500"
                  style={{ backgroundColor: selectedColor }}
                />

                <div className="relative z-10 space-y-8">
                  {/* Card Header: Color Swatch + Tag */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center border-2 border-white/40 transition-all duration-300"
                      style={{ backgroundColor: selectedColor }}
                    >
                      <Palette className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Botchain
                      </span>
                      <p className="text-xl font-mono font-extrabold text-white">
                        {selectedColor}
                      </p>
                    </div>
                  </div>

                  {/* Card Body: Simulated Badge & Address */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                      Assigned Wallet
                    </p>
                    <p className="text-sm font-mono text-slate-100 font-medium break-all">
                      {address || "0x0000000000000000000000000000000000000000"}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-medium text-slate-400">
                      Standard: ERC / Solidity Keyed
                    </span>
                    <div
                      className="h-2 w-16 rounded-full"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Meta Description */}
              <p className="text-xs text-slate-400 leading-relaxed">
                This preview updates instantly as you tweak your color. When saved,
                anyone on Botchain can view this hex record keyed directly to your
                public address.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Wallet Lookup */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Wallet Lookup</h2>
              <p className="text-xs text-slate-400">
                Look up any address on Botchain Testnet to see their saved color
              </p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  id="lookup-address-input"
                  type="text"
                  value={lookupAddress}
                  onChange={(e) => setLookupAddress(e.target.value)}
                  placeholder="Enter wallet address (0x...)"
                  className="w-full h-14 px-4 glass-input rounded-2xl font-mono text-sm sm:text-base focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
              </div>
              <button
                id="find-color-btn"
                type="submit"
                disabled={lookupLoading}
                className="h-14 px-8 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2 shrink-0 active:scale-95 transition-all"
              >
                {lookupLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Color</span>
                  </>
                )}
              </button>
            </div>

            {lookupError && (
              <p className="text-rose-400 text-xs flex items-center space-x-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{lookupError}</span>
              </p>
            )}
          </form>

          {/* Lookup Results Display */}
          {lookupResult && (
            <div className="mt-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10 animate-fade-in">
              {lookupResult.hasColor ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-5 w-full sm:w-auto">
                    {/* Big Color Preview Circle */}
                    <div
                      className="w-16 h-16 rounded-2xl shadow-xl border-2 border-white/30 shrink-0 flex items-center justify-center transition-transform hover:scale-105"
                      style={{
                        backgroundColor: lookupResult.color,
                        boxShadow: `0 0 25px ${lookupResult.color}50`,
                      }}
                    >
                      <Palette className="w-7 h-7 text-white drop-shadow" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          Color Found
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <p className="text-2xl font-extrabold font-mono text-white">
                        {lookupResult.color}
                      </p>
                      <p className="text-xs font-mono text-slate-400 break-all">
                        {lookupResult.searchedAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleColorChange(lookupResult.color)}
                      className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
                    >
                      Copy to Picker
                    </button>
                    <a
                      href={`https://scan.bohr.life/address/${lookupResult.searchedAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-white/10 text-slate-400 flex items-center justify-center mx-auto">
                    <Palette className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-200">
                    No Color Saved Yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    This wallet owner has not saved a color identity on Botchain
                    Testnet yet.
                  </p>
                  <p className="text-xs font-mono text-slate-500 pt-1">
                    {lookupResult.searchedAddress}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Network & Infrastructure Footer Info Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
            <span>
              Network: <strong className="text-slate-200">Botchain Testnet</strong> • Chain ID: <strong className="text-slate-200">968</strong> • Currency: <strong className="text-slate-200">BOT</strong>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://rpc.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              RPC Endpoint
            </a>
            <span>•</span>
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400 transition-colors flex items-center space-x-1"
            >
              <span>BohrScan Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
