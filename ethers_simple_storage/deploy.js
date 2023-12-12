const ethers = require('ethers');
// import { ethers } from 'ethers';
// import { fs } from 'fs';
const fs = require('fs');

async function main() {
  // option 1: Compile contracts within code
  // option 2: Compile contracts with truffle/hardhat - separately
  // http://localhost:8545 - ganache endpoint on local machine
  // can do using axios - ethers.js has built in support for this - wrapper around all the web3 providers
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
  const wallet = new ethers.Wallet(
    '0x8f1d1e4097fe24b4bf7969fe204451d71de7b951ef3db41eb5e4aa6c698916e0',
    provider
  );
  const abi = fs.readFileSync('./SimpleStorage_sol_SimpleStorage.abi', 'utf8');
  const binary = fs.readFileSync(
    './SimpleStorage_sol_SimpleStorage.bin',
    'utf8'
  );
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log('Deploying contract...');
  const contract = await contractFactory.deploy();
  //   console.log('Deployed contract to address:', contract.address);
  console.log(contract);

  const transactionReceipt = await contract.deploymentTransaction().wait(1);
  console.log('Here is the deployment transaction: ');
  console.log(contract.deploymentTransaction());

  console.log(
    'Deployment transactionReceipt receipt after block confirmation:'
  );
  console.log(transactionReceipt);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
