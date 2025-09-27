# 🚀 Start Your Real Estate dApp on Localhost

## Step-by-Step Instructions

### Step 1: Fix .env File
Replace your .env file content with:
```
PRIVATE_KEY=dummy_key_for_localhost_testing_only
SEPOLIA_RPC_URL=http://127.0.0.1:8545
USER_WALLET_ADDRESS=0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179
REPORT_GAS=true
```

### Step 2: Open 3 Terminals

**Terminal 1 - Start Blockchain:**
```bash
cd C:\Users\YUVRAJ\OneDrive\Desktop\archdo_ai_eth
npx hardhat node
```
Wait until you see: "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"

**Terminal 2 - Deploy Contracts:**
```bash
cd C:\Users\YUVRAJ\OneDrive\Desktop\archdo_ai_eth
npx hardhat run scripts/deploy.js --network localhost
```
Wait until you see: "Contract addresses saved to frontend/src/contracts/addresses.json"

**Terminal 3 - Start Frontend:**
```bash
cd C:\Users\YUVRAJ\OneDrive\Desktop\archdo_ai_eth\frontend
npm start
```
Website will open at: http://localhost:3000

### Step 3: Setup MetaMask

**Add Localhost Network:**
- Network Name: Localhost 8545
- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Currency: ETH

**Import Test Account:**
- Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
- This account will have 10,000 ETH and your tokens

### Step 4: Fund Your Wallet
After deployment, run:
```bash
npx hardhat run scripts/send-eth-to-user.js --network localhost
```

## ✅ Success Indicators
- Terminal 1: Shows "Account #0: 0xf39Fd..." with 10000 ETH
- Terminal 2: Shows 5 contract addresses deployed
- Terminal 3: Website opens at localhost:3000
- MetaMask: Shows your ETH balance and connects to localhost
- Website: Shows your token balances (LPT and USDC)

## 🎯 Your Final Setup
- 100 LPT tokens (property ownership)
- 10,000 USDC (for payments)  
- 1,000+ ETH (for gas fees)
- All contracts working on localhost
- Full dApp functionality

## 🚨 If Something Fails
1. Close all terminals
2. Run: taskkill /F /IM node.exe
3. Start again from Step 2
4. Make sure .env file is correct
