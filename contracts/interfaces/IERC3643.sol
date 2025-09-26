// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IIdentityRegistry.sol";
import "./ICompliance.sol";

/**
 * @title IERC3643
 * @dev Interface for ERC-3643 permissioned token standard
 * Extends ERC-20 with identity and compliance requirements
 */
interface IERC3643 is IERC20 {
    
    // Events
    event IdentityRegistryAdded(address indexed _identityRegistry);
    event ComplianceAdded(address indexed _compliance);
    event OnchainIDSet(address indexed _wallet, address indexed _onchainID);
    event ForcedTransfer(address indexed _from, address indexed _to, uint256 _amount);
    
    // Identity and Compliance Management
    function setOnchainID(address _onchainID) external;
    function setIdentityRegistry(address _identityRegistry) external;
    function setComplianceContract(address _compliance) external;
    
    // Forced transfer for compliance
    function forcedTransfer(address _from, address _to, uint256 _amount) external;
    
    // Getters
    function identityRegistry() external view returns (IIdentityRegistry);
    function compliance() external view returns (ICompliance);
    function onchainID(address _wallet) external view returns (address);
    
    // Transfer validation
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
}

