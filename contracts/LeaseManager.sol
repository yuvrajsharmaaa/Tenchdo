// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RealEstateToken.sol";

/**
 * @title LeaseManager
 * @dev Manages lease agreements and rent payments for tokenized real estate
 */
contract LeaseManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Lease status enum
    enum LeaseStatus {
        Pending,
        Active,
        Expired,
        Terminated,
        Cancelled
    }
    
    // Lease agreement structure
    struct LeaseAgreement {
        uint256 leaseId;
        address landlord;
        address tenant;
        address propertyToken;
        uint256 monthlyRent;
        uint256 securityDeposit;
        uint256 startDate;
        uint256 endDate;
        string propertyAddress;
        string terms;
        LeaseStatus status;
        uint256 depositPaid;
        uint256 lastRentPayment;
        uint256 totalRentPaid;
        bool depositReturned;
    }
    
    // Payment structure
    struct RentPayment {
        uint256 leaseId;
        address payer;
        uint256 amount;
        uint256 timestamp;
        uint256 forMonth;
        uint256 forYear;
    }
    
    // Storage
    mapping(uint256 => LeaseAgreement) public leases;
    mapping(uint256 => RentPayment[]) public rentPayments;
    mapping(address => uint256[]) public landlordLeases;
    mapping(address => uint256[]) public tenantLeases;
    
    uint256 public nextLeaseId;
    
    // Payment token (could be USDC, DAI, or ETH)
    IERC20 public paymentToken;
    
    // Events
    event LeaseCreated(
        uint256 indexed leaseId,
        address indexed landlord,
        address indexed tenant,
        uint256 monthlyRent,
        uint256 securityDeposit
    );
    
    event LeaseActivated(uint256 indexed leaseId);
    event LeaseTerminated(uint256 indexed leaseId);
    event LeaseCancelled(uint256 indexed leaseId);
    
    event SecurityDepositPaid(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount
    );
    
    event RentPaid(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount,
        uint256 forMonth,
        uint256 forYear
    );
    
    event SecurityDepositReturned(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount
    );
    
    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        nextLeaseId = 1;
    }
    
    /**
     * @dev Create a new lease agreement
     * @param _tenant Tenant address
     * @param _propertyToken Property token contract address
     * @param _monthlyRent Monthly rent amount
     * @param _securityDeposit Security deposit amount
     * @param _startDate Lease start date (timestamp)
     * @param _endDate Lease end date (timestamp)
     * @param _propertyAddress Physical property address
     * @param _terms Lease terms and conditions
     */
    function createLease(
        address _tenant,
        address _propertyToken,
        uint256 _monthlyRent,
        uint256 _securityDeposit,
        uint256 _startDate,
        uint256 _endDate,
        string memory _propertyAddress,
        string memory _terms
    ) external returns (uint256) {
        require(_tenant != address(0), "Invalid tenant address");
        require(_propertyToken != address(0), "Invalid property token");
        require(_monthlyRent > 0, "Invalid monthly rent");
        require(_securityDeposit > 0, "Invalid security deposit");
        require(_startDate > block.timestamp, "Invalid start date");
        require(_endDate > _startDate, "Invalid end date");
        require(bytes(_propertyAddress).length > 0, "Invalid property address");
        
        // Verify landlord owns property tokens
        RealEstateToken propertyTokenContract = RealEstateToken(_propertyToken);
        require(
            propertyTokenContract.balanceOf(msg.sender) > 0, 
            "Landlord must own property tokens"
        );
        
        uint256 leaseId = nextLeaseId++;
        
        LeaseAgreement storage lease = leases[leaseId];
        lease.leaseId = leaseId;
        lease.landlord = msg.sender;
        lease.tenant = _tenant;
        lease.propertyToken = _propertyToken;
        lease.monthlyRent = _monthlyRent;
        lease.securityDeposit = _securityDeposit;
        lease.startDate = _startDate;
        lease.endDate = _endDate;
        lease.propertyAddress = _propertyAddress;
        lease.terms = _terms;
        lease.status = LeaseStatus.Pending;
        
        landlordLeases[msg.sender].push(leaseId);
        tenantLeases[_tenant].push(leaseId);
        
        emit LeaseCreated(leaseId, msg.sender, _tenant, _monthlyRent, _securityDeposit);
        
        return leaseId;
    }
    
    /**
     * @dev Pay security deposit to activate lease
     * @param _leaseId Lease ID
     */
    function paySecurityDeposit(uint256 _leaseId) external nonReentrant {
        LeaseAgreement storage lease = leases[_leaseId];
        require(lease.leaseId != 0, "Lease does not exist");
        require(msg.sender == lease.tenant, "Only tenant can pay deposit");
        require(lease.status == LeaseStatus.Pending, "Lease not pending");
        require(lease.depositPaid == 0, "Deposit already paid");
        
        lease.depositPaid = lease.securityDeposit;
        lease.status = LeaseStatus.Active;
        
        // Transfer security deposit from tenant to contract
        // Transfer deposit from tenant to contract using SafeERC20
        paymentToken.safeTransferFrom(msg.sender, address(this), lease.securityDeposit);
        
        emit SecurityDepositPaid(_leaseId, msg.sender, lease.securityDeposit);
        emit LeaseActivated(_leaseId);
    }
    
    /**
     * @dev Pay monthly rent
     * @param _leaseId Lease ID
     * @param _forMonth Month (1-12)
     * @param _forYear Year
     */
    function payRent(
        uint256 _leaseId,
        uint256 _forMonth,
        uint256 _forYear
    ) external nonReentrant {
        LeaseAgreement storage lease = leases[_leaseId];
        require(lease.leaseId != 0, "Lease does not exist");
        require(msg.sender == lease.tenant, "Only tenant can pay rent");
        require(lease.status == LeaseStatus.Active, "Lease not active");
        require(_forMonth >= 1 && _forMonth <= 12, "Invalid month");
        require(_forYear >= 2024, "Invalid year");
        
        // Check if rent already paid for this month/year
        RentPayment[] storage payments = rentPayments[_leaseId];
        for (uint256 i = 0; i < payments.length; i++) {
            require(
                !(payments[i].forMonth == _forMonth && payments[i].forYear == _forYear),
                "Rent already paid for this period"
            );
        }
        
        // Transfer rent from tenant to landlord
        // Transfer rent from tenant to landlord using SafeERC20
        paymentToken.safeTransferFrom(msg.sender, lease.landlord, lease.monthlyRent);
        
        // Record payment
        RentPayment memory payment = RentPayment({
            leaseId: _leaseId,
            payer: msg.sender,
            amount: lease.monthlyRent,
            timestamp: block.timestamp,
            forMonth: _forMonth,
            forYear: _forYear
        });
        
        rentPayments[_leaseId].push(payment);
        lease.lastRentPayment = block.timestamp;
        lease.totalRentPaid += lease.monthlyRent;
        
        emit RentPaid(_leaseId, msg.sender, lease.monthlyRent, _forMonth, _forYear);
    }
    
    /**
     * @dev Terminate lease (landlord or tenant)
     * @param _leaseId Lease ID
     */
    function terminateLease(uint256 _leaseId) external {
        LeaseAgreement storage lease = leases[_leaseId];
        require(lease.leaseId != 0, "Lease does not exist");
        require(
            msg.sender == lease.landlord || msg.sender == lease.tenant,
            "Not authorized"
        );
        require(lease.status == LeaseStatus.Active, "Lease not active");
        
        lease.status = LeaseStatus.Terminated;
        
        emit LeaseTerminated(_leaseId);
    }
    
    /**
     * @dev Return security deposit (landlord only)
     * @param _leaseId Lease ID
     * @param _returnAmount Amount to return (may be less than full deposit)
     */
    function returnSecurityDeposit(
        uint256 _leaseId,
        uint256 _returnAmount
    ) external nonReentrant {
        LeaseAgreement storage lease = leases[_leaseId];
        require(lease.leaseId != 0, "Lease does not exist");
        require(msg.sender == lease.landlord, "Only landlord can return deposit");
        require(
            lease.status == LeaseStatus.Terminated || lease.status == LeaseStatus.Expired,
            "Lease must be terminated or expired"
        );
        require(!lease.depositReturned, "Deposit already returned");
        require(_returnAmount <= lease.depositPaid, "Return amount too high");
        
        lease.depositReturned = true;
        
        // Return deposit to tenant
        if (_returnAmount > 0) {
            paymentToken.safeTransfer(lease.tenant, _returnAmount);
        }
        
        // Keep remaining deposit (if any) as landlord compensation
        uint256 keepAmount = lease.depositPaid - _returnAmount;
        if (keepAmount > 0) {
            paymentToken.safeTransfer(lease.landlord, keepAmount);
        }
        
        emit SecurityDepositReturned(_leaseId, lease.tenant, _returnAmount);
    }
    
    /**
     * @dev Cancel pending lease (landlord only)
     * @param _leaseId Lease ID
     */
    function cancelLease(uint256 _leaseId) external {
        LeaseAgreement storage lease = leases[_leaseId];
        require(lease.leaseId != 0, "Lease does not exist");
        require(msg.sender == lease.landlord, "Only landlord can cancel");
        require(lease.status == LeaseStatus.Pending, "Can only cancel pending lease");
        
        lease.status = LeaseStatus.Cancelled;
        
        emit LeaseCancelled(_leaseId);
    }
    
    /**
     * @dev Get lease details
     * @param _leaseId Lease ID
     * @return Lease agreement details
     */
    function getLease(uint256 _leaseId) external view returns (LeaseAgreement memory) {
        require(leases[_leaseId].leaseId != 0, "Lease does not exist");
        return leases[_leaseId];
    }
    
    /**
     * @dev Get rent payment history
     * @param _leaseId Lease ID
     * @return Array of rent payments
     */
    function getRentPayments(uint256 _leaseId) external view returns (RentPayment[] memory) {
        require(leases[_leaseId].leaseId != 0, "Lease does not exist");
        return rentPayments[_leaseId];
    }
    
    /**
     * @dev Get leases by landlord
     * @param _landlord Landlord address
     * @return Array of lease IDs
     */
    function getLandlordLeases(address _landlord) external view returns (uint256[] memory) {
        return landlordLeases[_landlord];
    }
    
    /**
     * @dev Get leases by tenant
     * @param _tenant Tenant address
     * @return Array of lease IDs
     */
    function getTenantLeases(address _tenant) external view returns (uint256[] memory) {
        return tenantLeases[_tenant];
    }
    
    /**
     * @dev Update payment token (admin only)
     * @param _paymentToken New payment token address
     */
    function setPaymentToken(address _paymentToken) external onlyOwner {
        require(_paymentToken != address(0), "Invalid payment token");
        paymentToken = IERC20(_paymentToken);
    }
    
    /**
     * @dev Check if lease is expired
     * @param _leaseId Lease ID
     * @return True if lease is expired
     */
    function isLeaseExpired(uint256 _leaseId) external view returns (bool) {
        LeaseAgreement memory lease = leases[_leaseId];
        return lease.leaseId != 0 && block.timestamp > lease.endDate;
    }
}

