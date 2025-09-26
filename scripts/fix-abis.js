const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing contract ABIs...');

// Create frontend contracts directory
const frontendContractsDir = path.join(__dirname, '../frontend/src/contracts');
if (!fs.existsSync(frontendContractsDir)) {
  fs.mkdirSync(frontendContractsDir, { recursive: true });
}

// Contract names
const contracts = ['IdentityRegistry', 'Compliance', 'RealEstateToken', 'LeaseManager', 'MockERC20'];

// Copy ABIs from artifacts
contracts.forEach(contractName => {
  try {
    const artifactPath = path.join(__dirname, '../artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
    
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      const abiData = {
        abi: artifact.abi
      };
      
      const outputPath = path.join(frontendContractsDir, `${contractName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(abiData, null, 2));
      console.log(`✅ Fixed ABI for ${contractName}`);
    } else {
      console.log(`❌ Artifact not found for ${contractName}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ABI for ${contractName}:`, error.message);
  }
});

console.log('🎉 ABI fix complete!');
