@echo off
echo 🚀 Real Estate dApp - Localhost Setup
echo ====================================
echo.

REM Kill any existing processes
echo 🛑 Stopping existing processes...
taskkill /F /IM node.exe 2>nul

echo.
echo 📝 Setting up .env file...
echo PRIVATE_KEY=dummy_key_for_localhost_testing_only > .env
echo SEPOLIA_RPC_URL=http://127.0.0.1:8545 >> .env
echo USER_WALLET_ADDRESS=0x14987b6b98A4a2564d0b16c64c1Ed9fc9E974179 >> .env
echo REPORT_GAS=true >> .env
echo ✅ .env file created

echo.
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Using localhost configuration...
copy hardhat.config.localhost.js hardhat.config.js > nul

echo.
echo 🚀 Starting Hardhat node...
echo This will take a few seconds...
start "Hardhat Node" cmd /k "npx hardhat node"

echo.
echo ⏳ Waiting for node to start...
timeout /t 10 > nul

echo.
echo 📋 Deploying contracts...
call npx hardhat run scripts/deploy.js --network localhost
if errorlevel 1 (
    echo ❌ Deployment failed!
    echo Make sure Hardhat node is running
    pause
    exit /b 1
)

echo.
echo 👤 Setting up your account...
call npx hardhat run scripts/send-eth-to-user.js --network localhost
if errorlevel 1 (
    echo ⚠️ Account setup failed, but contracts are deployed
)

echo.
echo 🌐 Starting frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)

echo.
echo 🎉 Opening your dApp...
start http://localhost:3000
call npm start

cd ..
echo.
echo 🎉 Setup complete! Your dApp is running at http://localhost:3000
pause
