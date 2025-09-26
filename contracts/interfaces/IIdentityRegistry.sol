// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IIdentityRegistry
 * @dev Interface for managing verified identities and KYC status
 */
interface IIdentityRegistry {
    
    // Events
    event IdentityRegistered(address indexed _wallet, address indexed _onchainID);
    event IdentityRemoved(address indexed _wallet);
    event CountryUpdated(address indexed _wallet, uint16 _country);
    
    // Identity management
    function registerIdentity(address _wallet, address _onchainID, uint16 _country) external;
    function removeIdentity(address _wallet) external;
    function updateCountry(address _wallet, uint16 _country) external;
    
    // Getters
    function isVerified(address _wallet) external view returns (bool);
    function identity(address _wallet) external view returns (address);
    function investorCountry(address _wallet) external view returns (uint16);
    function contains(address _wallet) external view returns (bool);
}

