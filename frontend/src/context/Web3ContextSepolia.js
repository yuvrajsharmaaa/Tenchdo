import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Web3 from 'web3';
import { toast } from 'react-toastify';

// Import contract ABIs
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
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState({});
  const [contractAddresses, setContractAddresses] = useState({});
  const [balances, setBalances] = useState({ eth: '0', realEstateToken: '0', mockUSDC: '0' });

  // Network configurations
  const networks = {
    1337: {
      name: 'Localhost',
      addressesFile: '/contracts/addresses.json',
      rpcUrl: 'http://127.0.0.1:8545',
      explorer: 'http://localhost:8545'
    },
    11155111: {
      name: 'Sepolia Testnet',
      addressesFile: '/contracts/addresses.sepolia.json',
      rpcUrl: 'https://rpc.sepolia.org',
      explorer: 'https://sepolia.etherscan.io'
    }
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  // Get network info
  const getNetworkInfo = (chainId) => {
    return networks[chainId] || {
      name: 'Unknown Network',
      addressesFile: '/contracts/addresses.json',
      rpcUrl: '',
      explorer: ''
    };
  };

  // Initialize Web3 with network detection
  const initializeWeb3 = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      console.error('MetaMask not found');
      return null;
    }

    try {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // Get current network
      const currentChainId = Number(await web3Instance.eth.getChainId());
      const networkInfo = getNetworkInfo(currentChainId);
      
      console.log(`🌐 Connected to ${networkInfo.name} (Chain ID: ${currentChainId})`);
      setChainId(currentChainId);

      // Load contract addresses for the current network
      let addresses;
      try {
        console.log(`📋 Loading addresses from: ${networkInfo.addressesFile}`);
        const addressesResponse = await fetch(networkInfo.addressesFile);
        
        if (!addressesResponse.ok) {
          throw new Error(`HTTP ${addressesResponse.status}: ${addressesResponse.statusText}`);
        }
        
        addresses = await addressesResponse.json();
        console.log('✅ Contract addresses loaded:', addresses);
        setContractAddresses(addresses);
      } catch (error) {
        console.error('❌ Failed to load contract addresses:', error);
        toast.error(`Failed to load contracts for ${networkInfo.name}. Please deploy contracts first.`);
        return null;
      }

      // Initialize contract instances
      let realEstateToken, identityRegistry, compliance, leaseManager, mockUSDC;

      try {
        realEstateToken = new web3Instance.eth.Contract(
          RealEstateTokenABI.abi,
          addresses.realEstateToken
        );
        console.log('✅ RealEstateToken contract initialized');
      } catch (error) {
        console.error('❌ Error initializing RealEstateToken:', error);
      }

      try {
        identityRegistry = new web3Instance.eth.Contract(
          IdentityRegistryABI.abi,
          addresses.identityRegistry
        );
        console.log('✅ IdentityRegistry contract initialized');
      } catch (error) {
        console.error('❌ Error initializing IdentityRegistry:', error);
      }

      try {
        compliance = new web3Instance.eth.Contract(
          ComplianceABI.abi,
          addresses.compliance
        );
        console.log('✅ Compliance contract initialized');
      } catch (error) {
        console.error('❌ Error initializing Compliance:', error);
      }

      try {
        leaseManager = new web3Instance.eth.Contract(
          LeaseManagerABI.abi,
          addresses.leaseManager
        );
        console.log('✅ LeaseManager contract initialized');
      } catch (error) {
        console.error('❌ Error initializing LeaseManager:', error);
      }

      try {
        mockUSDC = new web3Instance.eth.Contract(
          MockERC20ABI.abi,
          addresses.mockUSDC
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

  // Switch to supported network
  const switchToNetwork = async (targetChainId) => {
    if (!window.ethereum) return;

    const networkInfo = getNetworkInfo(targetChainId);
    const chainIdHex = `0x${targetChainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: networkInfo.name,
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [networkInfo.rpcUrl],
              blockExplorerUrls: [networkInfo.explorer],
            }],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          toast.error(`Failed to add ${networkInfo.name} network`);
        }
      } else {
        console.error('Failed to switch network:', switchError);
        toast.error(`Failed to switch to ${networkInfo.name}`);
      }
    }
  };

  // Connect wallet with enhanced network handling
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask extension');
      return;
    }

    setIsLoading(true);
    try {
      // Check if MetaMask is locked
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length === 0) {
        console.log('Requesting MetaMask account access...');
        const requestedAccounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (requestedAccounts.length === 0) {
          toast.error('No accounts found. Please create an account in MetaMask.');
          return;
        }
      }

      // Initialize Web3 after confirming MetaMask access
      const web3Instance = await initializeWeb3();
      if (!web3Instance) {
        toast.error('Failed to initialize Web3');
        return;
      }

      // Get current account and chain info
      const currentAccounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      
      const account = currentAccounts[0];
      const currentChainId = Number(await web3Instance.eth.getChainId());
      const networkInfo = getNetworkInfo(currentChainId);

      setAccount(account);
      setChainId(currentChainId);
      setIsConnected(true);

      // Check if we're on a supported network
      if (currentChainId !== 1337 && currentChainId !== 11155111) {
        toast.warning(`⚠️ Unsupported network. Please switch to Sepolia Testnet or Localhost`);
        console.log('Current Chain ID:', currentChainId, 'Supported: 1337 (Localhost), 11155111 (Sepolia)');
      } else {
        toast.success(`✅ Connected to ${networkInfo.name}!`);
      }

      console.log('Connected account:', account);
      console.log('Network:', networkInfo.name, '(Chain ID:', currentChainId, ')');

    } catch (error) {
      console.error('MetaMask connection error:', error);
      
      // Handle specific MetaMask errors
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else if (error.code === -32002) {
        toast.error('Connection request already pending. Please check MetaMask.');
      } else if (error.message && error.message.includes('User denied')) {
        toast.error('Connection denied. Please approve the connection in MetaMask.');
      } else {
        toast.error('Failed to connect to MetaMask. Please try refreshing the page.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load balances
  const loadBalances = useCallback(async () => {
    if (!web3 || !account || !contracts.realEstateToken || !contracts.mockUSDC) {
      return;
    }

    try {
      // Get ETH balance
      const ethBalance = await web3.eth.getBalance(account);
      const ethBalanceFormatted = web3.utils.fromWei(ethBalance, 'ether');

      // Get Real Estate Token balance
      let reptBalanceFormatted = '0';
      if (contracts.realEstateToken) {
        try {
          const reptBalance = await contracts.realEstateToken.methods.balanceOf(account).call();
          reptBalanceFormatted = web3.utils.fromWei(reptBalance, 'ether');
        } catch (error) {
          console.warn('Error fetching REPT balance:', error);
        }
      }

      // Get USDC balance (6 decimals)
      let usdcBalanceFormatted = '0';
      if (contracts.mockUSDC) {
        try {
          const usdcBalance = await contracts.mockUSDC.methods.balanceOf(account).call();
          usdcBalanceFormatted = (parseInt(usdcBalance) / 1000000).toString(); // USDC has 6 decimals
        } catch (error) {
          console.warn('Error fetching USDC balance:', error);
        }
      }

      setBalances({
        eth: ethBalanceFormatted,
        realEstateToken: reptBalanceFormatted,
        mockUSDC: usdcBalanceFormatted
      });

    } catch (error) {
      console.error('Error loading balances:', error);
    }
  }, [web3, account, contracts]);

  // Check if user is verified for KYC
  const isUserVerified = useCallback(async (userAddress = account) => {
    if (!contracts.identityRegistry || !userAddress) {
      return false;
    }

    try {
      const isVerified = await contracts.identityRegistry.methods.isVerified(userAddress).call();
      return isVerified;
    } catch (error) {
      console.error('Error checking user verification:', error);
      return false;
    }
  }, [contracts.identityRegistry, account]);

  // Register user identity
  const registerIdentity = async (userAddress = account, countryCode = 840) => {
    if (!contracts.identityRegistry || !userAddress) {
      toast.error('Identity registry not available');
      return false;
    }

    try {
      setIsLoading(true);
      
      // Estimate gas
      const gasEstimate = await contracts.identityRegistry.methods
        .registerIdentity(userAddress, userAddress, countryCode)
        .estimateGas({ from: account });

      // Add 20% buffer
      const gasLimit = Math.floor(gasEstimate * 1.2);

      const tx = await contracts.identityRegistry.methods
        .registerIdentity(userAddress, userAddress, countryCode)
        .send({ 
          from: account,
          gas: gasLimit
        });

      console.log('Identity registration successful:', tx);
      toast.success('Identity registered successfully!');
      return true;
    } catch (error) {
      console.error('Error registering identity:', error);
      if (error.message.includes('User denied')) {
        toast.error('Transaction cancelled by user');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient ETH for gas fees');
      } else {
        toast.error('Failed to register identity: ' + error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount(null);
          setContracts({});
          setBalances({ eth: '0', realEstateToken: '0', mockUSDC: '0' });
        } else {
          setAccount(accounts[0]);
          loadBalances();
        }
      };

      const handleChainChanged = (chainId) => {
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
        console.log('Chain changed to:', newChainId);
        
        // Reinitialize contracts for new network
        initializeWeb3().then(() => {
          loadBalances();
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [initializeWeb3, loadBalances]);

  // Load balances when connected
  useEffect(() => {
    if (isConnected && account && Object.keys(contracts).length > 0) {
      loadBalances();
      const interval = setInterval(loadBalances, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, account, contracts, loadBalances]);

  const value = {
    web3,
    account,
    chainId,
    isConnected,
    isLoading,
    contracts,
    contractAddresses,
    balances,
    connectWallet,
    initializeWeb3,
    loadBalances,
    isUserVerified,
    registerIdentity,
    switchToNetwork,
    getNetworkInfo,
    networks
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
