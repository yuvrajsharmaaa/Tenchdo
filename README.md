# Real Estate dApp - ERC-3643 Compliant

A comprehensive decentralized application for real estate tokenization using the ERC-3643 permissioned token standard. This dApp enables fractional ownership of real estate through compliant, KYC-verified token transfers and smart contract-based lease management.

## 🏗️ Architecture

### Smart Contracts (Solidity)
- **RealEstateToken.sol** - ERC-3643 compliant token contract
- **IdentityRegistry.sol** - Manages KYC/AML verified identities
- **Compliance.sol** - Enforces transfer rules and restrictions
- **LeaseManager.sol** - Handles lease agreements and rent payments
- **MockERC20.sol** - Mock USDC for testing payments

### Frontend (React + Web3.js)
- **Modern React UI** with responsive design
- **Web3.js integration** for blockchain interaction
- **MetaMask wallet connection**
- **Real-time balance updates**
- **Comprehensive error handling**

## 🚀 Features

### ERC-3643 Compliance
- ✅ **Permissioned Transfers** - Only KYC-verified users can transfer tokens
- ✅ **Identity Registry** - Onchain identity verification system
- ✅ **Compliance Rules** - Configurable transfer restrictions
- ✅ **Country Restrictions** - Geographic compliance controls
- ✅ **Blacklist Management** - Address-based restrictions
- ✅ **Forced Transfers** - Compliance officer override capabilities

### Token Management
- 🪙 **Mint/Burn Tokens** - Authorized agent controls
- 🔄 **Compliant Transfers** - Automatic compliance checking
- 📊 **Real-time Balances** - Live token and ETH balance display
- 🏷️ **Token Metadata** - Property information linked to tokens

### Lease Management
- 📋 **Create Leases** - Smart contract lease agreements
- 💰 **Security Deposits** - Automated escrow handling
- 🏠 **Rent Payments** - Monthly rent collection in USDC
- 📅 **Lease Tracking** - Status monitoring and history

### User Interface
- 🎨 **Modern Design** - Clean, professional interface
- 📱 **Responsive Layout** - Mobile and desktop optimized
- 🔗 **Wallet Integration** - Seamless MetaMask connection
- 📈 **Dashboard Analytics** - Portfolio overview and statistics
- 🔔 **Toast Notifications** - Real-time transaction feedback

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd real-estate-dapp-erc3643
```

### 2. Install Dependencies
```bash
# Install Hardhat and smart contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Setup Environment Variables
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
# Add your private key for deployment (optional for local testing)
```

### 4. Compile Smart Contracts
```bash
npx hardhat compile
```

### 5. Start Local Blockchain
```bash
# Terminal 1 - Start Hardhat node
npx hardhat node
```

### 6. Deploy Contracts
```bash
# Terminal 2 - Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### 7. Start Frontend
```bash
# Terminal 3 - Start React app
cd frontend
npm start
```

### 8. Configure MetaMask
1. Add local network to MetaMask:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. Import test accounts from Hardhat node output

## 🧪 Testing

### Run Smart Contract Tests
```bash
npx hardhat test
```

### Test Coverage
The test suite covers:
- Identity registration and verification
- Compliance rule enforcement
- Token minting, burning, and transfers
- Lease creation and management
- Rent payment processing
- Security deposit handling

## 📖 Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" in the navigation
- Approve MetaMask connection
- Ensure you're on the local network (chainId: 1337)

### 2. Complete KYC Verification
- Click "Register Identity (KYC)" on the dashboard
- This enables token transfers and lease participation
- In production, this would integrate with a real KYC provider

### 3. Manage Tokens
- Navigate to "Tokens" page
- **Transfer**: Send tokens to other verified users
- **Mint**: Create new tokens (admin only)
- **Burn**: Destroy tokens (admin only)

### 4. Create Lease Agreements
- Go to "Leases" page
- Fill out lease details (tenant, rent, dates, etc.)
- Tenant pays security deposit to activate lease
- Monthly rent payments in USDC

### 5. Monitor Compliance
- Visit "Compliance" page
- Check your KYC status
- Test transfer compliance before sending
- View ERC-3643 requirements

### 6. View Property Details
- "Property" page shows tokenized asset information
- Your ownership percentage and value
- Property statistics and token metrics

## 🔧 Smart Contract Details

### RealEstateToken (ERC-3643)
```solidity
// Key functions
function transfer(address to, uint256 amount) // Compliant transfers only
function mint(address to, uint256 amount)    // Agent role required
function canTransfer(address from, address to, uint256 amount) // Check compliance
function forcedTransfer(address from, address to, uint256 amount) // Compliance officer
```

### IdentityRegistry
```solidity
// Identity management
function registerIdentity(address wallet, address onchainID, uint16 country)
function isVerified(address wallet) returns (bool)
function investorCountry(address wallet) returns (uint16)
```

### Compliance
```solidity
// Transfer validation
function canTransfer(address from, address to, uint256 amount) returns (bool)
function addToBlacklist(address account)
function addCountryRestriction(uint16 country)
```

### LeaseManager
```solidity
// Lease management
function createLease(...) returns (uint256 leaseId)
function paySecurityDeposit(uint256 leaseId)
function payRent(uint256 leaseId, uint256 month, uint256 year)
```

## 🔒 Security Features

### Smart Contract Security
- **OpenZeppelin** - Industry-standard secure contract libraries
- **Access Control** - Role-based permissions (Owner, Agent, Compliance)
- **Reentrancy Guard** - Protection against reentrancy attacks
- **Input Validation** - Comprehensive parameter checking

### Frontend Security
- **Web3 Validation** - Transaction validation before signing
- **Error Handling** - Graceful failure management
- **State Management** - Secure context-based state
- **Input Sanitization** - Form input validation

## 🌐 Network Configuration

### Local Development
- **Network**: Hardhat Local
- **Chain ID**: 1337
- **RPC**: http://127.0.0.1:8545

### Testnet Deployment
Update `hardhat.config.js` for testnet deployment:
```javascript
sepolia: {
  url: process.env.SEPOLIA_URL,
  accounts: [process.env.PRIVATE_KEY]
}
```

## 📁 Project Structure

```
real-estate-dapp-erc3643/
├── contracts/              # Solidity smart contracts
│   ├── interfaces/         # Contract interfaces
│   ├── RealEstateToken.sol # Main ERC-3643 token
│   ├── IdentityRegistry.sol# KYC identity management
│   ├── Compliance.sol      # Transfer compliance rules
│   ├── LeaseManager.sol    # Lease agreement handling
│   └── MockERC20.sol       # Mock USDC for testing
├── scripts/                # Deployment scripts
│   └── deploy.js          # Contract deployment
├── test/                   # Smart contract tests
│   └── RealEstate.test.js # Comprehensive test suite
├── frontend/               # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── context/       # React context providers
│   │   ├── contracts/     # Contract ABIs and addresses
│   │   └── App.js         # Main application component
│   └── package.json       # Frontend dependencies
├── hardhat.config.js       # Hardhat configuration
├── package.json           # Project dependencies
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Resources

### ERC-3643 Standard
- [Official GitHub](https://github.com/ERC-3643/ERC-3643)
- [Tokeny Overview](https://tokeny.com/erc3643/)
- [Chainalysis Deep Dive](https://www.chainalysis.com/blog/introduction-to-erc-3643-ethereum-rwa-token-standard/)
- [Official Documentation](https://www.erc3643.org)

### Development Resources
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [React Documentation](https://react.dev)
- [Web3.js Documentation](https://web3js.readthedocs.io/)

## 🆘 Support

For questions and support:
1. Check the documentation above
2. Review existing GitHub issues
3. Create a new issue with detailed description
4. Join our community discussions

## 🚀 Roadmap

- [ ] **Integration with real KYC providers**
- [ ] **Multi-property support**
- [ ] **Advanced analytics dashboard**
- [ ] **Mobile app development**
- [ ] **Layer 2 scaling solutions**
- [ ] **DeFi integrations (lending, yield farming)**
- [ ] **NFT property certificates**
- [ ] **Governance token implementation**

---

**Built with ❤️ for the future of real estate tokenization**
