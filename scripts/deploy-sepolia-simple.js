const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Real Estate dApp to Sepolia Testnet...");
  console.log("=".repeat(60));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.05")) {
    console.error("❌ Insufficient ETH balance. You need at least 0.05 ETH for deployment.");
    console.log("Get Sepolia ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }

  // User wallet address
  const userWalletAddress = "0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179";
  console.log("User wallet address:", userWalletAddress);

  console.log("\n1. Deploying Identity Registry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ Identity Registry deployed to:", identityRegistryAddress);

  console.log("\n2. Deploying Compliance Contract...");
  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy(identityRegistryAddress);
  await compliance.waitForDeployment();
  const complianceAddress = await compliance.getAddress();
  console.log("✅ Compliance Contract deployed to:", complianceAddress);

  console.log("\n3. Deploying Real Estate Token...");
  const propertyInfo = {
    propertyAddress: "123 Blockchain Avenue, Crypto City, CC 12345",
    totalValue: ethers.parseEther("1000000"), // $1M property value
    totalShares: 1000000, // 1M shares
    description: "Luxury Property Token - Fractional ownership of premium real estate",
    isActive: true
  };

  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(
    "Luxury Property Token",
    "LPT",
    18,
    identityRegistryAddress,
    complianceAddress,
    propertyInfo
  );
  await realEstateToken.waitForDeployment();
  const realEstateTokenAddress = await realEstateToken.getAddress();
  console.log("✅ Real Estate Token deployed to:", realEstateTokenAddress);

  console.log("\n4. Deploying Mock USDC for payments...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy(
    "USD Coin (Test)",
    "USDC",
    6,
    ethers.parseUnits("1000000000", 6) // 1B USDC supply
  );
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("✅ Mock USDC deployed to:", mockUSDCAddress);

  console.log("\n5. Deploying Lease Manager...");
  const LeaseManager = await ethers.getContractFactory("LeaseManager");
  const leaseManager = await LeaseManager.deploy(mockUSDCAddress);
  await leaseManager.waitForDeployment();
  const leaseManagerAddress = await leaseManager.getAddress();
  console.log("✅ Lease Manager deployed to:", leaseManagerAddress);

  console.log("\n6. Setting up initial configurations...");
  
  // Register deployer identity
  console.log("Registering deployer identity...");
  await identityRegistry.registerIdentity(
    deployer.address,
    deployer.address,
    840 // USA country code
  );

  // Register user identity
  console.log("Registering user identity...");
  await identityRegistry.registerIdentity(
    userWalletAddress,
    userWalletAddress,
    840 // USA country code
  );

  // Mint tokens for user
  console.log("Minting property tokens for user...");
  await realEstateToken.mint(userWalletAddress, ethers.parseEther("100")); // 100 LPT tokens

  // Mint USDC for user
  console.log("Minting USDC for user...");
  await mockUSDC.mint(userWalletAddress, ethers.parseUnits("50000", 6)); // 50,000 USDC

  console.log("\n7. Saving contract addresses...");
  const contractAddresses = {
    identityRegistry: identityRegistryAddress,
    compliance: complianceAddress,
    realEstateToken: realEstateTokenAddress,
    mockUSDC: mockUSDCAddress,
    leaseManager: leaseManagerAddress,
    network: "sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    userWallet: userWalletAddress
  };

  // Save to frontend
  const frontendContractsDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendContractsDir, "addresses.sepolia.json"),
    JSON.stringify(contractAddresses, null, 2)
  );

  // Save deployment info
  fs.writeFileSync(
    "deployment.sepolia.json",
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("📋 Contract Addresses:");
  console.log("Identity Registry:  ", identityRegistryAddress);
  console.log("Compliance:         ", complianceAddress);
  console.log("Real Estate Token:  ", realEstateTokenAddress);
  console.log("Mock USDC:          ", mockUSDCAddress);
  console.log("Lease Manager:      ", leaseManagerAddress);
  
  console.log("\n💰 Token Balances:");
  console.log("User LPT Balance:   ", ethers.formatEther(await realEstateToken.balanceOf(userWalletAddress)), "LPT");
  console.log("User USDC Balance:  ", ethers.formatUnits(await mockUSDC.balanceOf(userWalletAddress), 6), "USDC");
  
  console.log("\n🔗 Network Info:");
  console.log("Network:            Sepolia Testnet");
  console.log("Chain ID:           11155111");
  console.log("Explorer:           https://sepolia.etherscan.io/");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Update frontend to use Sepolia network");
  console.log("2. Add Sepolia network to MetaMask");
  console.log("3. Import your wallet with private key");
  console.log("4. Test the dApp functionality");

  console.log("\n🌐 View on Etherscan:");
  console.log(`Identity Registry:  https://sepolia.etherscan.io/address/${identityRegistryAddress}`);
  console.log(`Compliance:         https://sepolia.etherscan.io/address/${complianceAddress}`);
  console.log(`Real Estate Token:  https://sepolia.etherscan.io/address/${realEstateTokenAddress}`);
  console.log(`Mock USDC:          https://sepolia.etherscan.io/address/${mockUSDCAddress}`);
  console.log(`Lease Manager:      https://sepolia.etherscan.io/address/${leaseManagerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
