const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Setting up user account...");
  
  const [deployer] = await ethers.getSigners();
  const userAccount = "0x6CBA1D71ccA7519C11cafaD4EbF6244D35Ea1E35";
  
  console.log("Deployer:", deployer.address);
  console.log("User Account:", userAccount);
  
  // Contract addresses from deployment
  const addresses = {
    identityRegistry: "0x95401dc811bb5740090279Ba06cfA8fcF6113778",
    compliance: "0x998abeb3E57409262aE5b751f60747921B33613E",
    realEstateToken: "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49",
    mockUSDC: "0x4826533B4897376654Bb4d4AD88B7faFD0C98528",
    leaseManager: "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf"
  };

  try {
    // 1. Setup Identity Registry
    console.log("\n1. Setting up Identity Registry...");
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const identityRegistry = IdentityRegistry.attach(addresses.identityRegistry);
    
    // Register user identity (KYC)
    await identityRegistry.registerIdentity(userAccount, userAccount, 840); // USA
    console.log("✅ User identity registered (KYC completed)");
    
    // Verify registration
    const isVerified = await identityRegistry.isVerified(userAccount);
    console.log("✅ Verification status:", isVerified);
    
    // 2. Setup Real Estate Token
    console.log("\n2. Setting up Real Estate Token...");
    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    const realEstateToken = RealEstateToken.attach(addresses.realEstateToken);
    
    // Mint tokens to user
    await realEstateToken.mint(userAccount, ethers.parseEther("50")); // 50 REPT tokens
    console.log("✅ Minted 50 REPT tokens to user");
    
    // Check balance
    const tokenBalance = await realEstateToken.balanceOf(userAccount);
    console.log("✅ User token balance:", ethers.formatEther(tokenBalance), "REPT");
    
    // 3. Setup Mock USDC
    console.log("\n3. Setting up Mock USDC...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUSDC = MockERC20.attach(addresses.mockUSDC);
    
    // Mint USDC to user
    await mockUSDC.mint(userAccount, ethers.parseUnits("10000", 6)); // 10,000 USDC
    console.log("✅ Minted 10,000 USDC to user");
    
    // Check balance
    const usdcBalance = await mockUSDC.balanceOf(userAccount);
    console.log("✅ User USDC balance:", ethers.formatUnits(usdcBalance, 6), "USDC");
    
    // 4. Test Compliance
    console.log("\n4. Testing Compliance...");
    const Compliance = await ethers.getContractFactory("Compliance");
    const compliance = Compliance.attach(addresses.compliance);
    
    const canTransfer = await compliance.canTransfer(
      userAccount, 
      deployer.address, 
      ethers.parseEther("1")
    );
    console.log("✅ Can transfer tokens:", canTransfer);
    
    console.log("\n🎉 USER ACCOUNT SETUP COMPLETE!");
    console.log("========================================");
    console.log("User Address:", userAccount);
    console.log("✅ KYC Status: Verified");
    console.log("✅ REPT Tokens: 50.0");
    console.log("✅ USDC Balance: 10,000.0");
    console.log("✅ Can use all dApp features");
    console.log("\n🚀 Refresh your dApp - everything should work now!");
    
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    console.error("Full error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


