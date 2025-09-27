import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';
import ConnectionTest from '../components/ConnectionTest';
import ContractTest from '../components/ContractTest';
import ContractDebugger from '../components/ContractDebugger';
import MetaMaskConnection from '../components/MetaMaskConnection';

const Dashboard = () => {
  const { 
    account, 
    isConnected, 
    contracts, 
    balances, 
    isUserVerified, 
    registerIdentity,
    isLoading 
  } = useWeb3();

  const [dashboardData, setDashboardData] = useState({
    propertyInfo: null,
    isVerified: false,
    totalSupply: '0',
    userLeases: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!isConnected || !contracts.realEstateToken) return;

    setLoading(true);
    try {
      // Get property information
      const propertyInfo = await contracts.realEstateToken.methods.propertyInfo().call();
      
      // Get token total supply
      const totalSupply = await contracts.realEstateToken.methods.totalSupply().call();
      
      // Check if user is verified
      const verified = await isUserVerified();
      
      // Get user leases
      let landlordLeases = [];
      let tenantLeases = [];
      
      if (contracts.leaseManager) {
        try {
          landlordLeases = await contracts.leaseManager.methods.getLandlordLeases(account).call();
          tenantLeases = await contracts.leaseManager.methods.getTenantLeases(account).call();
        } catch (error) {
          console.log('Error loading leases:', error);
        }
      }

      setDashboardData({
        propertyInfo: {
          ...propertyInfo,
          totalValue: propertyInfo.totalValue,
          totalShares: propertyInfo.totalShares
        },
        isVerified: verified,
        totalSupply: totalSupply,
        userLeases: [...landlordLeases, ...tenantLeases],
        recentTransactions: [] // TODO: Implement transaction history
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Handle identity registration
  const handleRegisterIdentity = async () => {
    try {
      await registerIdentity();
      // Reload dashboard data after registration
      setTimeout(loadDashboardData, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isConnected, account, contracts, loadDashboardData]);

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real Estate dApp</h1>
          <p className="text-gray-600">ERC-3643 Compliant Property Tokenization</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <MetaMaskConnection />
        </div>

        <div className="max-w-4xl mx-auto">
          <ConnectionTest />
        </div>

        <div className="text-center">
          <div className="grid grid-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <i className="fas fa-shield-alt text-3xl text-primary mb-3"></i>
              <h3 className="font-semibold text-gray-800">ERC-3643 Compliant</h3>
              <p className="text-sm text-gray-600">Permissioned token transfers</p>
            </div>
            <div className="text-center">
              <i className="fas fa-user-check text-3xl text-primary mb-3"></i>
              <h3 className="font-semibold text-gray-800">KYC/AML</h3>
              <p className="text-sm text-gray-600">Identity verification</p>
            </div>
            <div className="text-center">
              <i className="fas fa-file-contract text-3xl text-primary mb-3"></i>
              <h3 className="font-semibold text-gray-800">Smart Leases</h3>
              <p className="text-sm text-gray-600">Automated agreements</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add contract test component for debugging
  if (isConnected && Object.keys(contracts).length === 0) {
    return (
      <div className="py-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Contracts...</h2>
          <p className="text-gray-600">Please wait while we connect to the smart contracts</p>
        </div>
        <ContractTest />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Component */}
      <ContractDebugger />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to your Real Estate dApp dashboard
          </p>
        </div>
        
        {!dashboardData.isVerified && (
          <button
            onClick={handleRegisterIdentity}
            disabled={isLoading}
            className="btn btn-warning mt-4 md:mt-0"
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

      {/* Verification Status */}
      {!dashboardData.isVerified && (
        <div className="card bg-warning/10 border-warning/20">
          <div className="flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-warning text-xl"></i>
            <div>
              <h3 className="font-semibold text-warning-dark">Identity Verification Required</h3>
              <p className="text-sm text-warning-dark/80">
                You need to complete KYC verification to transfer tokens and participate in leases.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-2 lg:grid-4 gap-6">
        {/* ETH Balance */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <i className="fab fa-ethereum text-primary text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">ETH Balance</p>
              <p className="text-xl font-bold text-gray-900">
                {parseFloat(balances.eth || '0') > 0 ? balances.eth : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Property Tokens */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-coins text-secondary text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Property Tokens</p>
              <p className="text-xl font-bold text-gray-900">
                {parseFloat(balances.tokens || '0') > 0 ? balances.tokens : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* USDC Balance */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-dollar-sign text-success text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">USDC Balance</p>
              <p className="text-xl font-bold text-gray-900">
                ${parseFloat(balances.usdc || '0') > 0 ? balances.usdc : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Active Leases */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-contract text-warning text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Leases</p>
              <p className="text-xl font-bold text-gray-900">{dashboardData.userLeases.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Information */}
      {dashboardData.propertyInfo && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <i className="fas fa-building mr-2 text-primary"></i>
            Property Information
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner mr-3"></div>
              Loading property data...
            </div>
          ) : (
            <div className="grid md:grid-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Property Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{dashboardData.propertyInfo.propertyAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium">
                      {(parseFloat(dashboardData.propertyInfo.totalValue) / 1e18).toLocaleString()} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Shares:</span>
                    <span className="font-medium">
                      {parseInt(dashboardData.propertyInfo.totalShares).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${dashboardData.propertyInfo.isActive ? 'text-success' : 'text-error'}`}>
                      {dashboardData.propertyInfo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Token Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Supply:</span>
                    <span className="font-medium">
                      {(parseFloat(dashboardData.totalSupply) / 1e18).toLocaleString()} Tokens
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Holdings:</span>
                    <span className="font-medium">{balances.tokens} Tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ownership %:</span>
                    <span className="font-medium">
                      {dashboardData.totalSupply > 0 
                        ? ((parseFloat(balances.tokens) / (parseFloat(dashboardData.totalSupply) / 1e18)) * 100).toFixed(4)
                        : '0'
                      }%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {dashboardData.propertyInfo.description}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-3 gap-6">
        <Link to="/tokens" className="card hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-coins text-primary text-2xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Manage Tokens</h3>
            <p className="text-sm text-gray-600">
              Transfer, mint, or burn property tokens
            </p>
          </div>
        </Link>

        <Link to="/leases" className="card hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-file-contract text-secondary text-2xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Lease Management</h3>
            <p className="text-sm text-gray-600">
              Create and manage lease agreements
            </p>
          </div>
        </Link>

        <Link to="/compliance" className="card hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-shield-alt text-success text-2xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Compliance</h3>
            <p className="text-sm text-gray-600">
              View compliance status and rules
            </p>
          </div>
        </Link>
      </div>

      {/* Verification Status Card */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-user-check mr-2 text-primary"></i>
          Account Status
        </h2>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            dashboardData.isVerified 
              ? 'bg-success/10 text-success' 
              : 'bg-warning/10 text-warning'
          }`}>
            <i className={`fas ${dashboardData.isVerified ? 'fa-check-circle' : 'fa-clock'}`}></i>
            <span className="font-medium">
              {dashboardData.isVerified ? 'KYC Verified' : 'KYC Pending'}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            {dashboardData.isVerified 
              ? 'You can now transfer tokens and participate in leases'
              : 'Complete KYC verification to unlock all features'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
