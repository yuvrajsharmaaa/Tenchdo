# 🚀 Complete Sepolia Deployment Guide

## 📋 **Prerequisites Checklist**

### ✅ **Step 1: Get Sepolia ETH**
1. Visit: **https://sepoliafaucet.com/**
2. Connect your wallet: `0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179`
3. Request **0.2-0.5 ETH** (you may need to wait 24h between requests)

### ✅ **Step 2: Get Your Private Key**
1. Open MetaMask
2. Click your account → **Account Details** → **Export Private Key**
3. Copy the private key (remove the `0x` prefix)

### ✅ **Step 3: (Optional) Get RPC API Key**
Choose ONE for faster/reliable deployment:

**Option A: Alchemy (Recommended)**
1. Go to: https://alchemy.com
2. Sign up for free account
3. Create new app → Select "Sepolia"
4. Copy your API key

**Option B: Infura**
1. Go to: https://infura.io
2. Sign up for free account  
3. Create new project → Select "Sepolia"
4. Copy your Project ID

---

## 🔧 **Deployment Steps**

### **Step 1: Create Environment File**
```bash
# Copy the template
copy env.sepolia.example .env

# Edit .env file with your details:
```

**Edit `.env` file:**
```bash
# Your wallet private key (without 0x)
PRIVATE_KEY=abc123def456...

# Choose ONE RPC option:

# Option 1: Free RPC (slower)
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Option 2: Alchemy (faster) - uncomment if you have API key
# ALCHEMY_API_KEY=your_alchemy_api_key

# Option 3: Infura (faster) - uncomment if you have Project ID  
# INFURA_PROJECT_ID=your_infura_project_id

# Your wallet address
USER_WALLET_ADDRESS=0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179

# Optional: Etherscan API for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### **Step 2: Deploy to Sepolia**
```bash
# Install dependencies
npm install

# Deploy contracts
npx hardhat run scripts/deploy-sepolia-simple.js --network sepolia
```

### **Step 3: Verify Deployment**
After successful deployment, you'll see:
```bash
🎉 DEPLOYMENT COMPLETE!
========================================
📋 Contract Addresses:
Identity Registry:   0x1234...
Compliance:          0x5678...
Real Estate Token:   0x9abc...
Mock USDC:           0xdef0...
Lease Manager:       0x1357...

💰 Token Balances:
User LPT Balance:    100.0 LPT
User USDC Balance:   50000.0 USDC

🔗 Network Info:
Network:             Sepolia Testnet
Chain ID:            11155111
Explorer:            https://sepolia.etherscan.io/
```

---

## 📱 **Frontend Setup**

### **Step 1: Update Frontend for Sepolia**
The deployment automatically creates `frontend/src/contracts/addresses.sepolia.json`

### **Step 2: Use Sepolia-Aware Context**
In `frontend/src/App.js`, replace:
```javascript
// Change from:
import { Web3Provider } from './context/Web3Context';

// To:
import { Web3Provider } from './context/Web3ContextSepolia';
```

### **Step 3: Start Frontend**
```bash
cd frontend
npm start
```

---

## 🦊 **MetaMask Setup**

### **Add Sepolia Network:**
1. Open MetaMask → Networks → Add Network
2. Fill in details:
   - **Network Name:** Sepolia Testnet
   - **RPC URL:** https://rpc.sepolia.org
   - **Chain ID:** 11155111
   - **Currency Symbol:** ETH
   - **Block Explorer:** https://sepolia.etherscan.io

### **Import Your Wallet:**
1. MetaMask → Import Account
2. Enter your private key
3. Switch to Sepolia network
4. You should see your Sepolia ETH balance

---

## 🔍 **Contract Verification (Optional)**

After deployment, verify your contracts on Etherscan:

```bash
# Verify Identity Registry
npx hardhat verify --network sepolia YOUR_IDENTITY_REGISTRY_ADDRESS

# Verify Compliance
npx hardhat verify --network sepolia YOUR_COMPLIANCE_ADDRESS "YOUR_IDENTITY_REGISTRY_ADDRESS"

# Verify Real Estate Token
npx hardhat verify --network sepolia YOUR_TOKEN_ADDRESS "Luxury Property Token" "LPT" 18 "YOUR_IDENTITY_REGISTRY_ADDRESS" "YOUR_COMPLIANCE_ADDRESS" '{"propertyAddress":"123 Blockchain Avenue, Crypto City, CC 12345","totalValue":"1000000000000000000000000","totalShares":1000000,"description":"Luxury Property Token - Fractional ownership of premium real estate","isActive":true}'

# Verify Mock USDC
npx hardhat verify --network sepolia YOUR_USDC_ADDRESS "USD Coin (Test)" "USDC" 6 "1000000000000000"

# Verify Lease Manager
npx hardhat verify --network sepolia YOUR_LEASE_MANAGER_ADDRESS "YOUR_USDC_ADDRESS"
```

---

## 🎯 **Your Deployed Assets**

After successful deployment, you'll have:

### **🏠 Property Tokens (LPT)**
- **Balance:** 100 LPT tokens
- **Value:** Represents $1M property
- **Transferable:** Only to KYC-verified addresses

### **💵 USDC Tokens**
- **Balance:** 50,000 USDC
- **Purpose:** Pay rent, security deposits
- **Decimals:** 6 (like real USDC)

### **🔐 KYC Status**
- **Your Address:** Verified ✅
- **Country:** USA (840)
- **Can:** Send/receive tokens, create leases

---

## 🧪 **Testing Your dApp**

### **1. Connect MetaMask**
- Switch to Sepolia network
- Connect to http://localhost:3000
- You should see your balances

### **2. Test Token Transfers**
- Try sending LPT to another verified address
- Transfers to unverified addresses should fail

### **3. Test Lease Creation**
- Create a rental agreement
- Pay security deposit with USDC
- Make rent payments

### **4. View on Etherscan**
- Check your transactions on https://sepolia.etherscan.io/
- View contract interactions

---

## 🚨 **Troubleshooting**

### **"Insufficient funds for gas"**
- Get more Sepolia ETH from faucet
- Wait 24h between faucet requests

### **"Invalid private key"**
- Remove `0x` prefix from private key
- Check .env file format

### **"Network connection error"**
- Try different RPC URL
- Check internet connection
- Use Alchemy/Infura for reliability

### **"Contract not deployed"**
- Check deployment logs for errors
- Verify network configuration
- Ensure sufficient ETH balance

### **"MetaMask connection failed"**
- Add Sepolia network to MetaMask
- Switch to correct network
- Import correct wallet address

---

## 🎉 **Success Indicators**

When everything works correctly:
- ✅ All 5 contracts deployed successfully
- ✅ Your wallet shows 100 LPT + 50,000 USDC
- ✅ KYC status is "Verified"
- ✅ Frontend connects to Sepolia
- ✅ Can transfer tokens between verified addresses
- ✅ Transactions appear on Sepolia Etherscan
- ✅ All contract interactions work smoothly

---

## 🌐 **Live Contract Addresses**

After deployment, your contracts will be live at:
- **Sepolia Etherscan:** https://sepolia.etherscan.io/
- **Network:** Sepolia Testnet (Chain ID: 11155111)
- **Cost:** $0 (testnet ETH is free)

**Your Real Estate dApp MVP is now live on Sepolia! 🏠✨**
