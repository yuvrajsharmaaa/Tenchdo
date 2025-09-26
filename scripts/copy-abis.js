const fs = require('fs');
const path = require('path');

// Contract names and their corresponding artifact paths
const contracts = [
  'RealEstateToken',
  'IdentityRegistry', 
  'Compliance',
  'LeaseManager',
  'MockERC20'
];

// Create frontend contracts directory if it doesn't exist
const frontendContractsDir = path.join(__dirname, '../frontend/src/contracts');
if (!fs.existsSync(frontendContractsDir)) {
  fs.mkdirSync(frontendContractsDir, { recursive: true });
}

// Copy ABIs from artifacts
contracts.forEach(contractName => {
  try {
    const artifactPath = path.join(__dirname, '../artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
    
    // Handle MockERC20 which is in a different location
    let finalArtifactPath = artifactPath;
    if (contractName === 'MockERC20') {
      finalArtifactPath = path.join(__dirname, '../artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
    }
    
    if (fs.existsSync(finalArtifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(finalArtifactPath, 'utf8'));
      const abiData = {
        abi: artifact.abi
      };
      
      const outputPath = path.join(frontendContractsDir, `${contractName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(abiData, null, 2));
      console.log(`✅ Copied ABI for ${contractName}`);
    } else {
      console.log(`❌ Artifact not found for ${contractName} at ${finalArtifactPath}`);
    }
  } catch (error) {
    console.error(`Error copying ABI for ${contractName}:`, error.message);
  }
});

console.log('ABI copy process completed!');
