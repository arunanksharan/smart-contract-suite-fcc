import { ethers } from "ethers"
import * as fs from "fs-extra"
import "dotenv/config"

async function main() {
  // option 1: Compile contracts within code
  // option 2: Compile contracts with truffle/hardhat - separately
  // http://localhost:8545 - ganache endpoint on local machine
  // can do using axios - ethers.js has built in support for this - wrapper around all the web3 providers
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

  // Deployed address on Goerli: 0x8F86060Dc5CbddDEf86887ECAA433abE043Bd34e - Confirmed with Etherscan

  // Using encryptedKey to generate wallet
  //   const encryptedJsonKey = fs.readFileSync("./.encryptedKey.json", "utf8");
  //   let wallet = ethers.Wallet.fromEncryptedJsonSync(
  //     encryptedJsonKey,
  //     process.env.PRIVATE_KEY_PASSWORD,
  //   );
  //   wallet = await wallet.connect(provider);
  //   console.log(`Process Env PrivateKey: ${process.env.PRIVATE_KEY}`);

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8",
  )

  // Cast the contract to the interface
  //   const myContract = contract.connect(wallet) as ethers.Contract &
  //     MyContractInterface

  // Now you can call retrieve and other functions
  //   const currentFavoriteNumber = await myContract.retrieve()
  //   const updatedFavoriteNumber = await myContract.retrieve()

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet)
  console.log("Deploying contract...")
  const contract = (await contractFactory.deploy()) as any
  console.log("Deployed contract to address:", contract.getAddress())
  console.log(contract)

  const transactionReceipt = await contract.deploymentTransaction()?.wait(1)
  console.log("Here is the deployment transaction: ")
  console.log(contract.deploymentTransaction())

  console.log("Deployment transactionReceipt receipt after block confirmation:")
  console.log(transactionReceipt)

  // Get favoriteNumber from contract
  const currentFavoriteNumber = await contract.retrieve()
  console.log(
    "Current favorite number in contract:",
    currentFavoriteNumber.toString(),
  )

  // Store a large number
  const storeTxResponse = await contract.store("100000000000000000000000")
  const storeTxReceipt = await storeTxResponse.wait(1)
  console.log(`storeTxReceipt: ${JSON.stringify(storeTxReceipt)}`)
  const updatedFavoriteNumber = await contract.retrieve()
  console.log(
    `Updated favorite number in contract: ${updatedFavoriteNumber.toString()}`,
  )

  //   console.log('Deploying using raw tx data');
  //   const nonce = await wallet.getNonce();
  //   const tx = {
  //     nonce: nonce,
  //     gasPrice: 20000000000,
  //     gasLimit: 6721975,
  //     to: null,
  //     value: 0,
  //     data: '0x608060405260008060006101000a81548160ff02191690831515021790555060056001556040518060400160405280600481526020017f46697665000000000000000000000000000000000000000000000000000000008152506002908051906020019061006e929190610194565b507ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffb60035573a961bf111da182063cd6d2e7396df9d8ca044faa600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f63617400000000000000000000000000000000000000000000000000000000006005556040518060400160405280600281526020016040518060400160405280600381526020017f5061740000000000000000000000000000000000000000000000000000000000815250815250600760008201518160000155602082015181600101908051906020019061017f929190610194565b50505034801561018e57600080fd5b50610298565b8280546101a090610237565b90600052602060002090601f0160209004810192826101c25760008555610209565b82601f106101db57805160ff1916838001178555610209565b82800160010185558215610209579182015b828111156102085782518255916020019190600101906101ed565b5b509050610216919061021a565b5090565b5b8082111561023357600081600090555060010161021b565b5090565b6000600282049050600182168061024f57607f821691505b6020821081141561026357610262610269565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b610903806102a76000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c806377ec2b551161005b57806377ec2b55146101015780638bab8dd5146101205780639e7a13ad14610150578063cb3214471461018157610088565b80632e64cec11461008d578063471f7cdf146100ab5780636057361d146100c95780636f760f41146100e5575b600080fd5b6100956101b1565b6040516100a291906106bc565b60405180910390f35b6100b36101bb565b6040516100c091906106bc565b60405180910390f35b6100e360048036038101906100de91906105ff565b6101c1565b005b6100ff60048036038101906100fa91906105a3565b6101cb565b005b61010961028a565b6040516101179291906106d7565b60405180910390f35b61013a6004803603810190610135919061055a565b610324565b60405161014791906106bc565b60405180910390f35b61016a600480360381019061016591906105ff565b610352565b6040516101789291906106d7565b60405180910390f35b61019b600480360381019061019691906105ff565b61040e565b6040516101a891906106bc565b60405180910390f35b6000600654905090565b60065481565b8060068190555050565b60006040518060400160405280838152602001848152509050600b819080600181540180825580915050600190039060005260206000209060020201600090919091909150600082015181600001556020820151816001019080519060200190610236929190610432565b5050508160098460405161024a91906106a5565b908152602001604051809103902081905550600a829080600181540180825580915050600190039060005260206000200160009091909190915055505050565b60078060000154908060010180546102a1906107d0565b80601f01602080910402602001604051908101604052809291908181526020018280546102cd906107d0565b801561031a5780601f106102ef5761010080835404028352916020019161031a565b820191906000526020600020905b8154815290600101906020018083116102fd57829003601f168201915b5050505050905082565b6009818051602081018201805184825260208301602085012081835280955050505050506000915090505481565b600b818154811061036257600080fd5b906000526020600020906002020160009150905080600001549080600101805461038b906107d0565b80601f01602080910402602001604051908101604052809291908181526020018280546103b7906107d0565b80156104045780601f106103d957610100808354040283529160200191610404565b820191906000526020600020905b8154815290600101906020018083116103e757829003601f168201915b5050505050905082565b600a818154811061041e57600080fd5b906000526020600020016000915090505481565b82805461043e906107d0565b90600052602060002090601f01602090048101928261046057600085556104a7565b82601f1061047957805160ff19168380011785556104a7565b828001600101855582156104a7579182015b828111156104a657825182559160200191906001019061048b565b5b5090506104b491906104b8565b5090565b5b808211156104d15760008160009055506001016104b9565b5090565b60006104e86104e38461072c565b610707565b90508281526020810184848401111561050457610503610896565b5b61050f84828561078e565b509392505050565b600082601f83011261052c5761052b610891565b5b813561053c8482602086016104d5565b91505092915050565b600081359050610554816108b6565b92915050565b6000602082840312156105705761056f6108a0565b5b600082013567ffffffffffffffff81111561058e5761058d61089b565b5b61059a84828501610517565b91505092915050565b600080604083850312156105ba576105b96108a0565b5b600083013567ffffffffffffffff8111156105d8576105d761089b565b5b6105e485828601610517565b92505060206105f585828601610545565b9150509250929050565b600060208284031215610615576106146108a0565b5b600061062384828501610545565b91505092915050565b60006106378261075d565b6106418185610768565b935061065181856020860161079d565b61065a816108a5565b840191505092915050565b60006106708261075d565b61067a8185610779565b935061068a81856020860161079d565b80840191505092915050565b61069f81610784565b82525050565b60006106b18284610665565b915081905092915050565b60006020820190506106d16000830184610696565b92915050565b60006040820190506106ec6000830185610696565b81810360208301526106fe818461062c565b90509392505050565b6000610711610722565b905061071d8282610802565b919050565b6000604051905090565b600067ffffffffffffffff82111561074757610746610862565b5b610750826108a5565b9050602081019050919050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b6000819050919050565b82818337600083830152505050565b60005b838110156107bb5780820151818401526020810190506107a0565b838111156107ca576000848401525b50505050565b600060028204905060018216806107e857607f821691505b602082108114156107fc576107fb610833565b5b50919050565b61080b826108a5565b810181811067ffffffffffffffff8211171561082a57610829610862565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b6108bf81610784565b81146108ca57600080fd5b5056fea26469706673582212207c4f6fde061e32b433ab4eb49f0be59bee4322fc1a984c82ba51504ad5b7932064736f6c63430008070033',
  //     chainId: 1337,
  //   };

  //   const signedTx = await wallet.signTransaction(tx);
  //   console.log('Signed transaction: ', signedTx);

  //   const sentTx = await wallet.sendTransaction(tx);
  //   await sentTx.wait(1);
  //   console.log('Transaction mined!');
  //   console.log('Transaction hash: ', sentTx.hash);
  //   console.log(sentTx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
