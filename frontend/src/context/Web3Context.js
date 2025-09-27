import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Web3 } from 'web3';
import { toast } from 'react-toastify';

// Import contract ABIs and addresses
import contractAddresses from '../contracts/addresses.json';
import RealEstateTokenABI from '../contracts/RealEstateToken.json';
import IdentityRegistryABI from '../contracts/IdentityRegistry.json';
import ComplianceABI from '../contracts/Compliance.json';
import LeaseManagerABI from '../contracts/LeaseManager.json';
import MockERC20ABI from '../contracts/MockERC20.json';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState({});
  const [balances, setBalances] = useState({
    eth: '0',
    tokens: '0',
    usdc: '0'
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Initialize Web3 and contracts
  const initializeWeb3 = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask to use this dApp');
      return;
    }

    try {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // Initialize contracts with error handling
      let realEstateToken, identityRegistry, compliance, leaseManager, mockUSDC;
      
      try {
        realEstateToken = new web3Instance.eth.Contract(
          RealEstateTokenABI.abi,
          contractAddresses.realEstateToken
        );
        console.log('✅ RealEstateToken contract initialized');
      } catch (error) {
        console.error('❌ Error initializing RealEstateToken:', error);
      }

      try {
        identityRegistry = new web3Instance.eth.Contract(
          IdentityRegistryABI.abi,
          contractAddresses.identityRegistry
        );
        console.log('✅ IdentityRegistry contract initialized');
      } catch (error) {
        console.error('❌ Error initializing IdentityRegistry:', error);
      }

      try {
        compliance = new web3Instance.eth.Contract(
          ComplianceABI.abi,
          contractAddresses.compliance
        );
        console.log('✅ Compliance contract initialized');
      } catch (error) {
        console.error('❌ Error initializing Compliance:', error);
      }

      try {
        leaseManager = new web3Instance.eth.Contract(
          LeaseManagerABI.abi,
          contractAddresses.leaseManager
        );
        console.log('✅ LeaseManager contract initialized');
      } catch (error) {
        console.error('❌ Error initializing LeaseManager:', error);
      }

      try {
        mockUSDC = new web3Instance.eth.Contract(
          MockERC20ABI.abi,
          contractAddresses.mockUSDC
        );
        console.log('✅ MockUSDC contract initialized');
      } catch (error) {
        console.error('❌ Error initializing MockUSDC:', error);
      }

      setContracts({
        realEstateToken,
        identityRegistry,
        compliance,
        leaseManager,
        mockUSDC
      });

      return web3Instance;
    } catch (error) {
      console.error('Error initializing Web3:', error);
      toast.error('Failed to initialize Web3');
      return null;
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask');
      return;
    }

    setIsLoading(true);
    try {
      const web3Instance = await initializeWeb3();
      if (!web3Instance) return;

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        toast.error('No accounts found');
        return;
      }

      const account = accounts[0];
      const chainId = await web3Instance.eth.getChainId();

      setAccount(account);
      setChainId(Number(chainId));
      setIsConnected(true);

      // Check if we're on the correct network (localhost:8545 = chainId 1337)
      if (Number(chainId) !== 1337) {
        toast.warning('Please switch to the local development network (chainId: 1337)');
        // Auto-switch to localhost network
        await switchToLocalNetwork();
      } else {
        // Test network connectivity
        try {
          await web3Instance.eth.getBlockNumber();
          console.log('✅ Network connectivity verified');
        } catch (networkError) {
          console.error('❌ Network connectivity issue:', networkError);
          toast.error('Cannot connect to local blockchain. Please ensure Hardhat node is running on localhost:8545');
        }
      }

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === -32002) {
        toast.error('Connection request already pending. Please check MetaMask.');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount('');
    setChainId(null);
    setIsConnected(false);
    setBalances({ eth: '0', tokens: '0', usdc: '0' });
    toast.info('Wallet disconnected');
  };

  // Switch to local network
  const switchToLocalNetwork = async () => {
    if (!isMetaMaskInstalled()) return;

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
          console.error('Error adding network:', addError);
          toast.error('Failed to add local network');
        }
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  };

  // Update balances
  const updateBalances = useCallback(async () => {
    if (!web3 || !account) return;

    try {
      // ETH balance
      const ethBalance = await web3.eth.getBalance(account);
      const ethBalanceFormatted = web3.utils.fromWei(ethBalance, 'ether');

      let tokenBalanceFormatted = '0';
      let usdcBalanceFormatted = '0';

      // Token balance (with error handling)
      if (contracts.realEstateToken) {
        try {
          const tokenBalance = await contracts.realEstateToken.methods.balanceOf(account).call();
          tokenBalanceFormatted = web3.utils.fromWei(tokenBalance, 'ether');
        } catch (error) {
          console.warn('Error fetching token balance:', error);
        }
      }

      // USDC balance (with error handling)
      if (contracts.mockUSDC) {
        try {
          const usdcBalance = await contracts.mockUSDC.methods.balanceOf(account).call();
          // USDC has 6 decimals, so divide by 10^6
          usdcBalanceFormatted = (parseInt(usdcBalance) / 1000000).toString();
        } catch (error) {
          console.warn('Error fetching USDC balance:', error);
        }
      }

      setBalances({
        eth: parseFloat(ethBalanceFormatted).toFixed(4),
        tokens: parseFloat(tokenBalanceFormatted).toFixed(4),
        usdc: parseFloat(usdcBalanceFormatted).toFixed(2)
      });
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  }, [web3, account, contracts]);

  // Check if user is verified (has KYC)
  const isUserVerified = useCallback(async (userAddress = account) => {
    if (!contracts.identityRegistry || !userAddress) return false;

    try {
      const result = await contracts.identityRegistry.methods.isVerified(userAddress).call();
      return result;
    } catch (error) {
      console.error('Error checking verification status:', error);
      // If the user is the deployer account, consider them verified by default
      if (userAddress && userAddress.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266') {
        return true;
      }
      return false;
    }
  }, [contracts.identityRegistry, account]);

  // Register user identity (mock KYC)
  const registerIdentity = async (countryCode = 840) => { // Default to USA
    if (!contracts.identityRegistry || !account) {
      toast.error('Wallet not connected or contracts not loaded');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if already verified first
      const alreadyVerified = await isUserVerified(account);
      if (alreadyVerified) {
        toast.info('Identity already registered and verified');
        return;
      }

      console.log('Attempting to register identity for:', account);
      console.log('Using country code:', countryCode);
      console.log('Contract address:', contractAddresses.identityRegistry);

      // Try the self-registration method first (no parameters)
      try {
        const gasEstimate = await contracts.identityRegistry.methods
          .registerIdentity()
          .estimateGas({ from: account });

        const tx = await contracts.identityRegistry.methods
          .registerIdentity()
          .send({ 
            from: account,
            gas: Math.floor(Number(gasEstimate) * 1.5) // Convert BigInt to Number
          });
        
        console.log('Self-registration successful:', tx);
        toast.success('Identity registered successfully!');
        setTimeout(updateBalances, 2000);
        return tx;
      } catch (selfRegError) {
        console.log('Self-registration failed, trying admin registration:', selfRegError.message);
        
        // Fallback to admin registration method
        const gasEstimate = await contracts.identityRegistry.methods
          .registerIdentity(account, account, countryCode)
          .estimateGas({ from: account });

        const tx = await contracts.identityRegistry.methods
          .registerIdentity(account, account, countryCode)
          .send({ 
            from: account,
            gas: Math.floor(Number(gasEstimate) * 1.5) // Convert BigInt to Number
          });
        
        console.log('Admin registration successful:', tx);
        toast.success('Identity registered successfully!');
        setTimeout(updateBalances, 2000);
        return tx;
      }
    } catch (error) {
      console.error('Error registering identity:', error);
      
      // More specific error handling
      if (error.message.includes('User denied') || error.code === 4001) {
        toast.info('Transaction cancelled by user');
      } else if (error.message.includes('already registered')) {
        toast.info('Identity already registered');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient ETH for gas fees');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection to localhost:8545');
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        toast.info('Account changed');
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(Number(chainId));
      if (Number(chainId) !== 1337) {
        toast.warning('Please switch to the local development network');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  // Update balances when account or contracts change
  useEffect(() => {
    if (isConnected && account) {
      updateBalances();
      const interval = setInterval(updateBalances, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, account, updateBalances]);

  // Initialize on mount
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      initializeWeb3();
    }
  }, [initializeWeb3]);

  const value = {
    web3,
    account,
    chainId,
    isConnected,
    isLoading,
    contracts,
    balances,
    connectWallet,
    disconnectWallet,
    switchToLocalNetwork,
    updateBalances,
    isUserVerified,
    registerIdentity,
    isMetaMaskInstalled: isMetaMaskInstalled()
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
