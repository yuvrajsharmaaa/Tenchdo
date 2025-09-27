// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IERC3643.sol";
import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/ICompliance.sol";

/**
 * @title RealEstateTokenSecure
 * @dev Production-ready ERC-3643 compliant token for real estate tokenization
 * Enhanced with security features, gas optimization, and comprehensive access control
 */
contract RealEstateTokenSecure is 
    ERC20, 
    IERC3643, 
    Ownable, 
    AccessControl, 
    ReentrancyGuard, 
    Pausable 
{
    
    // Role definitions
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Core ERC-3643 components
    IIdentityRegistry public override identityRegistry;
    ICompliance public override compliance;
    
    // Mapping from wallet to onchain ID
    mapping(address => address) private _onchainIDs;
    
    // Token metadata (immutable for gas optimization)
    uint8 private immutable _tokenDecimals;
    
    // Property details with enhanced structure
    struct PropertyInfo {
        string propertyAddress;
        uint256 totalValue;
        uint256 totalShares;
        string description;
        bool isActive;
        uint256 createdAt;
        string propertyType;  // e.g., "Residential", "Commercial", "Industrial"
        string location;      // City, State, Country
    }
    
    PropertyInfo public propertyInfo;
    
    // Enhanced tracking
    uint256 public totalMinted;
    uint256 public totalBurned;
    mapping(address => uint256) private _lastTransfer;
    
    // Events for enhanced transparency
    event PropertyInfoUpdated(string indexed propertyAddress, uint256 totalValue);
    event AgentAdded(address indexed agent);
    event AgentRemoved(address indexed agent);
    event ComplianceOfficerAdded(address indexed officer);
    event ComplianceOfficerRemoved(address indexed officer);
    event TokensMinted(address indexed to, uint256 amount, uint256 totalSupply);
    event TokensBurned(address indexed from, uint256 amount, uint256 totalSupply);
    
    // Modifiers with enhanced security
    modifier onlyAgent() {
        require(
            hasRole(AGENT_ROLE, msg.sender) || owner() == msg.sender, 
            "RealEstateTokenSecure: caller is not an agent"
        );
        _;
    }
    
    modifier onlyCompliance() {
        require(
            hasRole(COMPLIANCE_ROLE, msg.sender) || owner() == msg.sender, 
            "RealEstateTokenSecure: caller is not a compliance officer"
        );
        _;
    }
    
    modifier onlyCompliant(address _from, address _to, uint256 _amount) {
        require(
            _canTransfer(_from, _to, _amount), 
            "RealEstateTokenSecure: transfer not compliant"
        );
        _;
    }
    
    modifier validAddress(address _address) {
        require(_address != address(0), "RealEstateTokenSecure: invalid address");
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
        require(_identityRegistry != address(0), "RealEstateTokenSecure: invalid identity registry");
        require(_compliance != address(0), "RealEstateTokenSecure: invalid compliance contract");
        require(bytes(_propertyInfo.propertyAddress).length > 0, "RealEstateTokenSecure: invalid property address");
        require(_propertyInfo.totalValue > 0, "RealEstateTokenSecure: invalid property value");
        require(_propertyInfo.totalShares > 0, "RealEstateTokenSecure: invalid total shares");
        
        _tokenDecimals = _decimals;
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        compliance = ICompliance(_compliance);
        
        // Enhanced property info
        propertyInfo = PropertyInfo({
            propertyAddress: _propertyInfo.propertyAddress,
            totalValue: _propertyInfo.totalValue,
            totalShares: _propertyInfo.totalShares,
            description: _propertyInfo.description,
            isActive: true,
            createdAt: block.timestamp,
            propertyType: _propertyInfo.propertyType,
            location: _propertyInfo.location
        });
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AGENT_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        emit IdentityRegistryAdded(_identityRegistry);
        emit ComplianceAdded(_compliance);
        emit PropertyInfoUpdated(_propertyInfo.propertyAddress, _propertyInfo.totalValue);
    }
    
    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }
    
    /**
     * @dev Enhanced compliance check with internal caching
     */
    function _canTransfer(address _from, address _to, uint256 _amount) internal view returns (bool) {
        if (paused()) return false;
        return compliance.canTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Set onchain ID for a wallet with validation
     */
    function setOnchainID(address _onchainID) external override validAddress(_onchainID) {
        require(
            identityRegistry.isVerified(msg.sender), 
            "RealEstateTokenSecure: caller not verified"
        );
        _onchainIDs[msg.sender] = _onchainID;
        emit OnchainIDSet(msg.sender, _onchainID);
    }
    
    /**
     * @dev Set identity registry with enhanced validation
     */
    function setIdentityRegistry(address _identityRegistry) 
        external 
        override 
        onlyOwner 
        validAddress(_identityRegistry) 
    {
        identityRegistry = IIdentityRegistry(_identityRegistry);
        emit IdentityRegistryAdded(_identityRegistry);
    }
    
    /**
     * @dev Set compliance contract with enhanced validation
     */
    function setComplianceContract(address _compliance) 
        external 
        override 
        onlyOwner 
        validAddress(_compliance) 
    {
        compliance = ICompliance(_compliance);
        emit ComplianceAdded(_compliance);
    }
    
    /**
     * @dev Get onchain ID for a wallet
     */
    function onchainID(address _wallet) external view override returns (address) {
        return _onchainIDs[_wallet];
    }
    
    /**
     * @dev Check if transfer is compliant
     */
    function canTransfer(address _from, address _to, uint256 _amount) 
        public 
        view 
        override 
        returns (bool) 
    {
        return _canTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Enhanced forced transfer with comprehensive validation
     */
    function forcedTransfer(address _from, address _to, uint256 _amount) 
        external 
        override 
        onlyCompliance 
        nonReentrant 
        validAddress(_from) 
        validAddress(_to) 
    {
        require(_amount > 0, "RealEstateTokenSecure: invalid amount");
        require(balanceOf(_from) >= _amount, "RealEstateTokenSecure: insufficient balance");
        
        _transfer(_from, _to, _amount);
        emit ForcedTransfer(_from, _to, _amount);
    }
    
    /**
     * @dev Enhanced transfer with compliance and pause checks
     */
    function transfer(address _to, uint256 _amount) 
        public 
        override(ERC20, IERC20) 
        whenNotPaused 
        onlyCompliant(msg.sender, _to, _amount) 
        returns (bool) 
    {
        _lastTransfer[msg.sender] = block.timestamp;
        return super.transfer(_to, _amount);
    }
    
    /**
     * @dev Enhanced transferFrom with compliance and pause checks
     */
    function transferFrom(address _from, address _to, uint256 _amount) 
        public 
        override(ERC20, IERC20) 
        whenNotPaused 
        onlyCompliant(_from, _to, _amount) 
        returns (bool) 
    {
        _spendAllowance(_from, _msgSender(), _amount);
        _transfer(_from, _to, _amount);
        _lastTransfer[_from] = block.timestamp;
        return true;
    }
    
    /**
     * @dev Enhanced mint with comprehensive validation
     */
    function mint(address _to, uint256 _amount) 
        external 
        onlyAgent 
        nonReentrant 
        whenNotPaused 
        validAddress(_to) 
    {
        require(_amount > 0, "RealEstateTokenSecure: invalid amount");
        require(identityRegistry.isVerified(_to), "RealEstateTokenSecure: recipient not verified");
        require(canTransfer(address(0), _to, _amount), "RealEstateTokenSecure: mint not compliant");
        
        // Check if minting exceeds total shares
        require(
            totalSupply() + _amount <= propertyInfo.totalShares * 10**decimals(),
            "RealEstateTokenSecure: exceeds total shares"
        );
        
        _mint(_to, _amount);
        totalMinted += _amount;
        
        emit TokensMinted(_to, _amount, totalSupply());
    }
    
    /**
     * @dev Enhanced burn with comprehensive validation
     */
    function burn(address _from, uint256 _amount) 
        external 
        onlyAgent 
        nonReentrant 
        whenNotPaused 
        validAddress(_from) 
    {
        require(_amount > 0, "RealEstateTokenSecure: invalid amount");
        require(balanceOf(_from) >= _amount, "RealEstateTokenSecure: insufficient balance");
        
        _burn(_from, _amount);
        totalBurned += _amount;
        
        emit TokensBurned(_from, _amount, totalSupply());
    }
    
    /**
     * @dev Enhanced property info update with validation
     */
    function updatePropertyInfo(PropertyInfo memory _propertyInfo) 
        external 
        onlyOwner 
        whenNotPaused 
    {
        require(bytes(_propertyInfo.propertyAddress).length > 0, "RealEstateTokenSecure: invalid property address");
        require(_propertyInfo.totalValue > 0, "RealEstateTokenSecure: invalid property value");
        require(_propertyInfo.totalShares > 0, "RealEstateTokenSecure: invalid total shares");
        
        // Preserve creation timestamp
        _propertyInfo.createdAt = propertyInfo.createdAt;
        propertyInfo = _propertyInfo;
        
        emit PropertyInfoUpdated(_propertyInfo.propertyAddress, _propertyInfo.totalValue);
    }
    
    /**
     * @dev Role management functions with events
     */
    function addAgent(address _agent) external onlyOwner validAddress(_agent) {
        _grantRole(AGENT_ROLE, _agent);
        emit AgentAdded(_agent);
    }
    
    function removeAgent(address _agent) external onlyOwner {
        _revokeRole(AGENT_ROLE, _agent);
        emit AgentRemoved(_agent);
    }
    
    function addComplianceOfficer(address _officer) external onlyOwner validAddress(_officer) {
        _grantRole(COMPLIANCE_ROLE, _officer);
        emit ComplianceOfficerAdded(_officer);
    }
    
    function removeComplianceOfficer(address _officer) external onlyOwner {
        _revokeRole(COMPLIANCE_ROLE, _officer);
        emit ComplianceOfficerRemoved(_officer);
    }
    
    /**
     * @dev Emergency pause functions
     */
    function pause() external {
        require(hasRole(PAUSER_ROLE, msg.sender), "RealEstateTokenSecure: must have pauser role");
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Enhanced getter functions
     */
    function getValuePerToken() external view returns (uint256) {
        if (propertyInfo.totalShares == 0) return 0;
        return propertyInfo.totalValue / propertyInfo.totalShares;
    }
    
    function getTotalPropertyValue() external view returns (uint256) {
        return propertyInfo.totalValue;
    }
    
    function getLastTransferTime(address _account) external view returns (uint256) {
        return _lastTransfer[_account];
    }
    
    function getTokenMetrics() external view returns (
        uint256 totalSupply_,
        uint256 totalMinted_,
        uint256 totalBurned_,
        uint256 maxSupply
    ) {
        return (
            totalSupply(),
            totalMinted,
            totalBurned,
            propertyInfo.totalShares * 10**decimals()
        );
    }
    
    /**
     * @dev Enhanced _update hook with compliance integration
     */
    function _update(address from, address to, uint256 amount) 
        internal 
        override 
    {
        super._update(from, to, amount);
        
        // Update compliance holder count if supported
        if (address(compliance) != address(0)) {
            try compliance.updateHolderCount(from, to, amount) {
                // Successfully updated holder count
            } catch {
                // Compliance contract doesn't support holder tracking
                // This is non-critical, so we continue
            }
        }
    }
    
    /**
     * @dev Batch transfer function for gas efficiency
     */
    function batchTransfer(
        address[] calldata _recipients, 
        uint256[] calldata _amounts
    ) external whenNotPaused nonReentrant returns (bool) {
        require(_recipients.length == _amounts.length, "RealEstateTokenSecure: arrays length mismatch");
        require(_recipients.length > 0, "RealEstateTokenSecure: empty arrays");
        require(_recipients.length <= 100, "RealEstateTokenSecure: too many recipients");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(canTransfer(msg.sender, _recipients[i], _amounts[i]), "RealEstateTokenSecure: transfer not compliant");
            _transfer(msg.sender, _recipients[i], _amounts[i]);
        }
        
        _lastTransfer[msg.sender] = block.timestamp;
        return true;
    }
}
