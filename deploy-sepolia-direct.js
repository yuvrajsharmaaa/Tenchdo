// Direct deployment script for Sepolia testnet
// This script will prompt you to enter your private key

const { ethers } = require("ethers");

async function main() {
  console.log("🚀 Direct Deploy to Sepolia Testnet");
  console.log("====================================");
  
  // Sepolia RPC URL
  const SEPOLIA_RPC_URL = "https://rpc.sepolia.org";
  const SEPOLIA_CHAIN_ID = 11155111;
  
  // You need to replace this with your actual private key
  const PRIVATE_KEY = "your_private_key_here"; // Replace this with your actual private key
  
  if (PRIVATE_KEY === "your_private_key_here") {
    console.log("❌ Please edit this script and replace 'your_private_key_here' with your actual private key");
    console.log("Your Sepolia ETH address: 0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179");
    console.log("\nSteps to get your private key:");
    console.log("1. Open MetaMask");
    console.log("2. Click on the three dots next to your account");
    console.log("3. Select 'Account details'");
    console.log("4. Click 'Show private key'");
    console.log("5. Copy the private key (without 0x prefix)");
    console.log("6. Replace 'your_private_key_here' in this script");
    return;
  }
  
  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("Deploying contracts with account:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.log("❌ No ETH balance found. Please get Sepolia ETH from:");
      console.log("https://sepoliafaucet.com/");
      console.log("https://faucet.sepolia.dev/");
      return;
    }
    
    // Check if we're on the right network
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
      console.log("❌ Wrong network. Expected Sepolia (Chain ID: 11155111), got:", Number(network.chainId));
      return;
    }
    
    console.log("✅ Connected to Sepolia testnet");
    
    // Deploy contracts using the existing deployment logic
    console.log("\n📋 Contract addresses will be saved to:");
    console.log("./frontend/src/contracts/addresses.sepolia.json");
    
    console.log("\n💡 To deploy with Hardhat (recommended):");
    console.log("1. Edit .env file and replace 'your_private_key_here' with your actual private key");
    console.log("2. Run: npx hardhat run scripts/deploy-sepolia.js --network sepolia");
    
    console.log("\n🔧 Quick fix for .env file:");
    console.log("Replace 'your_private_key_here' with your actual private key in the .env file");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
