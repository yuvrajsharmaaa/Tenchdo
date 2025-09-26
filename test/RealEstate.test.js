const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Real Estate dApp", function () {
  let identityRegistry, compliance, realEstateToken, mockUSDC, leaseManager;
  let owner, landlord, tenant, agent;

  const propertyInfo = {
    propertyAddress: "123 Test Street, Test City, TC 12345",
    totalValue: ethers.parseEther("1000"),
    totalShares: 1000,
    description: "Test property for tokenization",
    isActive: true
  };

  beforeEach(async function () {
    [owner, landlord, tenant, agent] = await ethers.getSigners();

    // Deploy Identity Registry
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.waitForDeployment();

    // Deploy Compliance
    const Compliance = await ethers.getContractFactory("Compliance");
    compliance = await Compliance.deploy(await identityRegistry.getAddress());
    await compliance.waitForDeployment();

    // Deploy Real Estate Token
    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    realEstateToken = await RealEstateToken.deploy(
      "Test Property Token",
      "TPT",
      18,
      await identityRegistry.getAddress(),
      await compliance.getAddress(),
      propertyInfo
    );
    await realEstateToken.waitForDeployment();

    // Deploy Mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await mockUSDC.waitForDeployment();

    // Deploy Lease Manager
    const LeaseManager = await ethers.getContractFactory("LeaseManager");
    leaseManager = await LeaseManager.deploy(await mockUSDC.getAddress());
    await leaseManager.waitForDeployment();

    // Setup identities
    await identityRegistry.registerIdentity(landlord.address, landlord.address, 840); // USA
    await identityRegistry.registerIdentity(tenant.address, tenant.address, 840); // USA
    await identityRegistry.registerIdentity(agent.address, agent.address, 840); // USA
  });

  describe("Identity Registry", function () {
    it("Should register and verify identities", async function () {
      expect(await identityRegistry.isVerified(landlord.address)).to.be.true;
      expect(await identityRegistry.investorCountry(landlord.address)).to.equal(840);
    });

    it("Should allow updating country", async function () {
      await identityRegistry.updateCountry(landlord.address, 124); // Canada
      expect(await identityRegistry.investorCountry(landlord.address)).to.equal(124);
    });
  });

  describe("Compliance", function () {
    it("Should validate transfers between verified users", async function () {
      expect(await compliance.canTransfer(landlord.address, tenant.address, 100)).to.be.true;
    });

    it("Should reject transfers involving blacklisted addresses", async function () {
      await compliance.addToBlacklist(tenant.address);
      expect(await compliance.canTransfer(landlord.address, tenant.address, 100)).to.be.false;
    });
  });

  describe("Real Estate Token", function () {
    it("Should mint tokens to verified users", async function () {
      await realEstateToken.mint(landlord.address, ethers.parseEther("100"));
      expect(await realEstateToken.balanceOf(landlord.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should allow compliant transfers", async function () {
      await realEstateToken.mint(landlord.address, ethers.parseEther("100"));
      await realEstateToken.connect(landlord).transfer(tenant.address, ethers.parseEther("50"));
      
      expect(await realEstateToken.balanceOf(landlord.address)).to.equal(ethers.parseEther("50"));
      expect(await realEstateToken.balanceOf(tenant.address)).to.equal(ethers.parseEther("50"));
    });

    it("Should calculate value per token correctly", async function () {
      const valuePerToken = await realEstateToken.getValuePerToken();
      const expectedValue = propertyInfo.totalValue / BigInt(propertyInfo.totalShares);
      expect(valuePerToken).to.equal(expectedValue);
    });
  });

  describe("Lease Manager", function () {
    beforeEach(async function () {
      // Mint property tokens to landlord
      await realEstateToken.mint(landlord.address, ethers.parseEther("100"));
      
      // Mint USDC to tenant for rent payments
      await mockUSDC.mint(tenant.address, ethers.parseUnits("10000", 6)); // 10,000 USDC
    });

    it("Should create a lease agreement", async function () {
      const startDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      const endDate = startDate + (365 * 86400); // One year later
      
      const tx = await leaseManager.connect(landlord).createLease(
        tenant.address,
        await realEstateToken.getAddress(),
        ethers.parseUnits("1000", 6), // 1000 USDC monthly rent
        ethers.parseUnits("2000", 6), // 2000 USDC security deposit
        startDate,
        endDate,
        "123 Test Property, Test City",
        "Standard lease terms"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'LeaseCreated');
      const leaseId = event.args[0];

      const lease = await leaseManager.getLease(leaseId);
      expect(lease.landlord).to.equal(landlord.address);
      expect(lease.tenant).to.equal(tenant.address);
      expect(lease.monthlyRent).to.equal(ethers.parseUnits("1000", 6));
    });

    it("Should allow tenant to pay security deposit", async function () {
      const startDate = Math.floor(Date.now() / 1000) + 86400;
      const endDate = startDate + (365 * 86400);
      
      const tx = await leaseManager.connect(landlord).createLease(
        tenant.address,
        await realEstateToken.getAddress(),
        ethers.parseUnits("1000", 6),
        ethers.parseUnits("2000", 6),
        startDate,
        endDate,
        "123 Test Property, Test City",
        "Standard lease terms"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'LeaseCreated');
      const leaseId = event.args[0];

      // Approve and pay security deposit
      await mockUSDC.connect(tenant).approve(await leaseManager.getAddress(), ethers.parseUnits("2000", 6));
      await leaseManager.connect(tenant).paySecurityDeposit(leaseId);

      const lease = await leaseManager.getLease(leaseId);
      expect(lease.status).to.equal(1); // Active
      expect(lease.depositPaid).to.equal(ethers.parseUnits("2000", 6));
    });

    it("Should allow rent payments", async function () {
      const startDate = Math.floor(Date.now() / 1000) + 86400;
      const endDate = startDate + (365 * 86400);
      
      // Create lease
      const tx = await leaseManager.connect(landlord).createLease(
        tenant.address,
        await realEstateToken.getAddress(),
        ethers.parseUnits("1000", 6),
        ethers.parseUnits("2000", 6),
        startDate,
        endDate,
        "123 Test Property, Test City",
        "Standard lease terms"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'LeaseCreated');
      const leaseId = event.args[0];

      // Pay security deposit
      await mockUSDC.connect(tenant).approve(await leaseManager.getAddress(), ethers.parseUnits("2000", 6));
      await leaseManager.connect(tenant).paySecurityDeposit(leaseId);

      // Pay rent
      await mockUSDC.connect(tenant).approve(await leaseManager.getAddress(), ethers.parseUnits("1000", 6));
      await leaseManager.connect(tenant).payRent(leaseId, 1, 2024); // January 2024

      const lease = await leaseManager.getLease(leaseId);
      expect(lease.totalRentPaid).to.equal(ethers.parseUnits("1000", 6));

      const payments = await leaseManager.getRentPayments(leaseId);
      expect(payments.length).to.equal(1);
      expect(payments[0].forMonth).to.equal(1);
      expect(payments[0].forYear).to.equal(2024);
    });
  });
});

