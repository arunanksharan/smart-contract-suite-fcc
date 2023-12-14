// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = hre.ethers.parseEther('0.001');

  const lock = await hre.ethers.deployContract('Lock', [unlockTime], {
    value: lockedAmount,
  });

  await lock.waitForDeployment();

  console.log(
    `Lock with ${ethers.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// {
// "name": "hardhat-fund-me-fcc",
// "devDependencies": {
// "@nomiclabs/hardhat-ethers": "npm:hardhat-deploy-ethers@^0.3.0-beta.13",
// "@nomiclabs/hardhat-etherscan": "^3.0.0",
// "@nomiclabs/hardhat-waffle": "^2.0.2",
// "chai": "^4.3.4",
// "ethereum-waffle": "^3.4.0",
// "ethers": "^5.5.3",
// "hardhat": "^2.8.3",
// "hardhat-deploy": "^0.9.29",
// "hardhat-gas-reporter": "^1.0.7",
// "solidity-coverage": "^0.7.18",
// "@chainlink/contracts": "^0.3.1",
// "dotenv": "^14.2.0",
// "prettier-plugin-solidity": "^1.0.0-beta.19",
// "solhint": "^3.3.7"
// },
// "scripts": {
// "test": "hardhat test",
// "test:staging": "hardhat test --network sepolia",
// "lint": "solhint 'contracts/**/*.sol'",
// "lint:fix": "solhint 'contracts/**/*.sol' --fix",
// "format": "prettier --write .",
// "coverage": "hardhat coverage"
// }
// }
