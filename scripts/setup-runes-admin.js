#!/usr/bin/env node

/**
 * Setup script for Runes Admin Wallet
 * Generates a testnet4 taproot address and stores credentials in .env
 */

const { generateAddress, getRandomWif } = require('bc-runes-js');
const fs = require('fs');
const path = require('path');

async function setupRunesAdmin() {
  console.log('🪙 Setting up Runes Admin Wallet for Testnet4...\n');

  try {
    // Generate random WIF for testnet
    const randomWif = getRandomWif();
    console.log('✅ Generated random WIF');

    // Generate taproot address
    const { taprootAddress } = generateAddress(randomWif);
    console.log('✅ Generated Taproot address:', taprootAddress);

    // Read existing .env or create new one
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Found existing .env.local file');
    } else {
      console.log('✅ Creating new .env.local file');
    }

    // Prepare new environment variables
    const newEnvVars = `
# Runes Admin Wallet Configuration (Testnet4)
RUNES_ADMIN_WIF=${randomWif}
RUNES_ADMIN_ADDRESS=${taprootAddress}
RUNES_ADMIN_NETWORK=testnet
RUNES_FEE_PER_VBYTE=300

# Rune Configuration (will be set after etching)
# RUNES_COIN_ID=
# RUNES_COIN_NAME=AIBUBU•COIN
`;

    // Check if runes variables already exist
    if (envContent.includes('RUNES_ADMIN_WIF')) {
      console.log('⚠️  Runes admin wallet already configured in .env.local');
      console.log('   Current address found in environment variables.');
      console.log('   Delete the RUNES_ADMIN_* variables from .env.local to regenerate.');
      return;
    }

    // Append to existing .env content
    const updatedEnvContent = envContent + newEnvVars;

    // Write to .env.local file
    fs.writeFileSync(envPath, updatedEnvContent);

    console.log('\n🎉 Admin wallet setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Fund this address with testnet Bitcoin using a faucet:');
    console.log(`   Address: ${taprootAddress}`);
    console.log('2. Testnet faucets you can use:');
    console.log('   - https://coinfaucet.eu/en/btc-testnet/');
    console.log('   - https://testnet-faucet.mempool.co/');
    console.log('3. After funding, run the etch script to create the AIBUBU•COIN rune');
    console.log('\n⚠️  IMPORTANT: This is a TESTNET address - do not send mainnet Bitcoin!');

  } catch (error) {
    console.error('❌ Error setting up admin wallet:', error);
    process.exit(1);
  }
}

// Run the setup
setupRunesAdmin();