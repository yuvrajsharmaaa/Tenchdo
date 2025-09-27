@echo off
echo 🚀 Real Estate dApp - Sepolia Deployment
echo ==========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo.
    echo Please create .env file with your configuration:
    echo 1. Copy env.sepolia.example to .env
    echo 2. Add your PRIVATE_KEY
    echo 3. Set USER_WALLET_ADDRESS=0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179
    echo.
    pause
    exit /b 1
)

echo ✅ Environment file found
echo.

REM Copy Sepolia config
echo 📋 Setting up Sepolia configuration...
copy hardhat.config.sepolia.js hardhat.config.js > nul
echo ✅ Hardhat configured for Sepolia

echo.
echo 🔧 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying contracts to Sepolia...
echo This may take 2-3 minutes...
echo.
call npx hardhat run scripts/deploy-sepolia-secure.js --network sepolia

if errorlevel 1 (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo Common issues:
    echo - Insufficient Sepolia ETH ^(get from https://sepoliafaucet.com/^)
    echo - Invalid private key in .env file
    echo - Network connectivity issues
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 DEPLOYMENT SUCCESSFUL!
echo.
echo Next steps:
echo 1. Update frontend: replace Web3Context.js with Web3ContextSepolia.js
echo 2. Start frontend: cd frontend ^&^& npm start
echo 3. Add Sepolia network to MetaMask
echo 4. Import your wallet and test the dApp
echo.
echo Your tokens are ready! 🏠✨
echo.
pause
