# Real Estate dApp - ERC-3643 Tokenization Platform

A comprehensive decentralized application for tokenizing real estate properties using ERC-3643 compliant permissioned tokens with built-in KYC/AML compliance.

## 🏠 Features

- **ERC-3643 Compliant Tokens** - Permissioned transfers with identity verification
- **KYC/AML Integration** - Identity registry with compliance rules
- **Smart Contract Leases** - Automated rental agreements with escrow
- **Rent Payment System** - USDC-based monthly payments
- **Role-Based Access Control** - Owner, Agent, and Compliance Officer roles
- **Property Tokenization** - Fractional ownership representation
- **Modern React UI** - Clean, responsive user interface

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity 0.8.20** - Smart contract development
- **Hardhat** - Development framework and testing
- **OpenZeppelin** - Security-audited contract libraries
- **ERC-3643** - Permissioned token standard implementation

### Frontend
- **React 18** - User interface framework
- **Web3.js** - Blockchain interaction
- **Tailwind CSS** - Styling framework
- **React Router** - Navigation

### Key Contracts
- `RealEstateToken.sol` - ERC-3643 property token
- `IdentityRegistry.sol` - KYC/AML identity management
- `Compliance.sol` - Transfer rules and restrictions
- `LeaseManager.sol` - Rental agreement management
- `MockERC20.sol` - USDC simulation for payments

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask wallet extension

### Installation

1. **Clone the repository**
```bash
git clone <your-new-repo-url>
cd real-estate-dapp
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install
cd ..
```

3. **Start local blockchain**
```bash
npx hardhat node
```

4. **Deploy contracts** (in new terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

5. **Start frontend** (in new terminal)
```bash
cd frontend && npm start
```

6. **Configure MetaMask**
   - Network: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Import test account with private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## 📋 Usage

1. **Connect Wallet** - Connect your MetaMask to localhost network
2. **Complete KYC** - Register your identity for compliance
3. **Transfer Tokens** - Send property tokens to verified users
4. **Create Leases** - Set up rental agreements with tenants
5. **Pay Rent** - Monthly USDC payments through smart contracts

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/RealEstate.test.js

# Check test coverage
npx hardhat coverage
```

## 📁 Project Structure

```
├── contracts/              # Solidity smart contracts
│   ├── interfaces/         # Contract interfaces
│   ├── RealEstateToken.sol # Main ERC-3643 token
│   ├── IdentityRegistry.sol# KYC/Identity management
│   ├── Compliance.sol      # Compliance rules
│   └── LeaseManager.sol    # Lease management
├── scripts/                # Deployment and utility scripts
├── test/                   # Contract tests
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Web3 context
│   │   └── contracts/      # ABIs and addresses
└── hardhat.config.js       # Hardhat configuration
```

## 🔐 Security Features

- **Permissioned Transfers** - Only KYC-verified users can receive tokens
- **Compliance Rules** - Blacklist and country restrictions
- **Role-Based Access** - Multi-level permission system
- **Forced Transfers** - Compliance officer emergency powers
- **Reentrancy Protection** - SafeERC20 and ReentrancyGuard
- **Input Validation** - Comprehensive parameter checking

## 🌐 Network Configuration

### Local Development (Recommended)
- **Network**: Localhost 8545
- **Chain ID**: 1337
- **Cost**: FREE test ETH

### Testnet Deployment
- Configure `hardhat.config.js` with testnet details
- Obtain testnet ETH from faucets
- Deploy with `--network <testnet-name>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- ERC-3643 standard contributors
- Hardhat development framework
- React and Web3.js communities

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

---

**Built with ❤️ for the future of real estate tokenization**