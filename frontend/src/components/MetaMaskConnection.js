import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';

const MetaMaskConnection = () => {
  const { connectWallet, isConnected, account, chainId, isLoading } = useWeb3();
  const [metaMaskStatus, setMetaMaskStatus] = useState('checking');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    checkMetaMaskStatus();
  }, []);

  const checkMetaMaskStatus = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setMetaMaskStatus('not_installed');
        setErrorDetails('MetaMask extension is not installed');
        return;
      }

      // Check if MetaMask is accessible
      if (!window.ethereum.isMetaMask) {
        setMetaMaskStatus('not_metamask');
        setErrorDetails('Detected wallet is not MetaMask');
        return;
      }

      // Check if accounts are accessible
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length === 0) {
        setMetaMaskStatus('locked');
        setErrorDetails('MetaMask is locked or no accounts connected');
      } else {
        setMetaMaskStatus('ready');
        setErrorDetails('');
      }

    } catch (error) {
      console.error('MetaMask status check error:', error);
      setMetaMaskStatus('error');
      setErrorDetails(`Error: ${error.message}`);
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection error:', error);
      setErrorDetails(`Connection failed: ${error.message}`);
    }
  };

  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const addLocalNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x539', // 1337 in hex
          chainName: 'Localhost 8545',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['http://127.0.0.1:8545'],
        }],
      });
    } catch (error) {
      console.error('Failed to add network:', error);
    }
  };

  if (isConnected) {
    return (
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <h3 className="font-semibold text-green-800">Connected to MetaMask</h3>
            <p className="text-sm text-green-600">
              Account: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
            <p className="text-sm text-green-600">
              Network: {chainId === 1337 ? 'Localhost 8545 ✅' : `Chain ID ${chainId} ⚠️`}
            </p>
          </div>
        </div>
        
        {chainId !== 1337 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 mb-2">
              ⚠️ You're on the wrong network. Switch to localhost for testing.
            </p>
            <button 
              onClick={addLocalNetwork}
              className="btn btn-sm btn-warning"
            >
              Add Localhost Network
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Connect to MetaMask</h3>
      
      {metaMaskStatus === 'checking' && (
        <div className="flex items-center gap-3">
          <div className="spinner"></div>
          <span>Checking MetaMask...</span>
        </div>
      )}

      {metaMaskStatus === 'not_installed' && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <i className="fab fa-chrome text-2xl text-gray-400"></i>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">MetaMask Not Installed</h4>
          <p className="text-gray-600 mb-4">
            You need MetaMask extension to use this dApp.
          </p>
          <button 
            onClick={installMetaMask}
            className="btn btn-primary"
          >
            Install MetaMask
          </button>
        </div>
      )}

      {metaMaskStatus === 'locked' && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="fas fa-lock text-2xl text-yellow-600"></i>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">MetaMask Locked</h4>
          <p className="text-gray-600 mb-4">
            Please unlock MetaMask and create/import an account.
          </p>
          <button 
            onClick={handleConnect}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      )}

      {metaMaskStatus === 'ready' && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="fab fa-ethereum text-2xl text-blue-600"></i>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Ready to Connect</h4>
          <p className="text-gray-600 mb-4">
            Click connect to link your MetaMask wallet.
          </p>
          <button 
            onClick={handleConnect}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <div className="spinner mr-2"></div>
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      )}

      {metaMaskStatus === 'error' && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Connection Error</h4>
          <p className="text-gray-600 mb-4 text-sm">
            {errorDetails}
          </p>
          <div className="space-x-2">
            <button 
              onClick={checkMetaMaskStatus}
              className="btn btn-secondary btn-sm"
            >
              Retry
            </button>
            <button 
              onClick={handleConnect}
              disabled={isLoading}
              className="btn btn-primary btn-sm"
            >
              Try Connect
            </button>
          </div>
        </div>
      )}

      {errorDetails && metaMaskStatus !== 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{errorDetails}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
        <h5 className="font-semibold mb-2">Setup Instructions:</h5>
        <ol className="list-decimal list-inside space-y-1 text-gray-600">
          <li>Install MetaMask extension</li>
          <li>Add Localhost 8545 network (Chain ID: 1337)</li>
          <li>Import test account or create new one</li>
          <li>Connect to this dApp</li>
        </ol>
      </div>
    </div>
  );
};

export default MetaMaskConnection;


