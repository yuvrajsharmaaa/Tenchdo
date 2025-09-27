#!/bin/bash

echo "🚀 Real Estate dApp - Sepolia Deployment"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create .env file with your configuration:"
    echo "1. Copy env.sepolia.example to .env"
    echo "2. Add your PRIVATE_KEY"
    echo "3. Set USER_WALLET_ADDRESS=0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Copy Sepolia config
echo "📋 Setting up Sepolia configuration..."
cp hardhat.config.sepolia.js hardhat.config.js
echo "✅ Hardhat configured for Sepolia"

echo ""
echo "🔧 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🚀 Deploying contracts to Sepolia..."
echo "This may take 2-3 minutes..."
echo ""
npx hardhat run scripts/deploy-sepolia-secure.js --network sepolia

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "- Insufficient Sepolia ETH (get from https://sepoliafaucet.com/)"
    echo "- Invalid private key in .env file"
    echo "- Network connectivity issues"
    echo ""
    exit 1
fi

echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo ""
echo "Next steps:"
echo "1. Update frontend: replace Web3Context.js with Web3ContextSepolia.js"
echo "2. Start frontend: cd frontend && npm start"
echo "3. Add Sepolia network to MetaMask"
echo "4. Import your wallet and test the dApp"
echo ""
echo "Your tokens are ready! 🏠✨"
echo ""
