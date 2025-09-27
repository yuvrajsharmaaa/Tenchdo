const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing Contract Calls Directly...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Contract addresses from deployment
  const addresses = {
    identityRegistry: "0x95401dc811bb5740090279Ba06cfA8fcF6113778",
    compliance: "0x998abeb3E57409262aE5b751f60747921B33613E",
    realEstateToken: "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49",
    mockUSDC: "0x4826533B4897376654Bb4d4AD88B7faFD0C98528",
    leaseManager: "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf"
  };

  try {
    // 1. Test Identity Registry
    console.log("1. Testing Identity Registry...");
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const identityRegistry = IdentityRegistry.attach(addresses.identityRegistry);
    
    const isVerified = await identityRegistry.isVerified(deployer.address);
    console.log(`✅ isVerified(${deployer.address}):`, isVerified);
    
    // 2. Test Real Estate Token
    console.log("\n2. Testing Real Estate Token...");
    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    const realEstateToken = RealEstateToken.attach(addresses.realEstateToken);
    
    const tokenBalance = await realEstateToken.balanceOf(deployer.address);
    console.log(`✅ Token Balance:`, ethers.formatEther(tokenBalance), "REPT");
    
    const tokenName = await realEstateToken.name();
    console.log(`✅ Token Name:`, tokenName);
    
    const tokenSymbol = await realEstateToken.symbol();
    console.log(`✅ Token Symbol:`, tokenSymbol);
    
    // 3. Test Mock USDC
    console.log("\n3. Testing Mock USDC...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUSDC = MockERC20.attach(addresses.mockUSDC);
    
    const usdcBalance = await mockUSDC.balanceOf(deployer.address);
    console.log(`✅ USDC Balance:`, ethers.formatUnits(usdcBalance, 6), "USDC");
    
    const usdcName = await mockUSDC.name();
    console.log(`✅ USDC Name:`, usdcName);
    
    const usdcDecimals = await mockUSDC.decimals();
    console.log(`✅ USDC Decimals:`, usdcDecimals);
    
    // 4. Test Compliance
    console.log("\n4. Testing Compliance...");
    const Compliance = await ethers.getContractFactory("Compliance");
    const compliance = Compliance.attach(addresses.compliance);
    
    const canTransfer = await compliance.canTransfer(
      deployer.address, 
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 
      ethers.parseEther("1")
    );
    console.log(`✅ canTransfer:`, canTransfer);
    
    // 5. Test Lease Manager
    console.log("\n5. Testing Lease Manager...");
    const LeaseManager = await ethers.getContractFactory("LeaseManager");
    const leaseManager = LeaseManager.attach(addresses.leaseManager);
    
    const landlordLeases = await leaseManager.getLandlordLeases(deployer.address);
    console.log(`✅ Landlord Leases:`, landlordLeases.length);
    
    console.log("\n🎉 ALL CONTRACT CALLS SUCCESSFUL!");
    
  } catch (error) {
    console.error("❌ Contract call failed:", error.message);
    console.error("Full error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


