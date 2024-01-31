# NFTs
 * Non-fungible tokens (NFTs) are unique, digital items with blockchain-managed ownership. Examples include collectibles, game items, digital art, event tickets, domain names, and even ownership records for physical assets.


## Three steps: 
 * Objective: Render Image as NFT
 * 1. Add Image to IPFS
 * 2. Add a metadata file pointing to that file on IPFS
 * 3. Grab the tokenURI and put it & set it as your NFT

## Resources:
 * https://blog.chain.link/build-deploy-and-sell-your-own-dynamic-nft/
 * https://blog-v3.opensea.io/articles/non-fungible-tokens

### Opensea NFT Blog
* 
* Anatomy of the ERC20, ERC721, and ERC1155 standards 
    - ERC20 maps addresses to amounts, ERC721 maps unique IDs to owners, and ERC1155 has a nested mapping of IDs to owners to amounts.
    - ERC20 - address => amount || ERC721 - tokenID => ownerAddress || ERC1155 - tokenClassId => ownerAddress => amount
    - 0xabcd => 20 coins        || Kitty #1 => 0xabcd               || Swords => 0xabcd => 20 | Shields => 0xefgh => 30
* Composables: ERC998 Standard
    - provide a template by which NFTs can own both non-fungible and fungible assets.
* Metadata provides descriptive information for a specific token ID. In the case of the CryptoKittty, the metadata is the name of the cat, the picture of the cat, a description, and any additional traits (called “cattributes”, in the case of CryptoKitties). 
```
{
  "name": "Duke Khanplum",
  "image": "https://storage.googleapis.com/ck-kitty-image/0x06012c8cf97bead5deae237070f9587f8e7a266d/1500718.png",
  "description": "Heya. My name is Duke Khanplum, but I've always believed I'm King Henry VIII reincarnated."
}
```

* Onchain Metadata
    - The benefits of representing metadata on-chain are - it permanently resides with the token, persisting beyond the lifecycle of any given application, and it can change in accordance with on-chain logic.
* Off-chain Metadata
    - Most projects store their metadata off-chain due to the current storage limitations of the Ethereum blockchain. 
    - The ERC721 standard, therefore, includes a method called tokenURI that developers can implement to tell applications where to find the metadata for a given item
```
function tokenURI(uint256 _tokenId) public view returns (string)
```






