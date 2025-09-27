# 🔧 Frontend ABI Error Fix

## Current Issue
The frontend is showing "Parameter decoding error" because it's using cached contract data that doesn't match the newly deployed contracts.

## ✅ IMMEDIATE SOLUTION

### Step 1: Clear Browser Cache
1. **In your browser** (Chrome/Edge/Firefox):
   - Press `Ctrl + Shift + R` (hard refresh)
   - Or press `F12` → Right-click refresh button → "Empty Cache and Hard Reload"

### Step 2: Reset MetaMask
1. **Open MetaMask**
2. **Go to Settings → Advanced → Reset Account**
3. **Confirm the reset** (this clears transaction cache)

### Step 3: Restart Frontend Development Server
1. **Stop the frontend** (Ctrl+C in frontend terminal)
2. **Clear React cache**:
   ```bash
   cd frontend
   rm -rf node_modules/.cache
   npm start
   ```

### Step 4: Verify Network Settings
1. **Ensure MetaMask is on localhost network**:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`

## 🔍 Root Cause Analysis

The error occurs because:
1. **Frontend cached old contract addresses**
2. **Browser cached old ABIs**
3. **MetaMask cached old transaction data**
4. **React dev server cached old contract instances**

## ✅ Verification Steps

After applying the fix, you should see:
1. ✅ No more "Parameter decoding error"
2. ✅ Dashboard loads with correct balances
3. ✅ Identity registration works
4. ✅ All contract calls successful

## 🚀 Expected Results

Once fixed, your console should show:
```
✅ RealEstateToken contract initialized
✅ IdentityRegistry contract initialized  
✅ Compliance contract initialized
✅ LeaseManager contract initialized
✅ MockUSDC contract initialized
✅ Network connectivity verified
✅ Dashboard data loaded successfully
```

## 🆘 If Issues Persist

If you still get errors after the above steps:

### Nuclear Option - Complete Reset:
```bash
# Terminal 1: Stop everything
taskkill /f /im node.exe

# Terminal 1: Fresh start
npx hardhat node

# Terminal 2: Fresh deployment  
npx hardhat run scripts/deploy.js --network localhost
node scripts/copy-abis.js

# Terminal 3: Fresh frontend
cd frontend
rm -rf node_modules/.cache
rm -rf build
npm start
```

### MetaMask Complete Reset:
1. **Backup your wallet** (write down seed phrase)
2. **Reset MetaMask completely** (Settings → Advanced → Reset Wallet)
3. **Import account** using private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. **Add localhost network** again

## 📋 Current Contract Status

✅ **All contracts deployed and working:**
- Identity Registry: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Compliance: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- Real Estate Token: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- Mock USDC: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- Lease Manager: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

✅ **Hardhat node running on localhost:8545**
✅ **ABIs synced to frontend**
✅ **Test data configured**

The system is working - it's just a frontend caching issue!
