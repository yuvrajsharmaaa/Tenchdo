const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying contracts with account:", (await ethers.getSigners())[0].address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance((await ethers.getSigners())[0].address)));

  const [deployer] = await ethers.getSigners();

  // 1. Deploy Identity Registry
  console.log("\n1. Deploying Identity Registry...");
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  console.log("Identity Registry deployed to:", await identityRegistry.getAddress());

  // 2. Deploy Compliance Contract (Fixed version)
  console.log("\n2. Deploying Compliance Contract...");
  const ComplianceFixed = await ethers.getContractFactory("ComplianceFixed");
  const compliance = await ComplianceFixed.deploy(await identityRegistry.getAddress());
  await compliance.waitForDeployment();
  console.log("Compliance Contract deployed to:", await compliance.getAddress());

  // 3. Deploy Real Estate Token (Fixed version)
  console.log("\n3. Deploying Real Estate Token...");
  const propertyInfo = {
    propertyAddress: "123 Blockchain Street, Crypto City, CC 12345",
    totalValue: ethers.parseEther("1000000"), // 1M ETH equivalent
    totalShares: 1000000, // 1M shares
    description: "Luxury residential property tokenized for fractional ownership",
    isActive: true
  };

  const RealEstateTokenFixed = await ethers.getContractFactory("RealEstateTokenFixed");
  const realEstateToken = await RealEstateTokenFixed.deploy(
    "Real Estate Property Token",
    "REPT",
    18,
    await identityRegistry.getAddress(),
    await compliance.getAddress(),
    propertyInfo
  );
  await realEstateToken.waitForDeployment();
  console.log("Real Estate Token deployed to:", await realEstateToken.getAddress());

  // 4. Deploy Mock USDC
  console.log("\n4. Deploying Mock USDC...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6);
  await mockUSDC.waitForDeployment();
  console.log("Mock USDC deployed to:", await mockUSDC.getAddress());

  // 5. Deploy Lease Manager (Fixed version)
  console.log("\n5. Deploying Lease Manager...");
  const LeaseManagerFixed = await ethers.getContractFactory("LeaseManagerFixed");
  const leaseManager = await LeaseManagerFixed.deploy(await mockUSDC.getAddress());
  await leaseManager.waitForDeployment();
  console.log("Lease Manager deployed to:", await leaseManager.getAddress());

  // 6. Set token contract in compliance
  console.log("\n6. Setting up configurations...");
  await compliance.setTokenContract(await realEstateToken.getAddress());
  console.log("Token contract set in compliance");

  // 7. Register deployer identity
  await identityRegistry.registerIdentity(deployer.address, deployer.address, 840); // USA
  console.log("Deployer identity registered");

  // 8. Mint test USDC
  await mockUSDC.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
  console.log("Mock USDC minted for testing");

  // 9. Mint property tokens
  await realEstateToken.mint(deployer.address, ethers.parseEther("100"));
  console.log("Property tokens minted for testing");

  // Save deployment addresses
  const addresses = {
    identityRegistry: await identityRegistry.getAddress(),
    compliance: await compliance.getAddress(),
    realEstateToken: await realEstateToken.getAddress(),
    mockUSDC: await mockUSDC.getAddress(),
    leaseManager: await leaseManager.getAddress(),
    deployer: deployer.address
  };

  const addressesPath = path.join(__dirname, '../frontend/src/contracts/addresses.json');
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("Identity Registry:", addresses.identityRegistry);
  console.log("Compliance Contract:", addresses.compliance);
  console.log("Real Estate Token:", addresses.realEstateToken);
  console.log("Mock USDC:", addresses.mockUSDC);
  console.log("Lease Manager:", addresses.leaseManager);
  console.log("\nContract addresses saved to frontend/src/contracts/addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
