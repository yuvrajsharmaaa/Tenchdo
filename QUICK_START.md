# 🚀 Quick Start Guide - Real Estate dApp

## ✅ **EVERYTHING IS NOW RUNNING!**

### 📍 **Current Status:**
- ✅ **Hardhat Node**: Running on `http://127.0.0.1:8545`
- ✅ **Smart Contracts**: Deployed and working
- ✅ **React Frontend**: Starting on `http://localhost:3000`
- ✅ **All Tests**: Passing (10/10)

---

## 🔧 **MetaMask Setup (REQUIRED)**

### 1. **Add Local Network to MetaMask:**
```
Network Name: Localhost 8545
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
```

### 2. **Import Test Account:**
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Balance: 10,000 ETH (FREE TEST MONEY!)
```

---

## 🌐 **Access Your dApp:**

### **Frontend URL: `http://localhost:3000`**

---

## 📋 **First Time Setup:**

### 1. **Connect MetaMask** 
   - Click "Connect Wallet" button
   - Select the imported test account

### 2. **Complete KYC Registration**
   - Click "Register Identity (KYC)" 
   - **Approve the transaction** (uses FREE test ETH)
   - This unlocks all ERC-3643 features

### 3. **Start Using the dApp!**
   - ✅ Transfer property tokens
   - ✅ Create lease agreements
   - ✅ Pay rent in USDC
   - ✅ Monitor compliance

---

## 💰 **About Network Fees:**

- **You have 10,000 ETH** of test currency
- **Network fees are tiny** (~0.02 ETH per transaction)
- **Everything costs $0.00** in real money
- **You're on localhost** - completely safe!

---

## 🏠 **Contract Addresses:**
```
Identity Registry: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Compliance Contract: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Real Estate Token: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Mock USDC: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Lease Manager: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

---

## 🎯 **What You Can Do:**

### **Token Management:**
- View your property token balance
- Transfer tokens to verified users
- Mint new property tokens (if owner)

### **Lease Management:**
- Create new lease agreements
- Pay security deposits
- Make monthly rent payments
- View active leases

### **Compliance Features:**
- Register new identities (KYC)
- Check verification status
- View compliance rules

---

## 🔄 **If Something Goes Wrong:**

### **Restart Everything:**
```bash
# Kill all processes
taskkill /f /im node.exe

# Start Hardhat node (in project root)
npx hardhat node

# Deploy contracts (in new terminal)
npx hardhat run scripts/deploy.js --network localhost

# Start frontend (in new terminal)
cd frontend && npm start
```

---

## 🎉 **You're All Set!**

**Your Real Estate dApp is now fully functional with:**
- ERC-3643 compliant tokens
- KYC/AML compliance
- Smart contract leases
- Rent payment system
- Modern React UI

**Happy building! 🏠✨**
