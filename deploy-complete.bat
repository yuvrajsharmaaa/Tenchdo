@echo off
echo 🚀 Real Estate dApp - Complete Setup
echo =====================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please create .env file first.
    echo.
    pause
    exit /b 1
)

echo ✅ Found .env file
echo.

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Compiling contracts...
call npx hardhat compile
if errorlevel 1 (
    echo ❌ Failed to compile contracts
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying to Sepolia testnet...
echo This will take 2-3 minutes...
echo.
call npx hardhat run scripts/deploy-sepolia-simple.js --network sepolia

if errorlevel 1 (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo Common solutions:
    echo 1. Check your private key in .env file
    echo 2. Get Sepolia ETH from https://sepoliafaucet.com/
    echo 3. Wait a few minutes and try again
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 DEPLOYMENT SUCCESSFUL!
echo.
echo Next steps:
echo 1. Update frontend for Sepolia
echo 2. Add Sepolia network to MetaMask
echo 3. Start the frontend
echo.

echo 🌐 Setting up frontend for Sepolia...
cd frontend
if exist "src\context\Web3Context.js" (
    ren "src\context\Web3Context.js" "Web3Context.localhost.js"
)
if exist "src\context\Web3ContextSepolia.js" (
    copy "src\context\Web3ContextSepolia.js" "src\context\Web3Context.js" > nul
)

echo ✅ Frontend configured for Sepolia
echo.
echo 📦 Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)

echo.
echo 🚀 Starting frontend...
echo Opening http://localhost:3000 in 10 seconds...
echo.
start "" cmd /c "timeout /t 10 > nul && start http://localhost:3000"
call npm start

cd ..
echo.
echo 🎉 Your Real Estate dApp is now running!
pause
