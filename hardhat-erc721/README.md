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
 * https://medium.com/@makzent/the-my-crypto-heroes-playbook-episode-2-nft-economics-8ad2a939d91e
 * https://blog.chain.link/random-numbers-nft-erc721/

### Opensea NFT Blog

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
    - The tokenURI method returns a public URL. This, in turn, returns a JSON dictionary of data, something like the example dictionary for the CryptoKitty above
    - This metadata should conform to the official ERC721 metadata standard for it to be picked up by applications like OpenSea.

```
function tokenURI(uint256 _tokenId) public view returns (string)
```

 * Off-chain storage solutions
    - Centralized servers - Simplest way  - centralized server somewhere, or a cloud storage solution like AWS
        - Disadvantages: 1) the developer can change the metadata at will, 2) if the project goes offline, the metadata could disappear from its original source.
    - IPFS
        - IPFS is a peer-to-peer file storage system that allows content to be hosted across computers, such that the file is replicated in many different locations. This ensures that A) the metadata is immutable, as it is uniquely addressed by the hash of the file, and B) as long as there are nodes willing to host the data, the data will persist over time.

## Cryptokitties
 * Pioneer on-chain game mechanics given the design constraints of the blockchain. 
    - Built an on-chain breeding algorithm, hidden inside of a closed-source smart contract that determined the genetic code of a cat (which in-turn determined its “cattributes”). 
    - The CryptoKitties team even ensured the randomness of the breeding through a sophisticated incentive system and had the foresight to reserve certain low-ID cats for later use as promotional tools. 
    - Lastly, they pioneered a Dutch auction contract that later became one of the primary price discovery mechanisms for NFTs. The remarkable foresight of the CryptoKitties team gave the NFT space a major boost, early in its life.
 * Virality of CryptoKitties
    - Speculative mechanics - The breeding and trading mechanics of CryptoKitties led to a clear path to profit: buy up a couple of cats, breed them to make a rarer cat, flip the cat, repeat (or simply buy up a rare cat and hope that someone will come along and buy it). This fueled the growth of a breeder community: users who were dedicated to breeding and flipping rare cats. As long as a new set of users come in and play the games, prices would rise.
    - Viral story - Absurdity of buying 1000$ crypto cat + breakdown of Ethereum - publicity

## Experimentation with pricing and auction mechanics is an exciting piece of the design space for NFTs

## Digital Art
 * Cent - Read a bit more into its working

## Japan leads the way
 * Japanese games have pioneered the way for more advanced user gameplay, appealing to the early adopter demographic. MyCryptoHeroes, an RPG game featuring a sophisticated in-game economy, came onto the scene and continues to top the charts of DappRadar. MyCryptoHeroes was one of the first games to combine on-chain ownership with more sophisticated off-chain gameplay. Users could use their heroes inside of the game and then transfer them to Ethereum when they wanted to sell them on secondary markets.

## Trading card games
## Virtual Worlds like Decentraland

## Decentralized naming services
 * The third-largest NFT “asset class” (after gaming and digital art) is naming services, similar to “.com” domain names but based on decentralized technology. Ethereum Name Service, which launched in May 2017 and is funded by the Ethereum Foundation, had 170,000 ETH locked up from 2017 – 2018 in names (successful bids are locked up in a contract so long as the bidder holds the domain itself). In May of 2019, the team upgraded the ENS smart contract to be ERC721 compatible, meaning that names could be natively traded on open NFT marketplaces.











