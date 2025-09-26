import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';

const ComplianceManagement = () => {
  const { 
    account, 
    isConnected, 
    contracts, 
    isUserVerified,
    registerIdentity,
    isLoading
  } = useWeb3();

  const [complianceData, setComplianceData] = useState({
    isVerified: false,
    country: 0,
    isBlacklisted: false,
    canTransferTo: {},
    complianceRules: []
  });
  
  const [loading, setLoading] = useState(false);
  const [testAddress, setTestAddress] = useState('');
  const [testAmount, setTestAmount] = useState('');

  // Load compliance data
  const loadComplianceData = async () => {
    if (!isConnected || !contracts.identityRegistry || !contracts.compliance) return;

    setLoading(true);
    try {
      // Check if user is verified
      const verified = await isUserVerified();
      
      let country = 0;
      let isBlacklisted = false;

      if (verified) {
        // Get user country
        country = await contracts.identityRegistry.methods
          .investorCountry(account)
          .call();

        // Check if blacklisted
        isBlacklisted = await contracts.compliance.methods
          .isBlacklisted(account)
          .call();
      }

      setComplianceData({
        isVerified: verified,
        country: parseInt(country),
        isBlacklisted,
        canTransferTo: {},
        complianceRules: []
      });
    } catch (error) {
      console.error('Error loading compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  // Test transfer compliance
  const testTransferCompliance = async (e) => {
    e.preventDefault();
    
    if (!testAddress || !testAmount) {
      toast.error('Please provide test address and amount');
      return;
    }

    setLoading(true);
    try {
      const amount = testAmount; // Keep as string for display
      
      // Check if transfer would be compliant
      const canTransfer = await contracts.compliance.methods
        .canTransfer(account, testAddress, amount)
        .call();

      if (canTransfer) {
        toast.success('Transfer would be compliant ✓');
      } else {
        toast.warning('Transfer would NOT be compliant ✗');
      }

      // Update the test result in state
      setComplianceData(prev => ({
        ...prev,
        canTransferTo: {
          ...prev.canTransferTo,
          [testAddress]: canTransfer
        }
      }));
    } catch (error) {
      console.error('Error testing compliance:', error);
      toast.error('Failed to test compliance');
    } finally {
      setLoading(false);
    }
  };

  // Handle identity registration
  const handleRegisterIdentity = async () => {
    try {
      await registerIdentity();
      // Reload compliance data after registration
      setTimeout(loadComplianceData, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // Get country name
  const getCountryName = (code) => {
    const countries = {
      840: 'United States',
      124: 'Canada',
      826: 'United Kingdom',
      276: 'Germany',
      250: 'France',
      392: 'Japan',
      36: 'Australia'
    };
    return countries[code] || `Country ${code}`;
  };

  useEffect(() => {
    loadComplianceData();
  }, [isConnected, account, contracts]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <i className="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Connect your wallet to view compliance status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600 mt-1">
            ERC-3643 compliance status and transfer validation
          </p>
        </div>
        
        {!complianceData.isVerified && (
          <button
            onClick={handleRegisterIdentity}
            disabled={isLoading}
            className="btn btn-primary mt-4 md:mt-0"
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Registering...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus mr-2"></i>
                Register Identity (KYC)
              </>
            )}
          </button>
        )}
      </div>

      {/* Compliance Status */}
      <div className="grid md:grid-2 gap-6">
        {/* Identity Status */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <i className="fas fa-user-check mr-2 text-primary"></i>
            Identity Status
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner mr-3"></div>
              Loading...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">KYC Status</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  complianceData.isVerified 
                    ? 'bg-success/10 text-success' 
                    : 'bg-warning/10 text-warning'
                }`}>
                  <i className={`fas ${complianceData.isVerified ? 'fa-check-circle' : 'fa-clock'}`}></i>
                  <span className="font-medium">
                    {complianceData.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              {complianceData.isVerified && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Country</span>
                  <span className="font-medium">
                    {getCountryName(complianceData.country)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Blacklist Status</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  complianceData.isBlacklisted 
                    ? 'bg-error/10 text-error' 
                    : 'bg-success/10 text-success'
                }`}>
                  <i className={`fas ${complianceData.isBlacklisted ? 'fa-ban' : 'fa-check-circle'}`}></i>
                  <span className="font-medium">
                    {complianceData.isBlacklisted ? 'Blacklisted' : 'Clear'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transfer Capabilities */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <i className="fas fa-exchange-alt mr-2 text-primary"></i>
            Transfer Capabilities
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <h3 className="font-semibold text-info-dark mb-2">ERC-3643 Requirements</h3>
              <ul className="text-sm text-info-dark/80 space-y-1">
                <li>• Both sender and recipient must be KYC verified</li>
                <li>• Neither party can be blacklisted</li>
                <li>• Country restrictions must be respected</li>
                <li>• All compliance rules must pass</li>
              </ul>
            </div>

            {complianceData.isVerified ? (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-success"></i>
                  <span className="font-medium text-success-dark">
                    You can send and receive tokens
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle text-warning"></i>
                  <span className="font-medium text-warning-dark">
                    Complete KYC to enable token transfers
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Compliance Tester */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-test-tube mr-2 text-primary"></i>
          Transfer Compliance Tester
        </h2>
        
        <p className="text-gray-600 mb-4">
          Test if a transfer would be compliant before attempting it.
        </p>

        <form onSubmit={testTransferCompliance} className="space-y-4">
          <div className="grid md:grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Recipient Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (wei)</label>
              <input
                type="number"
                className="form-input"
                placeholder="1000000000000000000"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Testing...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>
                Test Compliance
              </>
            )}
          </button>
        </form>

        {/* Test Results */}
        {Object.keys(complianceData.canTransferTo).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Test Results</h3>
            <div className="space-y-2">
              {Object.entries(complianceData.canTransferTo).map(([address, canTransfer]) => (
                <div key={address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono">
                    {address.slice(0, 10)}...{address.slice(-8)}
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    canTransfer 
                      ? 'bg-success/10 text-success' 
                      : 'bg-error/10 text-error'
                  }`}>
                    <i className={`fas ${canTransfer ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    <span className="font-medium">
                      {canTransfer ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ERC-3643 Information */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-info-circle mr-2 text-primary"></i>
          About ERC-3643
        </h2>
        
        <div className="grid md:grid-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Key Features</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <i className="fas fa-shield-alt text-primary mt-1"></i>
                <span>Permissioned transfers with KYC/AML compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-globe text-primary mt-1"></i>
                <span>Country-based restrictions and regulations</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-user-check text-primary mt-1"></i>
                <span>Identity verification and onchain ID linking</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-ban text-primary mt-1"></i>
                <span>Blacklist and whitelist management</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Compliance Components</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <i className="fas fa-database text-secondary mt-1"></i>
                <span>Identity Registry - Manages verified identities</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-cogs text-secondary mt-1"></i>
                <span>Compliance Contract - Enforces transfer rules</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-coins text-secondary mt-1"></i>
                <span>Token Contract - ERC-20 compatible with restrictions</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-balance-scale text-secondary mt-1"></i>
                <span>Modular design for regulatory compliance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceManagement;
