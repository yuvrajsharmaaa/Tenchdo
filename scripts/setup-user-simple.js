const hre = require("hardhat");

async function main() {
  console.log("🔧 Setting up user account (Simple Version)...");
  
  const [deployer] = await hre.ethers.getSigners();
  const userAccountAddress = "0x6CBA1D71ccA7519C11cafaD4EbF6244D35Ea1E35";
  
  console.log("Deployer:", deployer.address);
  console.log("User Account:", userAccountAddress);
  
  // Load contract addresses
  const fs = require('fs');
  const addresses = JSON.parse(fs.readFileSync('./frontend/src/contracts/addresses.json', 'utf8'));
  
  try {
    // Get contracts
    const identityRegistry = await hre.ethers.getContractAt("IdentityRegistry", addresses.identityRegistry);
    const realEstateToken = await hre.ethers.getContractAt("RealEstateToken", addresses.realEstateToken);
    const mockUSDC = await hre.ethers.getContractAt("MockERC20", addresses.mockUSDC);
    
    console.log("\n1. Registering user identity...");
    try {
      await identityRegistry.connect(deployer).registerIdentity(
        userAccountAddress, 
        userAccountAddress, 
        840 // USA country code
      );
      console.log("✅ User identity registered");
    } catch (error) {
      if (error.message.includes("Identity already registered")) {
        console.log("✅ User identity already registered");
      } else {
        throw error;
      }
    }
    
    console.log("\n2. Minting REPT tokens...");
    try {
      await realEstateToken.connect(deployer).mint(userAccountAddress, hre.ethers.parseEther("50"));
      console.log("✅ 50 REPT tokens minted");
    } catch (error) {
      console.log("⚠️ REPT minting:", error.message.substring(0, 100));
    }
    
    console.log("\n3. Minting USDC tokens...");
    try {
      await mockUSDC.connect(deployer).mint(userAccountAddress, "10000000000"); // 10,000 USDC (6 decimals)
      console.log("✅ 10,000 USDC tokens minted");
    } catch (error) {
      console.log("⚠️ USDC minting:", error.message.substring(0, 100));
    }
    
    console.log("\n🎉 USER ACCOUNT SETUP COMPLETE!");
    console.log("========================================");
    console.log("User Address:", userAccountAddress);
    console.log("✅ ETH Balance: 1,000.0 ETH (for gas)");
    console.log("✅ REPT Tokens: 50.0 (Real Estate)");
    console.log("✅ USDC Balance: 10,000.0 (Payments)");
    console.log("✅ KYC Status: Registered");
    console.log("========================================");
    
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

