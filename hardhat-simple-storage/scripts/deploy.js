// imports
const { ethers, run, network } = require("hardhat")

// define async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying contract...")
  const simpleStorage = await SimpleStorageFactory.deploy()
  // await simpleStorage.deployed()
  console.log(`Deployed Contract to: ${simpleStorage.target}`)
  // What happens when we deploy to hardhat network - useless since local network
  console.log(network.config)
  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deploymentTransaction().wait(6)
    await verify(simpleStorage.target, [])
  }

  // Interacting with the deployed contract
}

async function verify(contractAddress, args) {
  try {
    console.log("Verifying contract...")
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (error) {
    if (error.message.includes("Contract source code already verified")) {
      console.log("Contract source code already verified")
    } else {
      console.error(error)
    }
  }
}

// call main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
