import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3ContextSepolia';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const LeaseManagement = () => {
  const { 
    web3,
    account, 
    isConnected, 
    contracts, 
    balances,
    updateBalances
  } = useWeb3();

  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [leases, setLeases] = useState([]);

  // Create lease form
  const [createForm, setCreateForm] = useState({
    tenant: '',
    monthlyRent: '',
    securityDeposit: '',
    startDate: '',
    endDate: '',
    propertyAddress: '',
    terms: ''
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    leaseId: '',
    month: '',
    year: new Date().getFullYear().toString()
  });

  const leaseStatusLabels = {
    0: 'Pending',
    1: 'Active', 
    2: 'Expired',
    3: 'Terminated',
    4: 'Cancelled'
  };

  const leaseStatusColors = {
    0: 'status-pending',
    1: 'status-active',
    2: 'status-expired',
    3: 'status-terminated',
    4: 'status-terminated'
  };

  // Load user leases
  const loadLeases = async () => {
    if (!isConnected || !contracts.leaseManager) return;

    setLoading(true);
    try {
      // Get leases where user is landlord
      const landlordLeaseIds = await contracts.leaseManager.methods
        .getLandlordLeases(account)
        .call();

      // Get leases where user is tenant
      const tenantLeaseIds = await contracts.leaseManager.methods
        .getTenantLeases(account)
        .call();

      // Combine and get lease details
      const allLeaseIds = [...landlordLeaseIds, ...tenantLeaseIds];
      const leaseDetails = [];

      for (const leaseId of allLeaseIds) {
        try {
          const lease = await contracts.leaseManager.methods
            .getLease(leaseId)
            .call();
          
          leaseDetails.push({
            ...lease,
            isLandlord: lease.landlord.toLowerCase() === account.toLowerCase(),
            isTenant: lease.tenant.toLowerCase() === account.toLowerCase()
          });
        } catch (error) {
          console.error(`Error loading lease ${leaseId}:`, error);
        }
      }

      setLeases(leaseDetails);
    } catch (error) {
      console.error('Error loading leases:', error);
      toast.error('Failed to load leases');
    } finally {
      setLoading(false);
    }
  };

  // Handle create lease
  const handleCreateLease = async (e) => {
    e.preventDefault();
    
    if (!createForm.tenant || !createForm.monthlyRent || !createForm.securityDeposit || 
        !createForm.startDate || !createForm.endDate || !createForm.propertyAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const startTimestamp = Math.floor(new Date(createForm.startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(createForm.endDate).getTime() / 1000);
      
      const monthlyRent = web3.utils.toWei(createForm.monthlyRent, 'mwei'); // USDC has 6 decimals
      const securityDeposit = web3.utils.toWei(createForm.securityDeposit, 'mwei');

      const tx = await contracts.leaseManager.methods
        .createLease(
          createForm.tenant,
          contracts.realEstateToken._address,
          monthlyRent,
          securityDeposit,
          startTimestamp,
          endTimestamp,
          createForm.propertyAddress,
          createForm.terms || 'Standard lease terms'
        )
        .send({ from: account });

      toast.success('Lease created successfully!');
      setCreateForm({
        tenant: '',
        monthlyRent: '',
        securityDeposit: '',
        startDate: '',
        endDate: '',
        propertyAddress: '',
        terms: ''
      });
      
      loadLeases();
    } catch (error) {
      console.error('Lease creation failed:', error);
      toast.error('Lease creation failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle pay security deposit
  const handlePayDeposit = async (lease) => {
    setLoading(true);
    try {
      // First approve USDC spending
      const depositAmount = lease.securityDeposit;
      
      await contracts.mockUSDC.methods
        .approve(contracts.leaseManager._address, depositAmount)
        .send({ from: account });

      // Then pay the deposit
      const tx = await contracts.leaseManager.methods
        .paySecurityDeposit(lease.leaseId)
        .send({ from: account });

      toast.success('Security deposit paid successfully!');
      updateBalances();
      loadLeases();
    } catch (error) {
      console.error('Deposit payment failed:', error);
      toast.error('Deposit payment failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle rent payment
  const handlePayRent = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.leaseId || !paymentForm.month || !paymentForm.year) {
      toast.error('Please fill in all payment details');
      return;
    }

    setLoading(true);
    try {
      const lease = leases.find(l => l.leaseId === paymentForm.leaseId);
      if (!lease) {
        toast.error('Lease not found');
        return;
      }

      // First approve USDC spending
      await contracts.mockUSDC.methods
        .approve(contracts.leaseManager._address, lease.monthlyRent)
        .send({ from: account });

      // Then pay rent
      const tx = await contracts.leaseManager.methods
        .payRent(
          paymentForm.leaseId,
          parseInt(paymentForm.month),
          parseInt(paymentForm.year)
        )
        .send({ from: account });

      toast.success('Rent payment successful!');
      setPaymentForm({
        leaseId: '',
        month: '',
        year: new Date().getFullYear().toString()
      });
      
      updateBalances();
      loadLeases();
    } catch (error) {
      console.error('Rent payment failed:', error);
      toast.error('Rent payment failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return (parseFloat(amount) / 1e6).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  // Format date
  const formatDate = (timestamp) => {
    return format(new Date(parseInt(timestamp) * 1000), 'MMM dd, yyyy');
  };

  useEffect(() => {
    loadLeases();
  }, [isConnected, account, contracts]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <i className="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Connect your wallet to manage lease agreements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lease Management</h1>
        <p className="text-gray-600 mt-1">
          Create and manage property lease agreements
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-plus mr-2"></i>
              Create Lease
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-list mr-2"></i>
              My Leases ({leases.length})
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payment'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-credit-card mr-2"></i>
              Pay Rent
            </button>
          </nav>
        </div>

        {/* Create Lease Tab */}
        {activeTab === 'create' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Lease</h3>
            <form onSubmit={handleCreateLease} className="space-y-4">
              <div className="grid md:grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tenant Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0x..."
                    value={createForm.tenant}
                    onChange={(e) => setCreateForm({ ...createForm, tenant: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Property Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123 Main St, City, State"
                    value={createForm.propertyAddress}
                    onChange={(e) => setCreateForm({ ...createForm, propertyAddress: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Monthly Rent (USDC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="1000.00"
                    value={createForm.monthlyRent}
                    onChange={(e) => setCreateForm({ ...createForm, monthlyRent: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Deposit (USDC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="2000.00"
                    value={createForm.securityDeposit}
                    onChange={(e) => setCreateForm({ ...createForm, securityDeposit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lease Terms</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Enter lease terms and conditions..."
                  value={createForm.terms}
                  onChange={(e) => setCreateForm({ ...createForm, terms: e.target.value })}
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Create Lease
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Manage Leases Tab */}
        {activeTab === 'manage' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">My Leases</h3>
              <button
                onClick={loadLeases}
                disabled={loading}
                className="btn btn-secondary btn-sm"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="spinner mr-3"></div>
                Loading leases...
              </div>
            ) : leases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-file-contract text-4xl mb-4"></i>
                <p>No leases found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leases.map((lease, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Lease #{lease.leaseId}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {lease.propertyAddress}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`status-badge ${leaseStatusColors[lease.status]}`}>
                          {leaseStatusLabels[lease.status]}
                        </span>
                        {lease.isLandlord && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Landlord
                          </span>
                        )}
                        {lease.isTenant && (
                          <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                            Tenant
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Monthly Rent:</span>
                        <p className="font-medium">{formatCurrency(lease.monthlyRent)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Security Deposit:</span>
                        <p className="font-medium">{formatCurrency(lease.securityDeposit)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Lease Period:</span>
                        <p className="font-medium">
                          {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                        </p>
                      </div>
                    </div>

                    {lease.status === '0' && lease.isTenant && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handlePayDeposit(lease)}
                          disabled={loading}
                          className="btn btn-success btn-sm"
                        >
                          <i className="fas fa-credit-card mr-2"></i>
                          Pay Security Deposit
                        </button>
                      </div>
                    )}

                    {lease.totalRentPaid > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm">
                          <span className="text-gray-600">Total Rent Paid:</span>
                          <span className="font-medium ml-2">
                            {formatCurrency(lease.totalRentPaid)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pay Rent Tab */}
        {activeTab === 'payment' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pay Rent</h3>
            
            <div className="mb-6">
              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <i className="fas fa-info-circle text-info"></i>
                  <span className="text-sm text-info-dark">
                    Your USDC Balance: {balances.usdc} USDC
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handlePayRent} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Select Lease</label>
                <select
                  className="form-input"
                  value={paymentForm.leaseId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, leaseId: e.target.value })}
                  required
                >
                  <option value="">Select a lease...</option>
                  {leases
                    .filter(lease => lease.isTenant && lease.status === '1')
                    .map((lease) => (
                      <option key={lease.leaseId} value={lease.leaseId}>
                        Lease #{lease.leaseId} - {lease.propertyAddress} 
                        ({formatCurrency(lease.monthlyRent)}/month)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select
                    className="form-input"
                    value={paymentForm.month}
                    onChange={(e) => setPaymentForm({ ...paymentForm, month: e.target.value })}
                    required
                  >
                    <option value="">Select month...</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select
                    className="form-input"
                    value={paymentForm.year}
                    onChange={(e) => setPaymentForm({ ...paymentForm, year: e.target.value })}
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
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
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card mr-2"></i>
                    Pay Rent
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

export default LeaseManagement;
