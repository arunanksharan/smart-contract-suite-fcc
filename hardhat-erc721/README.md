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
    - 



