// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IERC3643.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/ICompliance.sol";

/**
 * @title RealEstateTokenOptimized
 * @dev Ultra-optimized ERC-3643 compliant token for real estate tokenization
 * Gas-optimized with packed structs and efficient storage patterns
 */
contract RealEstateTokenOptimized is ERC20, IERC3643, Ownable, AccessControl {
    
    // Packed roles for gas efficiency
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // Core ERC-3643 components (immutable for gas savings)
    IIdentityRegistry public immutable identityRegistry;
    ICompliance public immutable compliance;
    
    // Packed onchain IDs mapping
    mapping(address => address) private _onchainIDs;
    
    // Gas-optimized property info (packed struct)
    struct PropertyInfo {
        uint128 totalValue;      // Sufficient for most property values
        uint128 totalShares;     // Sufficient for share counts
        bool isActive;           // Packed with other data
    }
    
    PropertyInfo public propertyInfo;
    
    // Property metadata (stored efficiently)
    string private _propertyAddress;
    string private _description;
    
    // Events (indexed for efficient filtering)
    event PropertyUpdated(uint128 indexed newValue, uint128 indexed newShares);
    
    // Gas-optimized modifiers
    modifier onlyAgent() {
        if (!hasRole(AGENT_ROLE, msg.sender) && owner() != msg.sender) {
            revert("Not authorized agent");
        }
        _;
    }
    
    modifier onlyCompliance() {
        if (!hasRole(COMPLIANCE_ROLE, msg.sender) && owner() != msg.sender) {
            revert("Not authorized compliance officer");
        }
        _;
    }
    
    modifier onlyCompliant(address _from, address _to, uint256 _amount) {
        if (!compliance.canTransfer(_from, _to, _amount)) {
            revert("Transfer not compliant");
        }
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _identityRegistry,
        address _compliance,
        string memory _propAddress,
        string memory _desc,
        uint128 _totalValue,
        uint128 _totalShares
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        if (_identityRegistry == address(0)) revert("Invalid identity registry");
        if (_compliance == address(0)) revert("Invalid compliance contract");
        if (_totalValue == 0) revert("Invalid property value");
        if (_totalShares == 0) revert("Invalid total shares");
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        compliance = ICompliance(_compliance);
        
        // Set property metadata
        _propertyAddress = _propAddress;
        _description = _desc;
        
        // Pack property info for gas efficiency
        propertyInfo = PropertyInfo({
            totalValue: _totalValue,
            totalShares: _totalShares,
            isActive: true
        });
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AGENT_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        emit IdentityRegistryAdded(_identityRegistry);
        emit ComplianceAdded(_compliance);
    }
    
    /**
     * @dev Gas-optimized onchain ID setter
     */
    function setOnchainID(address _onchainID) external override {
        if (_onchainID == address(0)) revert("Invalid onchain ID");
        _onchainIDs[msg.sender] = _onchainID;
        emit OnchainIDSet(msg.sender, _onchainID);
    }
    
    /**
     * @dev Get onchain ID (view function)
     */
    function onchainID(address _wallet) external view override returns (address) {
        return _onchainIDs[_wallet];
    }
    
    /**
     * @dev Immutable registry/compliance getters (gas efficient)
     */
    function setIdentityRegistry(address) external pure override {
        revert("Registry is immutable");
    }
    
    function setComplianceContract(address) external pure override {
        revert("Compliance is immutable");
    }
    
    /**
     * @dev Inline compliance check for gas efficiency
     */
    function canTransfer(address _from, address _to, uint256 _amount) 
        public 
        view 
        override 
        returns (bool) 
    {
        return compliance.canTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Ultra-optimized transfer with inline checks
     */
    function transfer(address _to, uint256 _amount) 
        public 
        override(ERC20, IERC20) 
        returns (bool) 
    {
        if (!compliance.canTransfer(msg.sender, _to, _amount)) {
            revert("Transfer not compliant");
        }
        return super.transfer(_to, _amount);
    }
    
    /**
     * @dev Ultra-optimized transferFrom
     */
    function transferFrom(address _from, address _to, uint256 _amount)
        public
        override(ERC20, IERC20)
        returns (bool)
    {
        if (!compliance.canTransfer(_from, _to, _amount)) {
            revert("Transfer not compliant");
        }
        _spendAllowance(_from, _msgSender(), _amount);
        _transfer(_from, _to, _amount);
        return true;
    }
    
    /**
     * @dev Gas-optimized forced transfer
     */
    function forcedTransfer(address _from, address _to, uint256 _amount) 
        external 
        override 
        onlyCompliance 
    {
        if (_from == address(0) || _to == address(0) || _amount == 0) {
            revert("Invalid parameters");
        }
        if (balanceOf(_from) < _amount) {
            revert("Insufficient balance");
        }
        
        _transfer(_from, _to, _amount);
        emit ForcedTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Gas-optimized minting
     */
    function mint(address _to, uint256 _amount) external onlyAgent {
        if (_to == address(0) || _amount == 0) revert("Invalid parameters");
        if (!identityRegistry.isVerified(_to)) revert("Recipient not verified");
        if (!compliance.canTransfer(address(0), _to, _amount)) revert("Mint not compliant");
        
        _mint(_to, _amount);
    }
    
    /**
     * @dev Gas-optimized burning
     */
    function burn(address _from, uint256 _amount) external onlyAgent {
        if (_from == address(0) || _amount == 0) revert("Invalid parameters");
        if (balanceOf(_from) < _amount) revert("Insufficient balance");
        
        _burn(_from, _amount);
    }
    
    /**
     * @dev Update property info (gas-optimized)
     */
    function updatePropertyInfo(uint128 _newValue, uint128 _newShares) external onlyOwner {
        if (_newValue == 0 || _newShares == 0) revert("Invalid values");
        
        propertyInfo.totalValue = _newValue;
        propertyInfo.totalShares = _newShares;
        
        emit PropertyUpdated(_newValue, _newShares);
    }
    
    /**
     * @dev Gas-efficient value calculation
     */
    function getValuePerToken() external view returns (uint256) {
        PropertyInfo memory info = propertyInfo;
        return info.totalShares == 0 ? 0 : uint256(info.totalValue) * 1e18 / info.totalShares;
    }
    
    /**
     * @dev Property address getter
     */
    function getPropertyAddress() external view returns (string memory) {
        return _propertyAddress;
    }
    
    /**
     * @dev Description getter
     */
    function getDescription() external view returns (string memory) {
        return _description;
    }
    
    /**
     * @dev Get total property value
     */
    function getTotalPropertyValue() external view returns (uint256) {
        return propertyInfo.totalValue;
    }
    
    /**
     * @dev Ultra-optimized update hook
     */
    function _update(address from, address to, uint256 amount) 
        internal 
        override 
    {
        super._update(from, to, amount);
        
        // Only call if compliance supports holder tracking
        if (address(compliance) != address(0)) {
            try compliance.updateHolderCount(from, to, amount) {
                // Success - holder count updated
            } catch {
                // Compliance doesn't support holder tracking - continue
            }
        }
    }
}
