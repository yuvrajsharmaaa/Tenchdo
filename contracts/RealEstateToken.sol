// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IERC3643.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/ICompliance.sol";

/**
 * @title RealEstateToken
 * @dev ERC-3643 compliant token for real estate tokenization
 * Implements permissioned transfers with KYC/AML compliance
 */
contract RealEstateToken is ERC20, IERC3643, Ownable, AccessControl {
    
    // Roles for access control
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // Core ERC-3643 components
    IIdentityRegistry public override identityRegistry;
    ICompliance public override compliance;
    
    // Mapping from wallet to onchain ID
    mapping(address => address) private _onchainIDs;
    
    // Token metadata
    string private _tokenName;
    string private _tokenSymbol;
    uint8 private _tokenDecimals;
    
    // Property details
    struct PropertyInfo {
        string propertyAddress;
        uint256 totalValue;
        uint256 totalShares;
        string description;
        bool isActive;
    }
    
    PropertyInfo public propertyInfo;
    
    // Modifiers
    modifier onlyAgent() {
        require(hasRole(AGENT_ROLE, msg.sender) || owner() == msg.sender, "Not authorized agent");
        _;
    }
    
    modifier onlyCompliance() {
        require(hasRole(COMPLIANCE_ROLE, msg.sender) || owner() == msg.sender, "Not authorized compliance officer");
        _;
    }
    
    modifier compliantTransfer(address _from, address _to, uint256 _amount) {
        require(canTransfer(_from, _to, _amount), "Transfer not compliant");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _identityRegistry,
        address _compliance,
        PropertyInfo memory _propertyInfo
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(_identityRegistry != address(0), "Invalid identity registry");
        require(_compliance != address(0), "Invalid compliance contract");
        require(bytes(_propertyInfo.propertyAddress).length > 0, "Invalid property address");
        require(_propertyInfo.totalValue > 0, "Invalid property value");
        require(_propertyInfo.totalShares > 0, "Invalid total shares");
        
        _tokenName = _name;
        _tokenSymbol = _symbol;
        _tokenDecimals = _decimals;
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        compliance = ICompliance(_compliance);
        propertyInfo = _propertyInfo;
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AGENT_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        emit IdentityRegistryAdded(_identityRegistry);
        emit ComplianceAdded(_compliance);
    }
    
    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }
    
    /**
     * @dev Set onchain ID for a wallet
     * @param _onchainID The onchain identity contract address
     */
    function setOnchainID(address _onchainID) external override {
        require(_onchainID != address(0), "Invalid onchain ID");
        _onchainIDs[msg.sender] = _onchainID;
        emit OnchainIDSet(msg.sender, _onchainID);
    }
    
    /**
     * @dev Set identity registry (admin only)
     * @param _identityRegistry New identity registry address
     */
    function setIdentityRegistry(address _identityRegistry) external override onlyOwner {
        require(_identityRegistry != address(0), "Invalid identity registry");
        identityRegistry = IIdentityRegistry(_identityRegistry);
        emit IdentityRegistryAdded(_identityRegistry);
    }
    
    /**
     * @dev Set compliance contract (admin only)
     * @param _compliance New compliance contract address
     */
    function setComplianceContract(address _compliance) external override onlyOwner {
        require(_compliance != address(0), "Invalid compliance contract");
        compliance = ICompliance(_compliance);
        emit ComplianceAdded(_compliance);
    }
    
    /**
     * @dev Get onchain ID for a wallet
     * @param _wallet Wallet address
     * @return Onchain ID address
     */
    function onchainID(address _wallet) external view override returns (address) {
        return _onchainIDs[_wallet];
    }
    
    /**
     * @dev Check if transfer is compliant
     * @param _from Sender address
     * @param _to Recipient address
     * @param _amount Transfer amount
     * @return True if transfer is allowed
     */
    function canTransfer(
        address _from, 
        address _to, 
        uint256 _amount
    ) public view override returns (bool) {
        return compliance.canTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Forced transfer by compliance officer
     * @param _from Sender address
     * @param _to Recipient address
     * @param _amount Transfer amount
     */
    function forcedTransfer(
        address _from, 
        address _to, 
        uint256 _amount
    ) external override onlyCompliance {
        require(_from != address(0), "Invalid from address");
        require(_to != address(0), "Invalid to address");
        require(_amount > 0, "Invalid amount");
        require(balanceOf(_from) >= _amount, "Insufficient balance");
        
        _transfer(_from, _to, _amount);
        emit ForcedTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Override transfer to include compliance checks
     */
    function transfer(
        address _to, 
        uint256 _amount
    ) public override(ERC20, IERC20) compliantTransfer(msg.sender, _to, _amount) returns (bool) {
        return super.transfer(_to, _amount);
    }
    
    /**
     * @dev Override transferFrom to include compliance checks
     */
    function transferFrom(
        address _from, 
        address _to, 
        uint256 _amount
    ) public override(ERC20, IERC20) compliantTransfer(_from, _to, _amount) returns (bool) {
        return super.transferFrom(_from, _to, _amount);
    }
    
    /**
     * @dev Mint tokens (agent only)
     * @param _to Recipient address
     * @param _amount Amount to mint
     */
    function mint(address _to, uint256 _amount) external onlyAgent {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Invalid amount");
        require(identityRegistry.isVerified(_to), "Recipient not verified");
        require(canTransfer(address(0), _to, _amount), "Mint not compliant");
        
        _mint(_to, _amount);
    }
    
    /**
     * @dev Burn tokens (agent only)
     * @param _from Address to burn from
     * @param _amount Amount to burn
     */
    function burn(address _from, uint256 _amount) external onlyAgent {
        require(_from != address(0), "Invalid address");
        require(_amount > 0, "Invalid amount");
        require(balanceOf(_from) >= _amount, "Insufficient balance");
        
        _burn(_from, _amount);
    }
    
    /**
     * @dev Update property information (admin only)
     * @param _propertyInfo New property information
     */
    function updatePropertyInfo(PropertyInfo memory _propertyInfo) external onlyOwner {
        require(bytes(_propertyInfo.propertyAddress).length > 0, "Invalid property address");
        require(_propertyInfo.totalValue > 0, "Invalid property value");
        require(_propertyInfo.totalShares > 0, "Invalid total shares");
        
        propertyInfo = _propertyInfo;
    }
    
    /**
     * @dev Add agent role
     * @param _agent Address to grant agent role
     */
    function addAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        _grantRole(AGENT_ROLE, _agent);
    }
    
    /**
     * @dev Remove agent role
     * @param _agent Address to revoke agent role
     */
    function removeAgent(address _agent) external onlyOwner {
        _revokeRole(AGENT_ROLE, _agent);
    }
    
    /**
     * @dev Add compliance officer role
     * @param _officer Address to grant compliance role
     */
    function addComplianceOfficer(address _officer) external onlyOwner {
        require(_officer != address(0), "Invalid officer address");
        _grantRole(COMPLIANCE_ROLE, _officer);
    }
    
    /**
     * @dev Remove compliance officer role
     * @param _officer Address to revoke compliance role
     */
    function removeComplianceOfficer(address _officer) external onlyOwner {
        _revokeRole(COMPLIANCE_ROLE, _officer);
    }
    
    /**
     * @dev Get property value per token
     * @return Value per token in wei
     */
    function getValuePerToken() external view returns (uint256) {
        if (propertyInfo.totalShares == 0) return 0;
        return propertyInfo.totalValue / propertyInfo.totalShares;
    }
    
    /**
     * @dev Get total property value
     * @return Total property value in wei
     */
    function getTotalPropertyValue() external view returns (uint256) {
        return propertyInfo.totalValue;
    }
}

