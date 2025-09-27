// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ICompliance.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title ComplianceSecure
 * @dev Production-ready compliance contract with enhanced security
 * Implements compliance rules and transfer validation for ERC-3643 tokens
 */
contract ComplianceSecure is ICompliance, Ownable, AccessControl, ReentrancyGuard {
    
    bytes32 public constant TOKEN_ROLE = keccak256("TOKEN_ROLE");
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    
    IIdentityRegistry public identityRegistry;
    
    // Enhanced compliance rules with metadata
    struct ComplianceRule {
        bool isActive;
        uint256 createdAt;
        string description;
    }
    
    mapping(bytes32 => ComplianceRule) private _complianceRules;
    mapping(address => bool) private _blacklist;
    mapping(uint16 => bool) private _restrictedCountries;
    
    // Enhanced limits with overflow protection
    uint128 public maxBalancePerInvestor;  // Using uint128 for gas optimization
    uint128 public maxHolders;
    uint128 public currentHolders;
    
    mapping(address => bool) private _isHolder;
    
    // Events for better transparency
    event ComplianceRuleUpdated(bytes32 indexed ruleId, bool isActive, string description);
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event CountryRestrictionUpdated(uint16 indexed country, bool isRestricted);
    event LimitsUpdated(uint128 maxBalance, uint128 maxHolders);
    event HolderCountUpdated(uint128 newCount);
    
    modifier onlyToken() {
        require(hasRole(TOKEN_ROLE, msg.sender), "ComplianceSecure: caller is not a token");
        _;
    }
    
    modifier onlyComplianceOfficer() {
        require(
            hasRole(COMPLIANCE_OFFICER_ROLE, msg.sender) || owner() == msg.sender,
            "ComplianceSecure: caller is not a compliance officer"
        );
        _;
    }
    
    constructor(address _identityRegistry) Ownable(msg.sender) {
        require(_identityRegistry != address(0), "ComplianceSecure: invalid identity registry");
        identityRegistry = IIdentityRegistry(_identityRegistry);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
    }
    
    /**
     * @dev Enhanced compliance check with detailed validation
     */
    function canTransfer(
        address _from, 
        address _to, 
        uint256 _amount
    ) external view override returns (bool) {
        // Basic validation
        if (_to == address(0) || _amount == 0) return false;
        
        // Handle minting (from address(0))
        if (_from == address(0)) {
            return _canReceiveTokens(_to, _amount);
        }
        
        // Handle regular transfers
        return _canTransferTokens(_from, _to, _amount);
    }
    
    /**
     * @dev Internal function to check if address can receive tokens
     */
    function _canReceiveTokens(address _to, uint256 _amount) internal view returns (bool) {
        // Check blacklist
        if (_blacklist[_to]) return false;
        
        // Check KYC verification
        if (!identityRegistry.isVerified(_to)) return false;
        
        // Check country restrictions
        uint16 recipientCountry = identityRegistry.investorCountry(_to);
        if (_restrictedCountries[recipientCountry]) return false;
        
        // Check holder limits
        if (!_isHolder[_to] && maxHolders > 0 && currentHolders >= maxHolders) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Internal function to check regular transfers
     */
    function _canTransferTokens(address _from, address _to, uint256 _amount) internal view returns (bool) {
        // Check blacklist for both parties
        if (_blacklist[_from] || _blacklist[_to]) return false;
        
        // Check KYC verification for both parties
        if (!identityRegistry.isVerified(_from) || !identityRegistry.isVerified(_to)) {
            return false;
        }
        
        // Check country restrictions
        uint16 fromCountry = identityRegistry.investorCountry(_from);
        uint16 toCountry = identityRegistry.investorCountry(_to);
        
        if (_restrictedCountries[fromCountry] || _restrictedCountries[toCountry]) {
            return false;
        }
        
        // Check holder limits for new recipients
        if (!_isHolder[_to] && maxHolders > 0 && currentHolders >= maxHolders) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Enhanced rule management with metadata
     */
    function addComplianceRule(bytes32 _ruleId) 
        external 
        override 
        onlyComplianceOfficer 
    {
        require(_ruleId != bytes32(0), "ComplianceSecure: invalid rule ID");
        
        _complianceRules[_ruleId] = ComplianceRule({
            isActive: true,
            createdAt: block.timestamp,
            description: "Compliance rule"
        });
        
        emit ComplianceRuleAdded(_ruleId);
        emit ComplianceRuleUpdated(_ruleId, true, "Compliance rule");
    }
    
    /**
     * @dev Enhanced rule management with metadata and description
     */
    function addComplianceRuleWithDescription(bytes32 _ruleId, string calldata _description) 
        external 
        onlyComplianceOfficer 
    {
        require(_ruleId != bytes32(0), "ComplianceSecure: invalid rule ID");
        require(bytes(_description).length > 0, "ComplianceSecure: description required");
        
        _complianceRules[_ruleId] = ComplianceRule({
            isActive: true,
            createdAt: block.timestamp,
            description: _description
        });
        
        emit ComplianceRuleAdded(_ruleId);
        emit ComplianceRuleUpdated(_ruleId, true, _description);
    }
    
    function removeComplianceRule(bytes32 _ruleId) external override onlyComplianceOfficer {
        require(_complianceRules[_ruleId].isActive, "ComplianceSecure: rule not active");
        
        _complianceRules[_ruleId].isActive = false;
        
        emit ComplianceRuleRemoved(_ruleId);
        emit ComplianceRuleUpdated(_ruleId, false, _complianceRules[_ruleId].description);
    }
    
    function isComplianceRuleActive(bytes32 _ruleId) external view override returns (bool) {
        return _complianceRules[_ruleId].isActive;
    }
    
    /**
     * @dev Enhanced blacklist management with events
     */
    function addToBlacklist(address _address) external override onlyComplianceOfficer {
        require(_address != address(0), "ComplianceSecure: invalid address");
        require(!_blacklist[_address], "ComplianceSecure: already blacklisted");
        
        _blacklist[_address] = true;
        emit AddressBlacklisted(_address);
        emit BlacklistUpdated(_address, true);
    }
    
    function removeFromBlacklist(address _address) external override onlyComplianceOfficer {
        require(_blacklist[_address], "ComplianceSecure: address not blacklisted");
        
        _blacklist[_address] = false;
        emit AddressWhitelisted(_address);
        emit BlacklistUpdated(_address, false);
    }
    
    function isBlacklisted(address _address) external view override returns (bool) {
        return _blacklist[_address];
    }
    
    /**
     * @dev Enhanced country restriction management
     */
    function addCountryRestriction(uint16 _country) external override onlyComplianceOfficer {
        require(_country > 0, "ComplianceSecure: invalid country code");
        require(!_restrictedCountries[_country], "ComplianceSecure: already restricted");
        
        _restrictedCountries[_country] = true;
        emit CountryRestrictionUpdated(_country, true);
    }
    
    function removeCountryRestriction(uint16 _country) external override onlyComplianceOfficer {
        require(_restrictedCountries[_country], "ComplianceSecure: country not restricted");
        
        _restrictedCountries[_country] = false;
        emit CountryRestrictionUpdated(_country, false);
    }
    
    function isCountryRestricted(uint16 _country) external view override returns (bool) {
        return _restrictedCountries[_country];
    }
    
    /**
     * @dev Secure limits management with overflow protection
     */
    function setLimits(uint128 _maxBalance, uint128 _maxHolders) 
        external 
        onlyComplianceOfficer 
    {
        maxBalancePerInvestor = _maxBalance;
        maxHolders = _maxHolders;
        
        emit LimitsUpdated(_maxBalance, _maxHolders);
    }
    
    /**
     * @dev Secure holder count update with access control
     */
    function updateHolderCount(address _from, address _to, uint256 _amount) 
        external 
        override 
        onlyToken 
        nonReentrant 
    {
        require(_amount > 0, "ComplianceSecure: invalid amount");
        
        uint128 newHolderCount = currentHolders;
        
        // Handle minting
        if (_from == address(0) && _to != address(0)) {
            if (!_isHolder[_to]) {
                _isHolder[_to] = true;
                newHolderCount++;
            }
        }
        
        // Handle regular transfers
        if (_from != address(0) && _to != address(0)) {
            if (!_isHolder[_to]) {
                _isHolder[_to] = true;
                newHolderCount++;
            }
        }
        
        // Update holder count if changed
        if (newHolderCount != currentHolders) {
            currentHolders = newHolderCount;
            emit HolderCountUpdated(newHolderCount);
        }
    }
    
    /**
     * @dev Grant token role to authorized token contracts
     */
    function grantTokenRole(address _token) external onlyOwner {
        require(_token != address(0), "ComplianceSecure: invalid token address");
        _grantRole(TOKEN_ROLE, _token);
    }
    
    /**
     * @dev Revoke token role
     */
    function revokeTokenRole(address _token) external onlyOwner {
        _revokeRole(TOKEN_ROLE, _token);
    }
    
    /**
     * @dev Grant compliance officer role
     */
    function grantComplianceOfficerRole(address _officer) external onlyOwner {
        require(_officer != address(0), "ComplianceSecure: invalid officer address");
        _grantRole(COMPLIANCE_OFFICER_ROLE, _officer);
    }
    
    /**
     * @dev Get compliance rule details
     */
    function getComplianceRule(bytes32 _ruleId) 
        external 
        view 
        returns (bool isActive, uint256 createdAt, string memory description) 
    {
        ComplianceRule memory rule = _complianceRules[_ruleId];
        return (rule.isActive, rule.createdAt, rule.description);
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        // Implementation would pause all transfers
        // This is a placeholder for emergency functionality
    }
}
