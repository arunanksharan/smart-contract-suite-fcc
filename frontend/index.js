// frontned code for the smart contract - uses import instead of require
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js"
import { abi, CONTRACT_ADDRESS_LOCALHOST } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = balance
withdrawButton.onclick = withdraw

async function connect() {
  console.log("Hi! I am inside script tag!")
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!")
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log("Error:", error)
    }

    connectButton.innerHTML = "Connected"
    const accounts = await ethereum.request({ method: "eth_accounts" })
    console.log(`Accounts: ${accounts}`)
  } else {
    console.log("MetaMask is not installed!")
    connectButton.innerHTML = "Please install metamask"
  }
}

// fund function

function listenForTransactionMine(txResponse, provider) {
  console.log(`Mining: ${txResponse.hash}`)

  return new Promise((resolve, reject) => {
    try {
      provider.once(txResponse.hash, async (transactionReceipt) => {
        await txResponse.wait(1)
        const confirmations = await transactionReceipt.confirmations()
        console.log(`Completed with ${confirmations} confirmations`)

        resolve()
      })
    } catch (error) {
      console.log("Error:", error)
      reject(error)
    }
  })
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding ${ethAmount} ETH`)
  if (typeof window.ethereum !== "undefined") {
    // provider / connection to blockchain
    const provider = new ethers.BrowserProvider(window.ethereum)

    // signer with fund for gas and amount
    const signer = await provider.getSigner()
    console.log(signer)

    // contract we are interacting with
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS_LOCALHOST,
      abi,
      signer,
    )
    console.log(contract)
    try {
      const txResponse = await contract.fund({
        value: ethers.parseEther(ethAmount),
      })
      console.log(txResponse)

      // listen for tx to be mined
      await listenForTransactionMine(txResponse, provider)

      // listen for an event (later)
    } catch (error) {
      console.log("Error:", error)
    }

    // console.log('Funded!');
    // const balance = await provider.getBalance(
    //   CONTRACT_ADDRESS_LOCALHOST
    // );
    // console.log(`Balance is: ${balance}`);
  }
}
// withdraw function
async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS_LOCALHOST,
      abi,
      signer,
    )
    try {
      const txResponse = await contract.withdraw()
      await listenForTransactionMine(txResponse, provider)
      console.log(txResponse)
    } catch (error) {
      console.log("Error:", error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

// balance function
async function balance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    try {
      const balance = await provider.getBalance(CONTRACT_ADDRESS_LOCALHOST)
      console.log(`Balance is: ${ethers.formatEther(balance)}`)
    } catch (error) {
      console.log("Error:", error)
    }
  } else {
    balanceButton.innerHTML = "No Balance, No MM"
  }
}
