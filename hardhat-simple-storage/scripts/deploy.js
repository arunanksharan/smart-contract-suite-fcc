// imports
const { ethers } = require("hardhat")

// define async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying contract...")
  const simpleStorage = await SimpleStorageFactory.deploy()
  // await simpleStorage.deployed()
  console.log(`Deployed Contract to: ${simpleStorage.target}`)
}

// call main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
