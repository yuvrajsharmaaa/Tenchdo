# 🚀 Sepolia Testnet Deployment Guide

## 📋 **Pre-Deployment Checklist**

### **1. ✅ Get Sepolia ETH**
- Visit: https://sepoliafaucet.com/
- Or: https://faucets.chain.link/sepolia
- You need **0.2-0.5 ETH** for deployment and testing

### **2. ✅ Setup Environment**
```bash
# Copy environment template
cp env.sepolia.example .env

# Edit .env file with your details:
# PRIVATE_KEY=your_wallet_private_key_without_0x
# SEPOLIA_RPC_URL=https://rpc.sepolia.org
# USER_WALLET_ADDRESS=0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179
```

### **3. ✅ Install Dependencies**
```bash
npm install
cd frontend && npm install
```

---

## 🔐 **Security Improvements Made**

### **Critical Fixes Applied:**

1. **✅ Access Control Enhancement**
   - Added `TOKEN_ROLE` for compliance contract
   - Role-based permissions for all critical functions
   - ReentrancyGuard on all state-changing functions

2. **✅ Input Validation**
   - Comprehensive address validation
   - Amount validation with overflow protection
   - String length validation for all inputs

3. **✅ Gas Optimization**
   - Used `uint128` for storage variables
   - Immutable variables where possible
   - Batch transfer functionality

4. **✅ Emergency Controls**
   - Pausable functionality for emergencies
   - Multi-role access control
   - Event logging for all critical operations

5. **✅ Enhanced Compliance**
   - Secure holder count tracking
   - Country restriction management
   - Blacklist management with events

---

## 🚀 **Deployment Commands**

### **Option 1: Deploy with Default Config**
```bash
# Use default Sepolia RPC
cp hardhat.config.sepolia.js hardhat.config.js
npx hardhat run scripts/deploy-sepolia-secure.js --network sepolia
```

### **Option 2: Deploy with Custom RPC**
```bash
# Edit .env file first, then:
SEPOLIA_RPC_URL=https://your-custom-rpc.com npx hardhat run scripts/deploy-sepolia-secure.js --network sepolia
```

### **Option 3: Deploy with Infura/Alchemy**
```bash
# Set up Infura or Alchemy in .env, then:
npx hardhat run scripts/deploy-sepolia-secure.js --network sepolia_infura
# OR
npx hardhat run scripts/deploy-sepolia-secure.js --network sepolia_alchemy
```

---

## 📱 **Frontend Configuration**

### **Update Frontend for Sepolia:**
```bash
# The deployment script automatically creates:
# frontend/src/contracts/addresses.sepolia.json

# Frontend will auto-detect network and use appropriate addresses
```

### **MetaMask Setup:**
1. **Add Sepolia Network:**
   - Network Name: `Sepolia Testnet`
   - RPC URL: `https://rpc.sepolia.org`
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.etherscan.io`

2. **Import Your Wallet:**
   - Use your private key to import wallet
   - Or use your existing wallet if it has Sepolia ETH

---

## 🎯 **Your Deployment Results**

After successful deployment, you'll get:

### **🏠 Your Property Token (LPT):**
- **Name:** Luxury Property Token
- **Symbol:** LPT
- **Total Supply:** 1,000,000 tokens
- **Your Balance:** 100 LPT tokens
- **Property Value:** $1,000,000 (tokenized)

### **💵 Your USDC Balance:**
- **Amount:** 50,000 USDC (test tokens)
- **Purpose:** Pay rent, security deposits
- **Decimals:** 6 (like real USDC)

### **🔐 KYC Status:**
- **Your Address:** 0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179
- **Status:** ✅ Verified (can receive/send tokens)
- **Country:** USA (840)

---

## 🧪 **Testing Your dApp**

### **1. Start Frontend:**
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

### **2. Connect MetaMask:**
- Switch to Sepolia Testnet
- Connect your wallet
- You should see your LPT and USDC balances

### **3. Test Features:**
- **Transfer Tokens:** Send LPT to another verified address
- **Create Lease:** Set up rental agreement
- **Pay Rent:** Use USDC for monthly payments
- **View Dashboard:** See all your tokenized assets

---

## 🔍 **Contract Verification**

### **Verify on Etherscan:**
```bash
# Get Etherscan API key from https://etherscan.io/apis
# Add to .env: ETHERSCAN_API_KEY=your_api_key

# Verify contracts (commands provided after deployment)
npx hardhat verify --network sepolia CONTRACT_ADDRESS [CONSTRUCTOR_ARGS]
```

---

## 🛡️ **Security Features**

### **Production-Ready Security:**

1. **✅ Role-Based Access Control**
   - Owner, Agent, Compliance Officer roles
   - Multi-signature support ready
   - Emergency pause functionality

2. **✅ Transfer Compliance**
   - KYC/AML verification required
   - Country restrictions
   - Blacklist management
   - Holder limits

3. **✅ Reentrancy Protection**
   - All payable functions protected
   - SafeERC20 for token transfers
   - Checks-Effects-Interactions pattern

4. **✅ Input Validation**
   - Address zero checks
   - Amount validation
   - Overflow protection
   - String length validation

5. **✅ Event Logging**
   - Complete audit trail
   - All critical operations logged
   - Easy monitoring and compliance

---

## 💰 **Cost Breakdown**

### **Estimated Deployment Costs (Sepolia):**
- **Identity Registry:** ~0.05 ETH
- **Compliance Contract:** ~0.08 ETH
- **Real Estate Token:** ~0.12 ETH
- **Mock USDC:** ~0.03 ETH
- **Lease Manager:** ~0.07 ETH
- **Setup Transactions:** ~0.05 ETH
- **Total:** ~0.4 ETH ($0 real cost on testnet)

### **Transaction Costs:**
- **Token Transfer:** ~0.001 ETH
- **Create Lease:** ~0.002 ETH
- **Pay Rent:** ~0.001 ETH
- **KYC Registration:** ~0.001 ETH

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Insufficient ETH"**
   - Get more Sepolia ETH from faucets
   - Wait 24h between faucet requests

2. **"Network Error"**
   - Check RPC URL in hardhat.config.js
   - Try different RPC endpoint

3. **"Contract Not Deployed"**
   - Check deployment logs for errors
   - Verify network configuration

4. **"MetaMask Connection Failed"**
   - Add Sepolia network to MetaMask
   - Import correct wallet address
   - Check network selection

---

## 🎉 **Success Indicators**

### **When Everything Works:**
- ✅ All 5 contracts deployed successfully
- ✅ Your wallet has 100 LPT + 50,000 USDC
- ✅ KYC status shows "Verified"
- ✅ Frontend connects to Sepolia
- ✅ Can transfer tokens between verified addresses
- ✅ Can create and manage leases
- ✅ All transactions show on Sepolia Etherscan

---

## 📞 **Support**

### **If You Need Help:**
1. Check deployment logs for specific errors
2. Verify your .env configuration
3. Ensure sufficient Sepolia ETH balance
4. Test network connectivity
5. Check MetaMask network settings

**Your Real Estate dApp will be production-ready on Sepolia! 🏠✨**
