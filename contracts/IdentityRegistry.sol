// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title IdentityRegistry
 * @dev Manages verified identities and KYC status for token holders
 * Core component of ERC-3643 compliance framework
 */
contract IdentityRegistry is IIdentityRegistry, Ownable {
    
    // Mapping from wallet address to onchain identity contract
    mapping(address => address) private _identities;
    
    // Mapping from wallet address to country code (ISO 3166-1 numeric)
    mapping(address => uint16) private _countries;
    
    // Set of registered wallet addresses for efficient lookup
    mapping(address => bool) private _registered;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new identity for KYC compliance
     * @param _wallet The wallet address to register
     * @param _onchainID The onchain identity contract address
     * @param _country The country code (ISO 3166-1 numeric)
     */
    function registerIdentity(
        address _wallet, 
        address _onchainID, 
        uint16 _country
    ) external override onlyOwner {
        require(_wallet != address(0), "Invalid wallet address");
        require(_onchainID != address(0), "Invalid onchain ID");
        require(_country > 0, "Invalid country code");
        
        _identities[_wallet] = _onchainID;
        _countries[_wallet] = _country;
        _registered[_wallet] = true;
        
        emit IdentityRegistered(_wallet, _onchainID);
    }
    
    /**
     * @dev Remove an identity from the registry
     * @param _wallet The wallet address to remove
     */
    function removeIdentity(address _wallet) external override onlyOwner {
        require(_registered[_wallet], "Identity not registered");
        
        delete _identities[_wallet];
        delete _countries[_wallet];
        delete _registered[_wallet];
        
        emit IdentityRemoved(_wallet);
    }
    
    /**
     * @dev Update the country for a registered identity
     * @param _wallet The wallet address
     * @param _country The new country code
     */
    function updateCountry(address _wallet, uint16 _country) external override onlyOwner {
        require(_registered[_wallet], "Identity not registered");
        require(_country > 0, "Invalid country code");
        
        _countries[_wallet] = _country;
        emit CountryUpdated(_wallet, _country);
    }
    
    /**
     * @dev Check if a wallet has a verified identity
     * @param _wallet The wallet address to check
     * @return True if the wallet is verified
     */
    function isVerified(address _wallet) external view override returns (bool) {
        return _registered[_wallet] && _identities[_wallet] != address(0);
    }
    
    /**
     * @dev Get the onchain identity for a wallet
     * @param _wallet The wallet address
     * @return The onchain identity contract address
     */
    function identity(address _wallet) external view override returns (address) {
        return _identities[_wallet];
    }
    
    /**
     * @dev Get the country code for a wallet
     * @param _wallet The wallet address
     * @return The country code (ISO 3166-1 numeric)
     */
    function investorCountry(address _wallet) external view override returns (uint16) {
        return _countries[_wallet];
    }
    
    /**
     * @dev Check if a wallet is registered in the identity registry
     * @param _wallet The wallet address to check
     * @return True if the wallet is registered
     */
    function contains(address _wallet) external view override returns (bool) {
        return _registered[_wallet];
    }
}

