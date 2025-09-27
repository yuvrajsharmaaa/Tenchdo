const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying ULTRA-OPTIMIZED contracts...");
  console.log("Account:", (await ethers.getSigners())[0].address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance((await ethers.getSigners())[0].address)), "ETH");

  const [deployer] = await ethers.getSigners();

  // 1. Deploy Identity Registry (reuse existing)
  console.log("\n1. Deploying Identity Registry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  console.log("✅ Identity Registry:", await identityRegistry.getAddress());

  // 2. Deploy Mock USDC (reuse existing)
  console.log("\n2. Deploying Mock USDC...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6);
  await mockUSDC.waitForDeployment();
  console.log("✅ Mock USDC:", await mockUSDC.getAddress());

  // 3. Deploy OPTIMIZED Real Estate Token
  console.log("\n3. Deploying OPTIMIZED Real Estate Token...");
  const RealEstateTokenOptimized = await ethers.getContractFactory("RealEstateTokenOptimized");
  
  // First deploy compliance (needs token address)
  const ComplianceOptimized = await ethers.getContractFactory("ComplianceOptimized");
  
  // Deploy compliance first with placeholder
  const compliance = await ComplianceOptimized.deploy(
    await identityRegistry.getAddress(),
    ethers.ZeroAddress // Placeholder - will update after token deployment
  );
  await compliance.waitForDeployment();
  
  // Now deploy token with real compliance address
  const realEstateToken = await RealEstateTokenOptimized.deploy(
    "Real Estate Property Token",
    "REPT",
    18,
    await identityRegistry.getAddress(),
    await compliance.getAddress(),
    "123 Blockchain Street, Crypto City, CC 12345",
    "Luxury residential property tokenized for fractional ownership",
    "1000000000000000000000000", // 1M ETH as string (uint128 compatible)
    "1000000" // 1M shares as string (uint128 compatible)
  );
  await realEstateToken.waitForDeployment();
  console.log("✅ OPTIMIZED Real Estate Token:", await realEstateToken.getAddress());

  // 4. Update compliance with real token address (if needed)
  console.log("\n4. OPTIMIZED Compliance already deployed:", await compliance.getAddress());

  // 5. Deploy OPTIMIZED Lease Manager
  console.log("\n5. Deploying OPTIMIZED Lease Manager...");
  const LeaseManagerOptimized = await ethers.getContractFactory("LeaseManagerOptimized");
  const leaseManager = await LeaseManagerOptimized.deploy(await mockUSDC.getAddress());
  await leaseManager.waitForDeployment();
  console.log("✅ OPTIMIZED Lease Manager:", await leaseManager.getAddress());

  // 6. Setup initial configurations
  console.log("\n6. Setting up configurations...");
  
  // Register deployer identity
  await identityRegistry.registerIdentity(deployer.address, deployer.address, 840);
  console.log("✅ Deployer identity registered");

  // Mint test USDC
  await mockUSDC.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
  console.log("✅ Mock USDC minted");

  // Mint property tokens
  await realEstateToken.mint(deployer.address, ethers.parseEther("100"));
  console.log("✅ Property tokens minted");

  // Save deployment addresses
  const addresses = {
    identityRegistry: await identityRegistry.getAddress(),
    compliance: await compliance.getAddress(),
    realEstateToken: await realEstateToken.getAddress(),
    mockUSDC: await mockUSDC.getAddress(),
    leaseManager: await leaseManager.getAddress(),
    deployer: deployer.address,
    network: "localhost",
    chainId: 1337,
    optimized: true
  };

  const addressesPath = path.join(__dirname, '../frontend/src/contracts/addresses.json');
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  console.log("\n🎉 ULTRA-OPTIMIZED DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("Identity Registry:", addresses.identityRegistry);
  console.log("OPTIMIZED Compliance:", addresses.compliance);
  console.log("OPTIMIZED Real Estate Token:", addresses.realEstateToken);
  console.log("Mock USDC:", addresses.mockUSDC);
  console.log("OPTIMIZED Lease Manager:", addresses.leaseManager);
  console.log("Network: LOCAL HARDHAT (Chain ID: 1337)");
  console.log("Cost: 100% FREE TEST ETH");
  console.log("\n💡 Gas Optimizations Applied:");
  console.log("- Packed structs for storage efficiency");
  console.log("- Immutable variables where possible");
  console.log("- Optimized loops with unchecked arithmetic");
  console.log("- Early returns in validation functions");
  console.log("- Reduced external calls");
  console.log("- Efficient event indexing");
  
  console.log("\nContract addresses saved to frontend/src/contracts/addresses.json");
  console.log("\n🚀 Ready to use at: http://localhost:3000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
