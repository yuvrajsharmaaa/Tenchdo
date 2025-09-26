// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICompliance
 * @dev Interface for compliance rules and transfer validation
 */
interface ICompliance {
    
    // Events
    event ComplianceRuleAdded(bytes32 indexed _ruleId);
    event ComplianceRuleRemoved(bytes32 indexed _ruleId);
    event AddressBlacklisted(address indexed _address);
    event AddressWhitelisted(address indexed _address);
    
    // Transfer validation
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
    
    // Compliance rules
    function addComplianceRule(bytes32 _ruleId) external;
    function removeComplianceRule(bytes32 _ruleId) external;
    function isComplianceRuleActive(bytes32 _ruleId) external view returns (bool);
    
    // Blacklist/Whitelist management
    function addToBlacklist(address _address) external;
    function removeFromBlacklist(address _address) external;
    function isBlacklisted(address _address) external view returns (bool);
    
    // Country restrictions
    function addCountryRestriction(uint16 _country) external;
    function removeCountryRestriction(uint16 _country) external;
    function isCountryRestricted(uint16 _country) external view returns (bool);
}

