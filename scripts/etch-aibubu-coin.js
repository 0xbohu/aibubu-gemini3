#!/usr/bin/env node

/**
 * Etch script for AIBUBU•COIN rune
 * Creates the rune on testnet4 and stores the result in .env
 */

require('dotenv').config({ path: '.env.local' });
const { init, etch } = require('bc-runes-js');
const fs = require('fs');
const path = require('path');

async function etchAibubuCoin() {
  console.log('🪙 Etching AIBUBU•COIN on Testnet4...\n');

  try {
    // Validate environment variables
    const adminWif = process.env.RUNES_ADMIN_WIF;
    const adminAddress = process.env.RUNES_ADMIN_ADDRESS;
    const feePerVByte = parseInt(process.env.RUNES_FEE_PER_VBYTE) || 300;

    if (!adminWif || !adminAddress) {
      console.error('❌ Missing admin wallet configuration!');
      console.error('   Please run: node scripts/setup-runes-admin.js first');
      process.exit(1);
    }

    console.log('✅ Admin Address:', adminAddress);
    console.log('✅ Fee Rate:', feePerVByte, 'sat/vByte');

    // Initialize bc-runes-js with admin wallet
    init({
      taprootAddress: adminAddress,
      wif: adminWif,
      feePerVByte: feePerVByte
    });

    console.log('✅ Initialized bc-runes-js with admin wallet\n');

    // Etch the AIBUBU•COIN rune with higher amounts
    console.log('🎯 Etching AIBUBU•COIN rune...');
    console.log('   - Initial Amount: 1,000,000 coins');
    console.log('   - Cap: 1,000,000 coins (same as initial)');
    console.log('   - Divisibility: 0 (whole coins only)');
    console.log('   - Symbol: 🐣\n');

    const etchResult = await etch({
      amount: 1000000,        // Initial amount: 1 million coins
      cap: 1000000,          // Maximum supply: 1 million coins (same as amount)
      divisibility: 0,       // No decimals - whole coins only
      name: 'AIBUBU•COIN',   // Rune name with spacers
      symbol: '🐣'           // Baby chick emoji
    });

    console.log('🎉 Etch successful!');
    console.log('Etch Result:', JSON.stringify(etchResult, null, 2));

    // Extract the rune ID (blockNumber:txIndex)
    const runeId = `${etchResult.blockHeight || etchResult.blockNumber}:${etchResult.txIndex}`;
    console.log('\n✅ Rune ID:', runeId);

    // Update .env.local with the etch result
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update the rune configuration
    envContent = envContent.replace(
      '# RUNES_COIN_ID=',
      `RUNES_COIN_ID=${runeId}`
    );
    envContent = envContent.replace(
      '# RUNES_COIN_NAME=AIBUBU•COIN',
      'RUNES_COIN_NAME=AIBUBU•COIN'
    );

    // Add additional etch details
    const etchDetails = `
# Etch Result Details
RUNES_ETCH_TX_ID=${etchResult.txid || etchResult.transactionId}
RUNES_ETCH_BLOCK=${etchResult.blockHeight || etchResult.blockNumber}
RUNES_ETCH_INDEX=${etchResult.txIndex}
RUNES_TOTAL_SUPPLY=1000000
RUNES_SYMBOL=🐣
`;

    envContent += etchDetails;

    fs.writeFileSync(envPath, envContent);

    console.log('\n📋 Etch completed successfully!');
    console.log('\nℹ️  Next steps:');
    console.log('1. The AIBUBU•COIN rune has been created');
    console.log('2. Rune ID and details saved to .env.local');
    console.log('3. You can now mint coins to users when they complete tutorials');
    console.log('4. Test the minting functionality with the test page');

  } catch (error) {
    console.error('❌ Error etching rune:', error);

    if (error.message && error.message.includes('Insufficient funds')) {
      console.error('\n💡 Solution: Fund your admin address with testnet Bitcoin:');
      console.error(`   Address: ${process.env.RUNES_ADMIN_ADDRESS}`);
      console.error('   Use a testnet faucet to get test coins');
    }

    process.exit(1);
  }
}

// Run the etch
etchAibubuCoin();