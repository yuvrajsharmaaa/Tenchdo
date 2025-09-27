const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying to Sepolia Testnet");
  console.log("=================================");
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy Identity Registry
  console.log("\n1. Deploying Identity Registry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  console.log("Identity Registry deployed to:", await identityRegistry.getAddress());

  // Deploy Compliance Contract
  console.log("\n2. Deploying Compliance Contract...");
  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy(await identityRegistry.getAddress());
  await compliance.waitForDeployment();
  console.log("Compliance Contract deployed to:", await compliance.getAddress());

  // Property Information
  const propertyInfo = {
    propertyAddress: "123 Sepolia Street, Test City, TC 11155111",
    totalValue: ethers.parseEther("1000000"), // 1M ETH equivalent
    totalShares: 1000000, // 1M shares
    description: "Luxury residential property tokenized on Sepolia testnet for fractional ownership",
    isActive: true
  };

  // Deploy Real Estate Token
  console.log("\n3. Deploying Real Estate Token...");
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(
    "Sepolia Property Token",
    "SPT",
    18,
    await identityRegistry.getAddress(),
    await compliance.getAddress(),
    propertyInfo
  );
  await realEstateToken.waitForDeployment();
  console.log("Real Estate Token deployed to:", await realEstateToken.getAddress());

  // Deploy Mock USDC for payments (in production, use real USDC)
  console.log("\n4. Deploying Mock USDC...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy("Mock USDC (Sepolia)", "USDC", 6);
  await mockUSDC.waitForDeployment();
  console.log("Mock USDC deployed to:", await mockUSDC.getAddress());

  // Deploy Lease Manager
  console.log("\n5. Deploying Lease Manager...");
  const LeaseManager = await ethers.getContractFactory("LeaseManager");
  const leaseManager = await LeaseManager.deploy(await mockUSDC.getAddress());
  await leaseManager.waitForDeployment();
  console.log("Lease Manager deployed to:", await leaseManager.getAddress());

  // Setup initial configurations
  console.log("\n6. Setting up initial configurations...");
  
  // Register deployer identity for testing
  await identityRegistry.registerIdentity(
    deployer.address,
    deployer.address, // Using deployer as onchain ID for simplicity
    840 // USA country code
  );
  console.log("Deployer identity registered");

  // Mint some mock USDC for testing
  await mockUSDC.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
  console.log("Mock USDC minted for testing");

  // Mint some property tokens for testing
  await realEstateToken.mint(deployer.address, ethers.parseEther("100")); // 100 tokens
  console.log("Property tokens minted for testing");

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=========================");
  console.log("📋 Contract Addresses:");
  console.log("Identity Registry:", await identityRegistry.getAddress());
  console.log("Compliance Contract:", await compliance.getAddress());
  console.log("Real Estate Token:", await realEstateToken.getAddress());
  console.log("Mock USDC:", await mockUSDC.getAddress());
  console.log("Lease Manager:", await leaseManager.getAddress());

  console.log("\n💰 Token Balances:");
  console.log("User SPT Balance:", ethers.formatEther(await realEstateToken.balanceOf(deployer.address)), "SPT");
  console.log("User USDC Balance:", ethers.formatUnits(await mockUSDC.balanceOf(deployer.address), 6), "USDC");

  console.log("\n🔗 Network Info:");
  console.log("Network:", "Sepolia Testnet");
  console.log("Chain ID:", "11155111");
  console.log("Explorer:", "https://sepolia.etherscan.io/");

  // Save addresses to a file for frontend use
  const addresses = {
    identityRegistry: await identityRegistry.getAddress(),
    compliance: await compliance.getAddress(),
    realEstateToken: await realEstateToken.getAddress(),
    mockUSDC: await mockUSDC.getAddress(),
    leaseManager: await leaseManager.getAddress(),
    deployer: deployer.address,
    network: "sepolia",
    chainId: 11155111
  };

  const fs = require('fs');
  fs.writeFileSync(
    './frontend/src/contracts/addresses.sepolia.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nContract addresses saved to frontend/src/contracts/addresses.sepolia.json");

  console.log("\n📱 Next Steps:");
  console.log("1. Your MetaMask is already connected to Sepolia testnet ✓");
  console.log("2. Start the frontend: cd frontend && npm start");
  console.log("3. Connect your wallet in the frontend");
  console.log("4. You should see your tokens and balances!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
