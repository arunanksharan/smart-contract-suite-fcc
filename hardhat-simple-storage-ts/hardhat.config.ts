import "@nomicfoundation/hardhat-toolbox"
import "dotenv/config"
import "@nomicfoundation/hardhat-verify"
import "./tasks/block-number"
import "hardhat-gas-reporter"
import "solidity-coverage"
import { HardhatUserConfig } from "hardhat/config"
import "@typechain/hardhat"

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY!],
      chainId: 5,
    },
  },
  solidity: "0.8.7",
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPrice: 21,
  },
}

export default config
