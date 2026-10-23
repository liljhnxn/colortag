const hre = require("hardhat");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying ColorTag to:", hre.network.name);
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account found. Make sure PRIVATE_KEY is set in your .env file."
    );
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BOT");

  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const isMainnet = chainId === 677 || hre.network.name === "botchainMainnet";

  const ColorTag = await hre.ethers.getContractFactory("ColorTag");
  
  // Estimate gas to avoid any overpayment
  const deployTx = await ColorTag.getDeployTransaction();
  let estimatedGas;
  try {
    estimatedGas = await hre.ethers.provider.estimateGas(deployTx);
  } catch (err) {
    estimatedGas = 500000n;
  }
  
  // Use 20 gwei (the network minimum) on Botchain to minimize gas fees
  const gasPrice = isMainnet ? 20000000000n : (await hre.ethers.provider.getFeeData()).gasPrice || 20000000000n;
  const estimatedCost = estimatedGas * gasPrice;

  console.log(`Estimated deployment gas: ${estimatedGas} units`);
  console.log(`Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);
  console.log(`Estimated deployment fee: ${hre.ethers.formatEther(estimatedCost)} BOT`);

  if (balance < estimatedCost && hre.network.name !== "hardhat") {
    throw new Error(
      `\n❌ INSUFFICIENT BALANCE FOR GAS:\n` +
      `Deployer ${deployer.address} has ${hre.ethers.formatEther(balance)} BOT.\n` +
      `Deployment requires at least ${hre.ethers.formatEther(estimatedCost)} BOT at ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei.\n` +
      `Please send at least ${hre.ethers.formatEther(estimatedCost - balance + 1000000000000000n)} BOT to ${deployer.address} to proceed.\n`
    );
  }

  console.log("\nDeploying contract at minimal gas price...");
  const colorTag = await ColorTag.deploy({ gasPrice });

  await colorTag.waitForDeployment();
  const contractAddress = await colorTag.getAddress();

  const explorerBase = "https://scan.botchain.ai";

  console.log("\n====================================================");
  console.log("ColorTag deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name, `(Chain ID: ${chainId})`);
  console.log("Explorer:", `${explorerBase}/address/${contractAddress}`);
  console.log("====================================================");
  console.log("\nNext Steps:");
  console.log(`1. Add to .env: NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS="${contractAddress}"`);
  console.log(`2. Update src/config/contract.ts if needed.`);
  console.log("3. Build and launch the frontend!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
