# 🚀 Sepolia Deployment Commands

## Prerequisites
1. ✅ Get Sepolia ETH: https://sepoliafaucet.com/
2. ✅ Create .env file with your private key
3. ✅ Ensure you have 0.2+ ETH for deployment

## Deployment Commands

### Option 1: Deploy with existing contracts
```bash
npx hardhat run scripts/deploy-sepolia-simple.js --network sepolia
```

### Option 2: Deploy with secure contracts (if you have .env setup)
```bash
npx hardhat run scripts/deploy-sepolia-secure.js --network sepolia
```

### Option 3: Quick Windows deployment
```bash
deploy-to-sepolia.bat
```

## After Deployment

### Update Frontend for Sepolia
```bash
# Replace the Web3Context import in App.js:
# Change: import { Web3Provider } from './context/Web3Context';
# To:     import { Web3Provider } from './context/Web3ContextSepolia';
```

### Start Frontend
```bash
cd frontend
npm start
```

### Add Sepolia to MetaMask
- Network Name: Sepolia Testnet
- RPC URL: https://rpc.sepolia.org
- Chain ID: 11155111
- Currency: ETH
- Explorer: https://sepolia.etherscan.io

## Your Deployed Assets
After successful deployment, you'll have:
- 100 LPT (Luxury Property Tokens)
- 50,000 USDC (test tokens)
- KYC verified status
- Full access to all dApp features

## Troubleshooting
- "Insufficient funds" → Get more Sepolia ETH
- "Invalid private key" → Check .env file format
- "Network error" → Try different RPC URL
