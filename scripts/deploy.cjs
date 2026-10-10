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

  if (balance === 0n && hre.network.name !== "hardhat") {
    console.warn(
      "\nWARNING: Deployer account has 0 BOT. You need testnet BOT tokens to pay for gas.\n" +
      "Acquire testnet funds for Botchain Testnet before deploying.\n"
    );
  }

  const ColorTag = await hre.ethers.getContractFactory("ColorTag");
  console.log("Deploying contract...");
  const colorTag = await ColorTag.deploy();

  await colorTag.waitForDeployment();
  const contractAddress = await colorTag.getAddress();

  console.log("\n====================================================");
  console.log("ColorTag deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Explorer:", `https://scan.bohr.life/address/${contractAddress}`);
  console.log("====================================================");
  console.log("\nNext Steps:");
  console.log(`1. Copy this address to your frontend config: src/config/contract.ts`);
  console.log(`   NEXT_PUBLIC_COLORTAG_CONTRACT_ADDRESS="${contractAddress}"`);
  console.log("2. Restart or build the frontend.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
