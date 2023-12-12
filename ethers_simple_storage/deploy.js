async function main() {
  // option 1: Compile contracts within code
  // option 2: Compile contracts with truffle/hardhat - separately
  // http://localhost:8545
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
