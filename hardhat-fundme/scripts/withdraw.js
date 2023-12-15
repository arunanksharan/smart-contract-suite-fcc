const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    console.log("Funding contract with account:", deployer)
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log(deployer)
    const fundTxResponse = await fundMe.withdraw()
    const txReceipt = await fundTxResponse.wait(1)
    console.log(txReceipt)
    console.log("Money withdrawn!")
    console.log("---------------------------------------")
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
