// imports
import { ethers, run, network } from "hardhat"

// define async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying contract...")
  const simpleStorage = (await SimpleStorageFactory.deploy()) as any
  // await simpleStorage.deployed()
  console.log(`Deployed Contract to: ${simpleStorage.target}`)
  // What happens when we deploy to hardhat network - useless since local network
  console.log(network.config)
  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deploymentTransaction().wait(1)
    await verify(simpleStorage.target, [])
  }

  // Interacting with the deployed contract
  const currentValue = await simpleStorage.retrieve()
  console.log(`Current value stored in contract: ${currentValue.toString()}`)

  // Storing a new value
  const storeTxResponse = await simpleStorage.store(13)
  const storeTxReceipt = await storeTxResponse.wait(1)
  const newStoredValue = await simpleStorage.retrieve()
  console.log(`New value stored in contract: ${newStoredValue.toString()}`)
}

async function verify(contractAddress: string, args: any[]) {
  try {
    console.log("Verifying contract...")
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (error: any) {
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
