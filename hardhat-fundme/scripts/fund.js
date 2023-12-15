const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    console.log("Funding contract with account:", deployer)
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log(deployer)
    const fundTxResponse = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    })
    const txReceipt = await fundTxResponse.wait(1)
    console.log(txReceipt)
    console.log("Funded!")
    console.log("---------------------------------------")
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
