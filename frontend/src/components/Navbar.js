import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Navbar = () => {
  const location = useLocation();
  const { 
    account, 
    isConnected, 
    connectWallet, 
    disconnectWallet, 
    isLoading, 
    chainId,
    switchToLocalNetwork,
    balances 
  } = useWeb3();

  const isActive = (path) => location.pathname === path;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <i className="fas fa-building text-2xl text-primary"></i>
            <span className="text-xl font-bold text-gray-800">RealEstate dApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-tachometer-alt mr-2"></i>
              Dashboard
            </Link>
            
            <Link
              to="/tokens"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/tokens') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-coins mr-2"></i>
              Tokens
            </Link>
            
            <Link
              to="/leases"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/leases') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-file-contract mr-2"></i>
              Leases
            </Link>
            
            <Link
              to="/compliance"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/compliance') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-shield-alt mr-2"></i>
              Compliance
            </Link>
            
            <Link
              to="/property"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/property') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-home mr-2"></i>
              Property
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {/* Network Status */}
            {isConnected && (
              <div className="hidden md:flex items-center gap-2">
                {chainId === 1337 ? (
                  <span className="px-2 py-1 bg-success text-white text-xs rounded-full">
                    <i className="fas fa-circle mr-1"></i>
                    Local Network
                  </span>
                ) : (
                  <button
                    onClick={switchToLocalNetwork}
                    className="px-2 py-1 bg-warning text-white text-xs rounded-full hover:bg-yellow-600 transition-colors"
                  >
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Switch Network
                  </button>
                )}
              </div>
            )}

            {/* Account Info */}
            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* Balances */}
                <div className="hidden lg:flex flex-col text-xs text-gray-600">
                  <span>ETH: {balances.eth}</span>
                  <span>Tokens: {balances.tokens}</span>
                  <span>USDC: {balances.usdc}</span>
                </div>

                {/* Account */}
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(account)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="btn btn-outline text-xs"
                  title="Disconnect Wallet"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wallet mr-2"></i>
                    Connect Wallet
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-3">
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                isActive('/') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/tokens"
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                isActive('/tokens') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Tokens
            </Link>
            <Link
              to="/leases"
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                isActive('/leases') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Leases
            </Link>
            <Link
              to="/compliance"
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                isActive('/compliance') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Compliance
            </Link>
            <Link
              to="/property"
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                isActive('/property') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Property
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
