import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-toastify';

const PropertyDetails = () => {
  const { 
    web3,
    account, 
    isConnected, 
    contracts, 
    balances 
  } = useWeb3();

  const [propertyData, setPropertyData] = useState({
    propertyInfo: null,
    tokenInfo: {
      name: '',
      symbol: '',
      totalSupply: '0',
      decimals: 18
    },
    marketData: {
      valuePerToken: '0',
      totalValue: '0',
      userOwnership: '0',
      userValue: '0'
    },
    recentActivity: []
  });
  
  const [loading, setLoading] = useState(false);

  // Load property data
  const loadPropertyData = async () => {
    if (!isConnected || !contracts.realEstateToken) return;

    setLoading(true);
    try {
      // Get property information
      const propertyInfo = await contracts.realEstateToken.methods.propertyInfo().call();
      
      // Get token information
      const name = await contracts.realEstateToken.methods.name().call();
      const symbol = await contracts.realEstateToken.methods.symbol().call();
      const totalSupply = await contracts.realEstateToken.methods.totalSupply().call();
      const decimals = await contracts.realEstateToken.methods.decimals().call();
      
      // Get market data
      const valuePerToken = await contracts.realEstateToken.methods.getValuePerToken().call();
      const totalValue = await contracts.realEstateToken.methods.getTotalPropertyValue().call();
      
      // Calculate user ownership
      const userBalance = parseFloat(balances.tokens);
      const totalTokens = parseFloat(totalSupply) / Math.pow(10, parseInt(decimals));
      const userOwnership = totalTokens > 0 ? (userBalance / totalTokens) * 100 : 0;
      const userValue = (userBalance * parseFloat(valuePerToken)) / Math.pow(10, 18);

      setPropertyData({
        propertyInfo: {
          ...propertyInfo,
          totalValue: propertyInfo.totalValue,
          totalShares: propertyInfo.totalShares
        },
        tokenInfo: {
          name,
          symbol,
          totalSupply,
          decimals: parseInt(decimals)
        },
        marketData: {
          valuePerToken,
          totalValue,
          userOwnership: userOwnership.toFixed(4),
          userValue: userValue.toFixed(4)
        },
        recentActivity: [] // TODO: Implement activity tracking
      });
    } catch (error) {
      console.error('Error loading property data:', error);
      toast.error('Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount, decimals = 18) => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Format number
  const formatNumber = (number) => {
    return parseFloat(number).toLocaleString();
  };

  useEffect(() => {
    loadPropertyData();
  }, [isConnected, account, contracts, balances]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <i className="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Connect your wallet to view property details.
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
          <h1 className="text-3xl font-bold text-gray-900">Property Details</h1>
          <p className="text-gray-600 mt-1">
            Detailed information about the tokenized property
          </p>
        </div>
        
        <button
          onClick={loadPropertyData}
          disabled={loading}
          className="btn btn-secondary mt-4 md:mt-0"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property data...</p>
        </div>
      ) : (
        <>
          {/* Property Overview */}
          {propertyData.propertyInfo && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                <i className="fas fa-building mr-2 text-primary"></i>
                Property Overview
              </h2>
              
              <div className="grid md:grid-2 gap-8">
                {/* Property Image Placeholder */}
                <div>
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-gray-500">
                      <i className="fas fa-building text-6xl mb-2"></i>
                      <p>Property Image</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">Address</h3>
                      <p className="text-gray-600">{propertyData.propertyInfo.propertyAddress}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800">Description</h3>
                      <p className="text-gray-600">{propertyData.propertyInfo.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">Status:</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        propertyData.propertyInfo.isActive 
                          ? 'bg-success/10 text-success' 
                          : 'bg-error/10 text-error'
                      }`}>
                        {propertyData.propertyInfo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Property Statistics */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Property Statistics</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Property Value</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(propertyData.propertyInfo.totalValue)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-secondary/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Shares</span>
                        <span className="text-2xl font-bold text-secondary">
                          {formatNumber(propertyData.propertyInfo.totalShares)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-success/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Value per Share</span>
                        <span className="text-2xl font-bold text-success">
                          {formatCurrency(propertyData.marketData.valuePerToken)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Token Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="fas fa-coins mr-2 text-primary"></i>
              Token Information
            </h2>
            
            <div className="grid md:grid-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {propertyData.tokenInfo.name}
                </div>
                <div className="text-sm text-gray-600">Token Name</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {propertyData.tokenInfo.symbol}
                </div>
                <div className="text-sm text-gray-600">Symbol</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(parseFloat(propertyData.tokenInfo.totalSupply) / Math.pow(10, propertyData.tokenInfo.decimals))}
                </div>
                <div className="text-sm text-gray-600">Total Supply</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {propertyData.tokenInfo.decimals}
                </div>
                <div className="text-sm text-gray-600">Decimals</div>
              </div>
            </div>
          </div>

          {/* Your Investment */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="fas fa-chart-pie mr-2 text-primary"></i>
              Your Investment
            </h2>
            
            <div className="grid md:grid-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Holdings Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <span className="text-gray-600">Your Tokens</span>
                    <span className="text-xl font-bold text-primary">
                      {balances.tokens} {propertyData.tokenInfo.symbol}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                    <span className="text-gray-600">Ownership Percentage</span>
                    <span className="text-xl font-bold text-secondary">
                      {propertyData.marketData.userOwnership}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg">
                    <span className="text-gray-600">Investment Value</span>
                    <span className="text-xl font-bold text-success">
                      {formatCurrency(propertyData.marketData.userValue, 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Investment Breakdown</h3>
                
                {/* Simple ownership visualization */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Your Share</span>
                      <span>{propertyData.marketData.userOwnership}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(parseFloat(propertyData.marketData.userOwnership), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Total Tokens Issued:</span>
                        <span>{formatNumber(parseFloat(propertyData.tokenInfo.totalSupply) / Math.pow(10, propertyData.tokenInfo.decimals))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Your Tokens:</span>
                        <span>{balances.tokens}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Remaining Available:</span>
                        <span>{formatNumber((parseFloat(propertyData.tokenInfo.totalSupply) / Math.pow(10, propertyData.tokenInfo.decimals)) - parseFloat(balances.tokens))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ERC-3643 Compliance Info */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="fas fa-shield-alt mr-2 text-primary"></i>
              ERC-3643 Compliance Features
            </h2>
            
            <div className="grid md:grid-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <i className="fas fa-user-check text-primary text-3xl mb-3"></i>
                <h3 className="font-semibold text-gray-800 mb-2">KYC Verification</h3>
                <p className="text-sm text-gray-600">
                  All token holders must complete identity verification
                </p>
              </div>
              
              <div className="text-center p-6 bg-secondary/5 rounded-lg">
                <i className="fas fa-globe text-secondary text-3xl mb-3"></i>
                <h3 className="font-semibold text-gray-800 mb-2">Geographic Compliance</h3>
                <p className="text-sm text-gray-600">
                  Country-based restrictions ensure regulatory compliance
                </p>
              </div>
              
              <div className="text-center p-6 bg-success/5 rounded-lg">
                <i className="fas fa-lock text-success text-3xl mb-3"></i>
                <h3 className="font-semibold text-gray-800 mb-2">Transfer Controls</h3>
                <p className="text-sm text-gray-600">
                  All transfers validated against compliance rules
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="fas fa-bolt mr-2 text-primary"></i>
              Quick Actions
            </h2>
            
            <div className="grid md:grid-3 gap-4">
              <a href="/tokens" className="btn btn-primary">
                <i className="fas fa-exchange-alt mr-2"></i>
                Transfer Tokens
              </a>
              
              <a href="/leases" className="btn btn-secondary">
                <i className="fas fa-file-contract mr-2"></i>
                Create Lease
              </a>
              
              <a href="/compliance" className="btn btn-success">
                <i className="fas fa-shield-alt mr-2"></i>
                Check Compliance
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyDetails;
