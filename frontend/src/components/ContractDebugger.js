import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3ContextSepolia';

const ContractDebugger = () => {
  const { web3, account, contracts, isConnected } = useWeb3();
  const [debugResults, setDebugResults] = useState({});
  const [testing, setTesting] = useState(false);

  const testAllContracts = async () => {
    if (!isConnected || !web3 || !account) {
      console.log('Not connected or missing web3/account');
      return;
    }

    setTesting(true);
    const results = {};

    try {
      // Test ETH balance
      console.log('Testing ETH balance...');
      const ethBalance = await web3.eth.getBalance(account);
      results.ethBalance = {
        success: true,
        value: web3.utils.fromWei(ethBalance, 'ether') + ' ETH'
      };
    } catch (error) {
      results.ethBalance = { success: false, error: error.message };
    }

    // Test Real Estate Token
    if (contracts.realEstateToken) {
      try {
        console.log('Testing Real Estate Token...');
        const tokenBalance = await contracts.realEstateToken.methods.balanceOf(account).call();
        const tokenName = await contracts.realEstateToken.methods.name().call();
        const tokenSymbol = await contracts.realEstateToken.methods.symbol().call();
        
        results.realEstateToken = {
          success: true,
          balance: web3.utils.fromWei(tokenBalance, 'ether'),
          name: tokenName,
          symbol: tokenSymbol
        };
      } catch (error) {
        results.realEstateToken = { success: false, error: error.message };
      }
    } else {
      results.realEstateToken = { success: false, error: 'Contract not initialized' };
    }

    // Test Mock USDC
    if (contracts.mockUSDC) {
      try {
        console.log('Testing Mock USDC...');
        const usdcBalance = await contracts.mockUSDC.methods.balanceOf(account).call();
        const usdcName = await contracts.mockUSDC.methods.name().call();
        const usdcDecimals = await contracts.mockUSDC.methods.decimals().call();
        
        results.mockUSDC = {
          success: true,
          balance: (parseInt(usdcBalance) / Math.pow(10, parseInt(usdcDecimals))).toString(),
          name: usdcName,
          decimals: usdcDecimals
        };
      } catch (error) {
        results.mockUSDC = { success: false, error: error.message };
      }
    } else {
      results.mockUSDC = { success: false, error: 'Contract not initialized' };
    }

    // Test Identity Registry
    if (contracts.identityRegistry) {
      try {
        console.log('Testing Identity Registry...');
        const isVerified = await contracts.identityRegistry.methods.isVerified(account).call();
        
        results.identityRegistry = {
          success: true,
          isVerified: isVerified
        };
      } catch (error) {
        results.identityRegistry = { success: false, error: error.message };
      }
    } else {
      results.identityRegistry = { success: false, error: 'Contract not initialized' };
    }

    // Test Compliance
    if (contracts.compliance) {
      try {
        console.log('Testing Compliance...');
        const canTransfer = await contracts.compliance.methods.canTransfer(
          account, 
          '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 
          web3.utils.toWei('1', 'ether')
        ).call();
        
        results.compliance = {
          success: true,
          canTransfer: canTransfer
        };
      } catch (error) {
        results.compliance = { success: false, error: error.message };
      }
    } else {
      results.compliance = { success: false, error: 'Contract not initialized' };
    }

    // Test Lease Manager
    if (contracts.leaseManager) {
      try {
        console.log('Testing Lease Manager...');
        const landlordLeases = await contracts.leaseManager.methods.getLandlordLeases(account).call();
        
        results.leaseManager = {
          success: true,
          landlordLeases: landlordLeases.length
        };
      } catch (error) {
        results.leaseManager = { success: false, error: error.message };
      }
    } else {
      results.leaseManager = { success: false, error: 'Contract not initialized' };
    }

    setDebugResults(results);
    setTesting(false);
  };

  useEffect(() => {
    if (isConnected && contracts && Object.keys(contracts).length > 0) {
      testAllContracts();
    }
  }, [isConnected, contracts, account]);

  if (!isConnected) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Contract Debugger</h3>
        <p className="text-yellow-700">Please connect your wallet to test contracts.</p>
      </div>
    );
  }

  return (
    <div className="card bg-blue-50 border-blue-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-800">Contract Debugger</h3>
        <button 
          onClick={testAllContracts} 
          disabled={testing}
          className="btn btn-sm btn-primary"
        >
          {testing ? 'Testing...' : 'Retest All'}
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(debugResults).map(([contractName, result]) => (
          <div key={contractName} className="p-3 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <strong className="text-sm font-medium capitalize">
                {contractName.replace(/([A-Z])/g, ' $1').trim()}
              </strong>
            </div>
            
            {result.success ? (
              <div className="text-sm text-gray-600">
                {result.balance && <div>Balance: {result.balance}</div>}
                {result.name && <div>Name: {result.name}</div>}
                {result.symbol && <div>Symbol: {result.symbol}</div>}
                {result.decimals && <div>Decimals: {result.decimals}</div>}
                {result.isVerified !== undefined && <div>Verified: {result.isVerified ? 'Yes' : 'No'}</div>}
                {result.canTransfer !== undefined && <div>Can Transfer: {result.canTransfer ? 'Yes' : 'No'}</div>}
                {result.landlordLeases !== undefined && <div>Landlord Leases: {result.landlordLeases}</div>}
                {result.value && <div>Value: {result.value}</div>}
              </div>
            ) : (
              <div className="text-sm text-red-600">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
        <strong>Network Info:</strong>
        <div>Account: {account}</div>
        <div>Contracts Loaded: {Object.keys(contracts).length}</div>
      </div>
    </div>
  );
};

export default ContractDebugger;


