# 🚀 Real Estate dApp - Quick Setup Guide

Your Real Estate dApp is now running! Here's how to get started:

## 🌐 Services Running

✅ **Local Blockchain**: Running on `http://127.0.0.1:8545` (Chain ID: 1337)
✅ **Smart Contracts**: Deployed and configured
✅ **React Frontend**: Running on `http://localhost:3000`

## 📱 MetaMask Configuration

### 1. Add Local Network to MetaMask

1. Open MetaMask extension
2. Click the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" or "Custom RPC"
4. Enter the following details:

```
Network Name: Localhost 8545
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

5. Click "Save"

### 2. Import Test Account

Use one of these pre-funded test accounts from Hardhat:

**Account #0 (Deployer - Already has tokens):**
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Account #1:**
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c6a2e0e6a4a2e0e6a4a2e
```

To import:
1. Click MetaMask account icon
2. Select "Import Account"
3. Paste the private key
4. Click "Import"

## 🎯 Testing the dApp

### 1. Open the Application
Navigate to: `http://localhost:3000`

### 2. Connect Wallet
- Click "Connect Wallet" in the top right
- Select MetaMask and approve the connection
- Ensure you're on the "Localhost 8545" network

### 3. Complete KYC (Mock)
- Click "Register Identity (KYC)" on the dashboard
- This enables token transfers and lease participation
- Confirm the transaction in MetaMask

### 4. Explore Features

**Dashboard:**
- View your token balances and property ownership
- See property information and statistics
- Check KYC verification status

**Token Management:**
- Transfer tokens between verified accounts
- Test compliance rules
- View token information

**Lease Management:**
- Create lease agreements (as landlord)
- Pay security deposits (as tenant)
- Make rent payments in USDC

**Compliance:**
- Check your verification status
- Test transfer compliance
- View ERC-3643 information

**Property Details:**
- View tokenized property information
- See your ownership percentage
- Check investment value

## 💰 Contract Addresses

Your deployed contracts:

```
Identity Registry: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Compliance Contract: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Real Estate Token: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Mock USDC: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Lease Manager: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

## 🧪 Test Scenarios

### Scenario 1: Token Transfer
1. Register KYC for your account
2. Go to "Tokens" page
3. Import another test account to MetaMask
4. Register KYC for the second account
5. Transfer tokens between accounts

### Scenario 2: Lease Agreement
1. Create a lease agreement (use second account as tenant)
2. Switch to tenant account
3. Pay security deposit
4. Make monthly rent payments

### Scenario 3: Compliance Testing
1. Go to "Compliance" page
2. Test transfers to different addresses
3. Try transferring to non-KYC accounts (should fail)

## 🔧 Troubleshooting

**MetaMask Issues:**
- Make sure you're on the correct network (Localhost 8545)
- Try resetting your account in MetaMask settings if transactions fail
- Ensure you have sufficient ETH for gas fees

**Transaction Failures:**
- Check if both sender and recipient are KYC verified
- Ensure addresses aren't blacklisted
- Verify sufficient token/USDC balances

**Network Issues:**
- Restart Hardhat node if blockchain stops responding
- Redeploy contracts if needed: `npx hardhat run scripts/deploy.js --network localhost`

## 🎉 You're All Set!

Your Real Estate dApp is now fully functional with:
- ✅ ERC-3643 compliant token transfers
- ✅ KYC/AML verification system  
- ✅ Smart contract lease agreements
- ✅ Rent payment processing
- ✅ Compliance monitoring
- ✅ Modern React UI

Enjoy exploring the future of real estate tokenization! 🏠💎
