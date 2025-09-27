import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3ContextSepolia';

const ContractTest = () => {
  const { web3, account, contracts, isConnected } = useWeb3();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testContract = async (contractName, contract) => {
    if (!contract) {
      return { error: 'Contract not initialized' };
    }

    try {
      // Test basic contract connection
      const address = contract._address || contract.options.address;
      const code = await web3.eth.getCode(address);
      
      if (code === '0x') {
        return { error: 'No contract code at address' };
      }

      return { 
        success: true, 
        address,
        codeLength: code.length 
      };
    } catch (error) {
      return { error: error.message };
    }
  };

  const testAllContracts = async () => {
    setLoading(true);
    const results = {};

    for (const [name, contract] of Object.entries(contracts)) {
      results[name] = await testContract(name, contract);
    }

    setTestResults(results);
    setLoading(false);
  };

  const testSpecificFunction = async () => {
    if (!contracts.identityRegistry || !account) return;

    try {
      setLoading(true);
      
      // Test the specific function that's failing
      const result = await contracts.identityRegistry.methods.isVerified(account).call();
      
      setTestResults(prev => ({
        ...prev,
        isVerifiedTest: { success: true, result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        isVerifiedTest: { error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <p className="text-gray-600">Connect wallet to test contracts</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">🔧 Contract Connection Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={testAllContracts}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Testing...' : 'Test All Contracts'}
          </button>
          
          <button
            onClick={testSpecificFunction}
            disabled={loading}
            className="btn btn-secondary"
          >
            Test isVerified Function
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {Object.entries(testResults).map(([name, result]) => (
              <div key={name} className="p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="font-medium">{name}</span>
                </div>
                
                {result.success ? (
                  <div className="text-sm text-gray-600">
                    <div>Address: {result.address}</div>
                    {result.codeLength && <div>Code Length: {result.codeLength} bytes</div>}
                    {result.result !== undefined && <div>Result: {result.result.toString()}</div>}
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">Debug Info</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Account: {account}</div>
            <div>Web3 Connected: {web3 ? '✅' : '❌'}</div>
            <div>Contracts Loaded: {Object.keys(contracts).length}</div>
            <div>Contract Names: {Object.keys(contracts).join(', ')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTest;
