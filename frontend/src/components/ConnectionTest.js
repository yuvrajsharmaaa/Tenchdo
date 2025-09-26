import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
  const [status, setStatus] = useState({
    metamaskInstalled: false,
    connected: false,
    account: '',
    chainId: '',
    error: ''
  });

  const checkConnection = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        setStatus(prev => ({
          ...prev,
          metamaskInstalled: false,
          error: 'MetaMask is not installed'
        }));
        return;
      }

      setStatus(prev => ({ ...prev, metamaskInstalled: true }));

      // Get accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        // Get chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setStatus(prev => ({
          ...prev,
          connected: true,
          account: accounts[0],
          chainId: parseInt(chainId, 16).toString(),
          error: ''
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          connected: false,
          error: 'No accounts connected'
        }));
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      setStatus(prev => ({
        ...prev,
        connected: true,
        account: accounts[0],
        chainId: parseInt(chainId, 16).toString(),
        error: ''
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // 1337 in hex
      });
    } catch (error) {
      if (error.code === 4902) {
        // Network doesn't exist, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x539',
                chainName: 'Localhost 8545',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: null,
              },
            ],
          });
        } catch (addError) {
          setStatus(prev => ({
            ...prev,
            error: `Failed to add network: ${addError.message}`
          }));
        }
      } else {
        setStatus(prev => ({
          ...prev,
          error: `Failed to switch network: ${error.message}`
        }));
      }
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
      window.ethereum.on('chainChanged', checkConnection);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkConnection);
        window.ethereum.removeListener('chainChanged', checkConnection);
      }
    };
  }, []);

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔧 MetaMask Connection Test</h2>
      
      <div className="space-y-4">
        {/* MetaMask Status */}
        <div className="p-3 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">MetaMask Status</h3>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${status.metamaskInstalled ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{status.metamaskInstalled ? 'Installed' : 'Not Installed'}</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-3 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Connection Status</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{status.connected ? 'Connected' : 'Not Connected'}</span>
          </div>
          {status.account && (
            <div className="text-sm text-gray-600">
              <div>Account: {status.account}</div>
              <div>Chain ID: {status.chainId} {status.chainId === '1337' ? '✅' : '❌ (Should be 1337)'}</div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-1">Error</h3>
            <p className="text-sm text-red-600">{status.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={checkConnection}
            className="btn btn-secondary"
          >
            🔄 Check Status
          </button>
          
          {!status.connected && status.metamaskInstalled && (
            <button
              onClick={connectWallet}
              className="btn btn-primary"
            >
              🔗 Connect Wallet
            </button>
          )}
          
          {status.connected && status.chainId !== '1337' && (
            <button
              onClick={switchNetwork}
              className="btn btn-warning"
            >
              🔄 Switch to Local Network
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Setup Instructions</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. Make sure MetaMask is installed</p>
            <p>2. Add local network (Chain ID: 1337, RPC: http://127.0.0.1:8545)</p>
            <p>3. Import test account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</p>
            <p>4. Private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
