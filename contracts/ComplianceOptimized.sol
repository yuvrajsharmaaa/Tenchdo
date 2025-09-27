// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ICompliance.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title ComplianceOptimized
 * @dev Ultra-optimized compliance contract with packed storage and gas-efficient checks
 * Implements ERC-3643 compliance rules with maximum efficiency
 */
contract ComplianceOptimized is ICompliance, Ownable {
    
    // Immutable identity registry for gas savings
    IIdentityRegistry public immutable identityRegistry;
    
    // Packed compliance storage for gas efficiency
    struct ComplianceData {
        uint128 maxBalancePerInvestor;  // Sufficient for most use cases
        uint128 maxHolders;            // Sufficient for holder counts
        uint64 currentHolders;         // Packed with other data
        bool initialized;              // Track initialization
    }
    
    ComplianceData public complianceData;
    
    // Gas-optimized mappings
    mapping(bytes32 => bool) private _complianceRules;
    mapping(address => bool) private _blacklist;
    mapping(uint16 => bool) private _restrictedCountries;
    mapping(address => bool) private _isHolder;
    
    // Immutable token contract (set once for gas efficiency)
    address public immutable tokenContract;
    
    // Events with indexed parameters for efficient filtering
    event ComplianceRuleUpdated(bytes32 indexed ruleId, bool indexed active);
    event AddressBlacklistUpdated(address indexed addr, bool indexed blacklisted);
    event CountryRestrictionUpdated(uint16 indexed country, bool indexed restricted);
    event HolderLimitsUpdated(uint128 maxBalance, uint128 maxHolders);
    
    constructor(address _identityRegistry, address _tokenContract) Ownable(msg.sender) {
        if (_identityRegistry == address(0)) revert("Invalid identity registry");
        if (_tokenContract == address(0)) revert("Invalid token contract");
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        tokenContract = _tokenContract;
        
        // Initialize with sensible defaults
        complianceData = ComplianceData({
            maxBalancePerInvestor: type(uint128).max, // No limit by default
            maxHolders: type(uint128).max,            // No limit by default
            currentHolders: 0,
            initialized: true
        });
    }
    
    /**
     * @dev Ultra-optimized compliance check with early returns
     */
    function canTransfer(address _from, address _to, uint256 _amount) 
        external 
        view 
        override 
        returns (bool) 
    {
        // Early validation checks
        if (_to == address(0) || _amount == 0) return false;
        
        // Handle minting case (from == address(0))
        if (_from == address(0)) {
            return _canMint(_to);
        }
        
        // Regular transfer checks
        return _canRegularTransfer(_from, _to);
    }
    
    /**
     * @dev Gas-optimized minting check
     */
    function _canMint(address _to) private view returns (bool) {
        // Check blacklist first (cheapest check)
        if (_blacklist[_to]) return false;
        
        // Check verification
        if (!identityRegistry.isVerified(_to)) return false;
        
        // Check country restrictions
        uint16 country = identityRegistry.investorCountry(_to);
        if (_restrictedCountries[country]) return false;
        
        // Check holder limits only if not already a holder
        ComplianceData memory data = complianceData;
        if (!_isHolder[_to] && data.currentHolders >= data.maxHolders) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Gas-optimized regular transfer check
     */
    function _canRegularTransfer(address _from, address _to) private view returns (bool) {
        // Check blacklist for both parties
        if (_blacklist[_from] || _blacklist[_to]) return false;
        
        // Check verification for both parties
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
        ComplianceData memory data = complianceData;
        if (!_isHolder[_to] && data.currentHolders >= data.maxHolders) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Ultra-optimized holder count update
     */
    function updateHolderCount(address _from, address _to, uint256 _amount) external override {
        if (msg.sender != tokenContract) revert("Only token contract");
        
        // Update recipient holder status
        if (_to != address(0) && !_isHolder[_to] && _amount > 0) {
            _isHolder[_to] = true;
            unchecked {
                ++complianceData.currentHolders;
            }
        }
        
        // Update sender holder status if balance becomes 0
        if (_from != address(0) && _isHolder[_from]) {
            try IERC20(tokenContract).balanceOf(_from) returns (uint256 balance) {
                if (balance == 0) {
                    _isHolder[_from] = false;
                    unchecked {
                        --complianceData.currentHolders;
                    }
                }
            } catch {
                // Balance check failed - don't update holder status
            }
        }
    }
    
    /**
     * @dev Gas-optimized compliance rule management
     */
    function addComplianceRule(bytes32 _ruleId) external override onlyOwner {
        if (_ruleId == bytes32(0)) revert("Invalid rule ID");
        _complianceRules[_ruleId] = true;
        emit ComplianceRuleUpdated(_ruleId, true);
    }
    
    function removeComplianceRule(bytes32 _ruleId) external override onlyOwner {
        if (!_complianceRules[_ruleId]) revert("Rule not active");
        _complianceRules[_ruleId] = false;
        emit ComplianceRuleUpdated(_ruleId, false);
    }
    
    function isComplianceRuleActive(bytes32 _ruleId) external view override returns (bool) {
        return _complianceRules[_ruleId];
    }
    
    /**
     * @dev Gas-optimized blacklist management
     */
    function addToBlacklist(address _addr) external override onlyOwner {
        if (_addr == address(0)) revert("Invalid address");
        _blacklist[_addr] = true;
        emit AddressBlacklistUpdated(_addr, true);
    }
    
    function removeFromBlacklist(address _addr) external override onlyOwner {
        if (!_blacklist[_addr]) revert("Address not blacklisted");
        _blacklist[_addr] = false;
        emit AddressBlacklistUpdated(_addr, false);
    }
    
    function isBlacklisted(address _addr) external view override returns (bool) {
        return _blacklist[_addr];
    }
    
    /**
     * @dev Gas-optimized country restriction management
     */
    function addCountryRestriction(uint16 _country) external override onlyOwner {
        if (_country == 0) revert("Invalid country code");
        _restrictedCountries[_country] = true;
        emit CountryRestrictionUpdated(_country, true);
    }
    
    function removeCountryRestriction(uint16 _country) external override onlyOwner {
        if (!_restrictedCountries[_country]) revert("Country not restricted");
        _restrictedCountries[_country] = false;
        emit CountryRestrictionUpdated(_country, false);
    }
    
    function isCountryRestricted(uint16 _country) external view override returns (bool) {
        return _restrictedCountries[_country];
    }
    
    /**
     * @dev Gas-optimized limit management
     */
    function setLimits(uint128 _maxBalance, uint128 _maxHolders) external onlyOwner {
        complianceData.maxBalancePerInvestor = _maxBalance;
        complianceData.maxHolders = _maxHolders;
        emit HolderLimitsUpdated(_maxBalance, _maxHolders);
    }
    
    /**
     * @dev View functions for limits
     */
    function getMaxBalancePerInvestor() external view returns (uint128) {
        return complianceData.maxBalancePerInvestor;
    }
    
    function getMaxHolders() external view returns (uint128) {
        return complianceData.maxHolders;
    }
    
    function getCurrentHolders() external view returns (uint64) {
        return complianceData.currentHolders;
    }
    
    function isHolder(address _addr) external view returns (bool) {
        return _isHolder[_addr];
    }
}
