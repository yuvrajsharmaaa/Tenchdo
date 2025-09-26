import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';

const TokenManagement = () => {
  const { 
    web3,
    account, 
    isConnected, 
    contracts, 
    balances, 
    isUserVerified,
    updateBalances 
  } = useWeb3();

  const [activeTab, setActiveTab] = useState('transfer');
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    decimals: 0,
    totalSupply: '0',
    userBalance: '0'
  });

  // Form states
  const [transferForm, setTransferForm] = useState({
    to: '',
    amount: ''
  });
  
  const [mintForm, setMintForm] = useState({
    to: '',
    amount: ''
  });

  const [burnForm, setBurnForm] = useState({
    from: '',
    amount: ''
  });

  // Load token data
  const loadTokenData = async () => {
    if (!isConnected || !contracts.realEstateToken) return;

    try {
      const name = await contracts.realEstateToken.methods.name().call();
      const symbol = await contracts.realEstateToken.methods.symbol().call();
      const decimals = await contracts.realEstateToken.methods.decimals().call();
      const totalSupply = await contracts.realEstateToken.methods.totalSupply().call();
      const userBalance = await contracts.realEstateToken.methods.balanceOf(account).call();

      setTokenData({
        name,
        symbol,
        decimals: parseInt(decimals),
        totalSupply,
        userBalance
      });
    } catch (error) {
      console.error('Error loading token data:', error);
      toast.error('Failed to load token data');
    }
  };

  // Handle token transfer
  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.to || !transferForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Check if user is verified
      const verified = await isUserVerified();
      if (!verified) {
        toast.error('You must complete KYC verification to transfer tokens');
        return;
      }

      // Check if recipient is verified
      const recipientVerified = await isUserVerified(transferForm.to);
      if (!recipientVerified) {
        toast.error('Recipient must be KYC verified to receive tokens');
        return;
      }

      const amount = web3.utils.toWei(transferForm.amount, 'ether');
      
      // Check if transfer is compliant
      const canTransfer = await contracts.realEstateToken.methods
        .canTransfer(account, transferForm.to, amount)
        .call();
      
      if (!canTransfer) {
        toast.error('Transfer not compliant with current rules');
        return;
      }

      const tx = await contracts.realEstateToken.methods
        .transfer(transferForm.to, amount)
        .send({ from: account });

      toast.success('Transfer successful!');
      setTransferForm({ to: '', amount: '' });
      updateBalances();
      loadTokenData();
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error('Transfer failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle token minting (admin only)
  const handleMint = async (e) => {
    e.preventDefault();
    if (!mintForm.to || !mintForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const amount = web3.utils.toWei(mintForm.amount, 'ether');
      
      const tx = await contracts.realEstateToken.methods
        .mint(mintForm.to, amount)
        .send({ from: account });

      toast.success('Tokens minted successfully!');
      setMintForm({ to: '', amount: '' });
      updateBalances();
      loadTokenData();
    } catch (error) {
      console.error('Minting failed:', error);
      toast.error('Minting failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle token burning (admin only)
  const handleBurn = async (e) => {
    e.preventDefault();
    if (!burnForm.from || !burnForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const amount = web3.utils.toWei(burnForm.amount, 'ether');
      
      const tx = await contracts.realEstateToken.methods
        .burn(burnForm.from, amount)
        .send({ from: account });

      toast.success('Tokens burned successfully!');
      setBurnForm({ from: '', amount: '' });
      updateBalances();
      loadTokenData();
    } catch (error) {
      console.error('Burning failed:', error);
      toast.error('Burning failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokenData();
  }, [isConnected, account, contracts]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <i className="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Connect your wallet to manage property tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Token Management</h1>
        <p className="text-gray-600 mt-1">
          Manage your ERC-3643 compliant property tokens
        </p>
      </div>

      {/* Token Information */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-info-circle mr-2 text-primary"></i>
          Token Information
        </h2>
        
        <div className="grid md:grid-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Token Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{tokenData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Symbol:</span>
                <span className="font-medium">{tokenData.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Decimals:</span>
                <span className="font-medium">{tokenData.decimals}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Supply Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Supply:</span>
                <span className="font-medium">
                  {(parseFloat(tokenData.totalSupply) / 1e18).toLocaleString()} {tokenData.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Balance:</span>
                <span className="font-medium text-primary">
                  {balances.tokens} {tokenData.symbol}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Ownership</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Your Share:</span>
                <span className="font-medium">
                  {tokenData.totalSupply > 0 
                    ? ((parseFloat(tokenData.userBalance) / parseFloat(tokenData.totalSupply)) * 100).toFixed(4)
                    : '0'
                  }%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transfer'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-exchange-alt mr-2"></i>
              Transfer
            </button>
            <button
              onClick={() => setActiveTab('mint')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mint'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Mint
            </button>
            <button
              onClick={() => setActiveTab('burn')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'burn'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-fire mr-2"></i>
              Burn
            </button>
          </nav>
        </div>

        {/* Transfer Tab */}
        {activeTab === 'transfer' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Transfer Tokens</h3>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="grid md:grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Recipient Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0x..."
                    value={transferForm.to}
                    onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    placeholder="0.0"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Transferring...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Transfer Tokens
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Mint Tab */}
        {activeTab === 'mint' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mint Tokens</h3>
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-warning"></i>
                <span className="text-sm text-warning-dark">
                  Only authorized agents can mint new tokens
                </span>
              </div>
            </div>
            <form onSubmit={handleMint} className="space-y-4">
              <div className="grid md:grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Recipient Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0x..."
                    value={mintForm.to}
                    onChange={(e) => setMintForm({ ...mintForm, to: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    placeholder="0.0"
                    value={mintForm.amount}
                    onChange={(e) => setMintForm({ ...mintForm, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Minting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle mr-2"></i>
                    Mint Tokens
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Burn Tab */}
        {activeTab === 'burn' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Burn Tokens</h3>
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-error"></i>
                <span className="text-sm text-error-dark">
                  Only authorized agents can burn tokens. This action is irreversible.
                </span>
              </div>
            </div>
            <form onSubmit={handleBurn} className="space-y-4">
              <div className="grid md:grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">From Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0x..."
                    value={burnForm.from}
                    onChange={(e) => setBurnForm({ ...burnForm, from: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    placeholder="0.0"
                    value={burnForm.amount}
                    onChange={(e) => setBurnForm({ ...burnForm, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Burning...
                  </>
                ) : (
                  <>
                    <i className="fas fa-fire mr-2"></i>
                    Burn Tokens
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenManagement;
