// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICompliance.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title Compliance
 * @dev Implements compliance rules and transfer validation for ERC-3643 tokens
 * Handles KYC/AML requirements, country restrictions, and blacklists
 */
contract Compliance is ICompliance, Ownable {
    
    // Reference to the identity registry
    IIdentityRegistry public identityRegistry;
    
    // Active compliance rules
    mapping(bytes32 => bool) private _complianceRules;
    
    // Blacklisted addresses
    mapping(address => bool) private _blacklist;
    
    // Restricted countries (ISO 3166-1 numeric codes)
    mapping(uint16 => bool) private _restrictedCountries;
    
    // Maximum token balance per investor (0 = no limit)
    uint256 public maxBalancePerInvestor;
    
    // Maximum number of token holders (0 = no limit)
    uint256 public maxHolders;
    
    // Current number of token holders
    uint256 public currentHolders;
    
    // Track if address is a token holder
    mapping(address => bool) private _isHolder;
    
    constructor(address _identityRegistry) Ownable(msg.sender) {
        require(_identityRegistry != address(0), "Invalid identity registry");
        identityRegistry = IIdentityRegistry(_identityRegistry);
    }
    
    /**
     * @dev Check if a transfer is compliant with all rules
     * @param _from Sender address
     * @param _to Recipient address
     * @param _amount Transfer amount
     * @return True if transfer is allowed
     */
    function canTransfer(
        address _from, 
        address _to, 
        uint256 _amount
    ) external view override returns (bool) {
        // Check basic requirements
        if (_to == address(0) || _amount == 0) {
            return false;
        }
        
        // Allow minting from address(0) - this is for token creation
        if (_from == address(0)) {
            // For minting, only check recipient
            if (_blacklist[_to]) {
                return false;
            }
            if (!identityRegistry.isVerified(_to)) {
                return false;
            }
            uint16 recipientCountry = identityRegistry.investorCountry(_to);
            if (_restrictedCountries[recipientCountry]) {
                return false;
            }
            // Check holder limits for new investors
            if (!_isHolder[_to] && maxHolders > 0 && currentHolders >= maxHolders) {
                return false;
            }
            return true;
        }
        
        // Check blacklist
        if (_blacklist[_from] || _blacklist[_to]) {
            return false;
        }
        
        // Check identity verification
        if (!identityRegistry.isVerified(_from) || !identityRegistry.isVerified(_to)) {
            return false;
        }
        
        // Check country restrictions
        uint16 fromCountry = identityRegistry.investorCountry(_from);
        uint16 toCountry = identityRegistry.investorCountry(_to);
        
        if (_restrictedCountries[fromCountry] || _restrictedCountries[toCountry]) {
            return false;
        }
        
        // Check holder limits for new investors
        if (!_isHolder[_to] && maxHolders > 0 && currentHolders >= maxHolders) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Add a compliance rule
     * @param _ruleId Unique identifier for the rule
     */
    function addComplianceRule(bytes32 _ruleId) external override onlyOwner {
        require(_ruleId != bytes32(0), "Invalid rule ID");
        _complianceRules[_ruleId] = true;
        emit ComplianceRuleAdded(_ruleId);
    }
    
    /**
     * @dev Remove a compliance rule
     * @param _ruleId Rule identifier to remove
     */
    function removeComplianceRule(bytes32 _ruleId) external override onlyOwner {
        require(_complianceRules[_ruleId], "Rule not active");
        _complianceRules[_ruleId] = false;
        emit ComplianceRuleRemoved(_ruleId);
    }
    
    /**
     * @dev Check if a compliance rule is active
     * @param _ruleId Rule identifier to check
     * @return True if rule is active
     */
    function isComplianceRuleActive(bytes32 _ruleId) external view override returns (bool) {
        return _complianceRules[_ruleId];
    }
    
    /**
     * @dev Add address to blacklist
     * @param _address Address to blacklist
     */
    function addToBlacklist(address _address) external override onlyOwner {
        require(_address != address(0), "Invalid address");
        _blacklist[_address] = true;
        emit AddressBlacklisted(_address);
    }
    
    /**
     * @dev Remove address from blacklist
     * @param _address Address to remove from blacklist
     */
    function removeFromBlacklist(address _address) external override onlyOwner {
        require(_blacklist[_address], "Address not blacklisted");
        _blacklist[_address] = false;
        emit AddressWhitelisted(_address);
    }
    
    /**
     * @dev Check if address is blacklisted
     * @param _address Address to check
     * @return True if address is blacklisted
     */
    function isBlacklisted(address _address) external view override returns (bool) {
        return _blacklist[_address];
    }
    
    /**
     * @dev Add country restriction
     * @param _country Country code to restrict (ISO 3166-1 numeric)
     */
    function addCountryRestriction(uint16 _country) external override onlyOwner {
        require(_country > 0, "Invalid country code");
        _restrictedCountries[_country] = true;
    }
    
    /**
     * @dev Remove country restriction
     * @param _country Country code to allow
     */
    function removeCountryRestriction(uint16 _country) external override onlyOwner {
        require(_restrictedCountries[_country], "Country not restricted");
        _restrictedCountries[_country] = false;
    }
    
    /**
     * @dev Check if country is restricted
     * @param _country Country code to check
     * @return True if country is restricted
     */
    function isCountryRestricted(uint16 _country) external view override returns (bool) {
        return _restrictedCountries[_country];
    }
    
    /**
     * @dev Set maximum balance per investor
     * @param _maxBalance Maximum balance (0 = no limit)
     */
    function setMaxBalancePerInvestor(uint256 _maxBalance) external onlyOwner {
        maxBalancePerInvestor = _maxBalance;
    }
    
    /**
     * @dev Set maximum number of token holders
     * @param _maxHolders Maximum holders (0 = no limit)
     */
    function setMaxHolders(uint256 _maxHolders) external onlyOwner {
        maxHolders = _maxHolders;
    }
    
    /**
     * @dev Update holder count (called by token contract)
     * @param _from Address sending tokens (address(0) for minting)
     * @param _to Address receiving tokens (address(0) for burning)
     * @param _amount Amount being transferred
     */
    function updateHolderCount(address _from, address _to, uint256 _amount) external override {
        // This should be called by the token contract
        // In production, add proper access control
        
        // Handle minting (from == address(0))
        if (_from == address(0) && _to != address(0) && _amount > 0) {
            if (!_isHolder[_to]) {
                _isHolder[_to] = true;
                currentHolders++;
            }
        }
        
        // Handle burning (to == address(0))
        if (_to == address(0) && _from != address(0) && _amount > 0) {
            // Check if holder has any remaining balance after burn
            // This would need to be called after the burn transaction
        }
        
        // Handle regular transfers
        if (_from != address(0) && _to != address(0) && _amount > 0) {
            if (!_isHolder[_to]) {
                _isHolder[_to] = true;
                currentHolders++;
            }
        }
    }
}

