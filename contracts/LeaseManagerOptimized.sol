// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title LeaseManagerOptimized
 * @dev Ultra-optimized lease management with packed structs and gas-efficient operations
 * Handles rent payments, security deposits, and lease lifecycle with minimal gas usage
 */
contract LeaseManagerOptimized is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Gas-optimized lease status enum
    enum LeaseStatus { Pending, Active, Expired, Terminated, Cancelled }
    
    // Ultra-packed lease structure (fits in fewer storage slots)
    struct LeaseAgreement {
        address landlord;           // 20 bytes
        address tenant;             // 20 bytes
        address propertyToken;      // 20 bytes
        uint128 monthlyRent;        // 16 bytes - sufficient for rent amounts
        uint128 securityDeposit;    // 16 bytes - sufficient for deposits
        uint64 startDate;           // 8 bytes - sufficient until year 2554
        uint64 endDate;             // 8 bytes - sufficient until year 2554
        uint64 lastRentPayment;     // 8 bytes - sufficient for timestamps
        uint32 leaseId;             // 4 bytes - supports 4B+ leases
        LeaseStatus status;         // 1 byte
        bool depositPaid;           // 1 bit
        bool depositReturned;       // 1 bit
    }
    
    // Compact rent payment structure
    struct RentPayment {
        uint128 amount;             // 16 bytes
        uint64 timestamp;           // 8 bytes
        uint32 leaseId;             // 4 bytes
        uint16 forMonth;            // 2 bytes (1-12)
        uint16 forYear;             // 2 bytes
    }
    
    // Storage
    mapping(uint32 => LeaseAgreement) public leases;
    mapping(uint32 => RentPayment[]) public rentPayments;
    mapping(address => uint32[]) public landlordLeases;
    mapping(address => uint32[]) public tenantLeases;
    
    // Gas-optimized counters
    uint32 public nextLeaseId = 1;
    
    // Immutable payment token for gas savings
    IERC20 public immutable paymentToken;
    
    // Events with indexed parameters for efficient filtering
    event LeaseCreated(
        uint32 indexed leaseId,
        address indexed landlord,
        address indexed tenant,
        uint128 monthlyRent
    );
    event SecurityDepositPaid(uint32 indexed leaseId, uint128 amount);
    event RentPaid(uint32 indexed leaseId, uint128 amount, uint16 month, uint16 year);
    event LeaseStatusChanged(uint32 indexed leaseId, LeaseStatus status);
    
    constructor(address _paymentToken) Ownable(msg.sender) {
        if (_paymentToken == address(0)) revert("Invalid payment token");
        paymentToken = IERC20(_paymentToken);
    }
    
    /**
     * @dev Ultra-optimized lease creation
     */
    function createLease(
        address _tenant,
        address _propertyToken,
        uint128 _monthlyRent,
        uint128 _securityDeposit,
        uint64 _startDate,
        uint64 _endDate
    ) external returns (uint32) {
        // Gas-efficient validation
        if (_tenant == address(0) || _propertyToken == address(0)) {
            revert("Invalid addresses");
        }
        if (_monthlyRent == 0 || _securityDeposit == 0) {
            revert("Invalid amounts");
        }
        if (_startDate <= block.timestamp || _endDate <= _startDate) {
            revert("Invalid dates");
        }
        
        // Verify landlord owns property tokens
        if (IERC20(_propertyToken).balanceOf(msg.sender) == 0) {
            revert("Landlord must own property tokens");
        }
        
        uint32 leaseId = nextLeaseId;
        unchecked {
            ++nextLeaseId; // Safe due to uint32 size
        }
        
        // Create optimized lease structure
        leases[leaseId] = LeaseAgreement({
            leaseId: leaseId,
            landlord: msg.sender,
            tenant: _tenant,
            propertyToken: _propertyToken,
            monthlyRent: _monthlyRent,
            securityDeposit: _securityDeposit,
            startDate: _startDate,
            endDate: _endDate,
            lastRentPayment: 0,
            status: LeaseStatus.Pending,
            depositPaid: false,
            depositReturned: false
        });
        
        // Update mappings
        landlordLeases[msg.sender].push(leaseId);
        tenantLeases[_tenant].push(leaseId);
        
        emit LeaseCreated(leaseId, msg.sender, _tenant, _monthlyRent);
        return leaseId;
    }
    
    /**
     * @dev Gas-optimized security deposit payment
     */
    function paySecurityDeposit(uint32 _leaseId) external nonReentrant {
        LeaseAgreement storage lease = leases[_leaseId];
        
        // Gas-efficient validation
        if (lease.leaseId == 0) revert("Lease does not exist");
        if (msg.sender != lease.tenant) revert("Only tenant can pay");
        if (lease.status != LeaseStatus.Pending) revert("Invalid lease status");
        if (lease.depositPaid) revert("Deposit already paid");
        
        // Update state before external call
        lease.depositPaid = true;
        lease.status = LeaseStatus.Active;
        
        // Safe transfer
        paymentToken.safeTransferFrom(msg.sender, address(this), lease.securityDeposit);
        
        emit SecurityDepositPaid(_leaseId, lease.securityDeposit);
        emit LeaseStatusChanged(_leaseId, LeaseStatus.Active);
    }
    
    /**
     * @dev Ultra-optimized rent payment
     */
    function payRent(uint32 _leaseId, uint16 _forMonth, uint16 _forYear) external nonReentrant {
        LeaseAgreement storage lease = leases[_leaseId];
        
        // Gas-efficient validation
        if (lease.leaseId == 0) revert("Lease does not exist");
        if (msg.sender != lease.tenant) revert("Only tenant can pay");
        if (lease.status != LeaseStatus.Active) revert("Lease not active");
        if (_forMonth == 0 || _forMonth > 12) revert("Invalid month");
        if (_forYear < 2024) revert("Invalid year");
        
        // Check if rent already paid (gas-optimized loop)
        RentPayment[] storage payments = rentPayments[_leaseId];
        uint256 length = payments.length;
        for (uint256 i; i < length;) {
            if (payments[i].forMonth == _forMonth && payments[i].forYear == _forYear) {
                revert("Rent already paid");
            }
            unchecked { ++i; }
        }
        
        // Update state
        lease.lastRentPayment = uint64(block.timestamp);
        
        // Record payment
        rentPayments[_leaseId].push(RentPayment({
            leaseId: _leaseId,
            amount: lease.monthlyRent,
            timestamp: uint64(block.timestamp),
            forMonth: _forMonth,
            forYear: _forYear
        }));
        
        // Transfer rent directly to landlord (gas efficient)
        paymentToken.safeTransferFrom(msg.sender, lease.landlord, lease.monthlyRent);
        
        emit RentPaid(_leaseId, lease.monthlyRent, _forMonth, _forYear);
    }
    
    /**
     * @dev Gas-optimized lease termination
     */
    function terminateLease(uint32 _leaseId) external {
        LeaseAgreement storage lease = leases[_leaseId];
        
        if (lease.leaseId == 0) revert("Lease does not exist");
        if (msg.sender != lease.landlord && msg.sender != lease.tenant) {
            revert("Not authorized");
        }
        if (lease.status != LeaseStatus.Active) revert("Lease not active");
        
        lease.status = LeaseStatus.Terminated;
        emit LeaseStatusChanged(_leaseId, LeaseStatus.Terminated);
    }
    
    /**
     * @dev Gas-optimized deposit return
     */
    function returnSecurityDeposit(uint32 _leaseId, uint128 _returnAmount) external nonReentrant {
        LeaseAgreement storage lease = leases[_leaseId];
        
        if (lease.leaseId == 0) revert("Lease does not exist");
        if (msg.sender != lease.landlord) revert("Only landlord can return");
        if (lease.status != LeaseStatus.Terminated && lease.status != LeaseStatus.Expired) {
            revert("Invalid lease status");
        }
        if (lease.depositReturned) revert("Deposit already returned");
        if (_returnAmount > lease.securityDeposit) revert("Return amount too high");
        
        lease.depositReturned = true;
        
        // Return deposit to tenant
        if (_returnAmount > 0) {
            paymentToken.safeTransfer(lease.tenant, _returnAmount);
        }
        
        // Keep remaining as landlord compensation
        uint128 keepAmount;
        unchecked {
            keepAmount = lease.securityDeposit - _returnAmount;
        }
        if (keepAmount > 0) {
            paymentToken.safeTransfer(lease.landlord, keepAmount);
        }
    }
    
    /**
     * @dev Gas-efficient lease cancellation
     */
    function cancelLease(uint32 _leaseId) external {
        LeaseAgreement storage lease = leases[_leaseId];
        
        if (lease.leaseId == 0) revert("Lease does not exist");
        if (msg.sender != lease.landlord) revert("Only landlord can cancel");
        if (lease.status != LeaseStatus.Pending) revert("Can only cancel pending");
        
        lease.status = LeaseStatus.Cancelled;
        emit LeaseStatusChanged(_leaseId, LeaseStatus.Cancelled);
    }
    
    /**
     * @dev Batch lease status update (gas efficient)
     */
    function updateExpiredLeases(uint32[] calldata _leaseIds) external {
        uint256 length = _leaseIds.length;
        uint64 currentTime = uint64(block.timestamp);
        
        for (uint256 i; i < length;) {
            uint32 leaseId = _leaseIds[i];
            LeaseAgreement storage lease = leases[leaseId];
            
            if (lease.status == LeaseStatus.Active && currentTime > lease.endDate) {
                lease.status = LeaseStatus.Expired;
                emit LeaseStatusChanged(leaseId, LeaseStatus.Expired);
            }
            
            unchecked { ++i; }
        }
    }
    
    /**
     * @dev Gas-efficient getter functions
     */
    function getLease(uint32 _leaseId) external view returns (LeaseAgreement memory) {
        LeaseAgreement memory lease = leases[_leaseId];
        if (lease.leaseId == 0) revert("Lease does not exist");
        return lease;
    }
    
    function getRentPayments(uint32 _leaseId) external view returns (RentPayment[] memory) {
        if (leases[_leaseId].leaseId == 0) revert("Lease does not exist");
        return rentPayments[_leaseId];
    }
    
    function getLandlordLeases(address _landlord) external view returns (uint32[] memory) {
        return landlordLeases[_landlord];
    }
    
    function getTenantLeases(address _tenant) external view returns (uint32[] memory) {
        return tenantLeases[_tenant];
    }
    
    function isLeaseExpired(uint32 _leaseId) external view returns (bool) {
        LeaseAgreement memory lease = leases[_leaseId];
        return lease.leaseId != 0 && block.timestamp > lease.endDate;
    }
}
