const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying ABI Files...\n');

const contracts = ['IdentityRegistry', 'Compliance', 'RealEstateToken', 'LeaseManager', 'MockERC20'];

contracts.forEach(contractName => {
  console.log(`\n📋 Checking ${contractName}:`);
  
  // Check if artifact exists
  const artifactPath = path.join(__dirname, '../artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
  const frontendAbiPath = path.join(__dirname, '../frontend/src/contracts', `${contractName}.json`);
  
  if (fs.existsSync(artifactPath)) {
    console.log(`  ✅ Artifact exists: ${artifactPath}`);
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    console.log(`  📊 ABI functions: ${artifact.abi.length}`);
    
    // Check key functions
    const keyFunctions = {
      'IdentityRegistry': ['isVerified', 'registerIdentity'],
      'Compliance': ['canTransfer', 'addToBlacklist'],
      'RealEstateToken': ['balanceOf', 'transfer', 'mint'],
      'LeaseManager': ['createLease', 'payRent'],
      'MockERC20': ['balanceOf', 'transfer', 'mint']
    };
    
    const requiredFunctions = keyFunctions[contractName] || [];
    const availableFunctions = artifact.abi
      .filter(item => item.type === 'function')
      .map(item => item.name);
    
    requiredFunctions.forEach(func => {
      if (availableFunctions.includes(func)) {
        console.log(`    ✅ ${func}()`);
      } else {
        console.log(`    ❌ ${func}() - MISSING!`);
      }
    });
    
  } else {
    console.log(`  ❌ Artifact missing: ${artifactPath}`);
  }
  
  if (fs.existsSync(frontendAbiPath)) {
    console.log(`  ✅ Frontend ABI exists: ${frontendAbiPath}`);
    
    try {
      const frontendAbi = JSON.parse(fs.readFileSync(frontendAbiPath, 'utf8'));
      if (frontendAbi.abi && Array.isArray(frontendAbi.abi)) {
        console.log(`  📊 Frontend ABI functions: ${frontendAbi.abi.length}`);
      } else {
        console.log(`  ❌ Frontend ABI malformed`);
      }
    } catch (error) {
      console.log(`  ❌ Frontend ABI parse error: ${error.message}`);
    }
    
  } else {
    console.log(`  ❌ Frontend ABI missing: ${frontendAbiPath}`);
  }
});

// Check addresses.json
const addressesPath = path.join(__dirname, '../frontend/src/contracts/addresses.json');
if (fs.existsSync(addressesPath)) {
  console.log(`\n📍 Contract Addresses:`);
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  Object.entries(addresses).forEach(([name, address]) => {
    if (address && address.startsWith('0x')) {
      console.log(`  ✅ ${name}: ${address}`);
    } else {
      console.log(`  ❌ ${name}: ${address} - Invalid address`);
    }
  });
} else {
  console.log(`\n❌ addresses.json missing`);
}

console.log('\n🎉 ABI Verification Complete!');


