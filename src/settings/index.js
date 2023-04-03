const settings = {
  links: {
    audit: 'https://github.com/cryptonicsconsulting/audits/tree/master/pToken',
    stats: 'https://pnetwork.watch/',
    coinmarketcap: 'https://coinmarketcap.com/currencies/pnetwork/',
    twitter: 'https://twitter.com/pNetworkDeFi',
    telegram: 'https://t.me/pNetworkDefi',
    'p.network': 'https://p.network/',
    github: 'https://github.com/pnetwork-association'
  },
  contracts: {
    pTokensVault: '0xe396757EC7E6aC7C8E5ABE7285dde47b98F22db8',
    pntOnPolygon: '0xb6bcae6468760bc0cdfb9c8ef4ee75c9dd23e1ed',
    pntOnEthereum: '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
    pntOnBsc: '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
    daoPnt: '0xf2E263DEA6b7Be55DcC8df6b0ad241465e644d79',
    dandelionVotingOld: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    dandelionVoting: '0xC117F3aF3626A3A1B49e9C3ADb55c38D57A7F6AB',
    acl: '0x134b504400d5455ecf7910c8f0f235ef8956a993',
    stakingManager: '0xc256D58831e1F7F2694Ea7Eaa84dAf30aE9029b7',
    stakingManagerLM: '0xd53825ACB20Ff677bC9aDA308044778d598B969A',
    stakingManagerRM: '0xc977B5ca1EbEaf0b2e1Af653Ab6030Bfef042c7D',
    lendingManager: '0xB912fE097a7259fFEa14DD4afA5b9A7606D47b5b',
    epochsManager: '0x4ca9C6f9E1c6615f70A7c8866392cB7Bc1e7b529',
    registrationManager: '0x12C6852a7F110ED81e04718f9e8DA63A96c1Bfb7',
    feesManager: '0x262193814f7EDF46a895c418EDEF6e1222fE80Dd',
    financeVault: '0xB5c7E6f671C1F0d618d524cA9f2386f525851Fe6'
  },
  stakingManager: {
    minStakeDays: 7,
    minStakeSeconds: 604800
  },
  registrationManager: {
    borrowAmount: 200000,
    minStakeAmount: 200000,
    estimatedSentinelRunningCost: 150
  },
  explorers: {
    mainnet: 'https://etherscan.io',
    bsc: 'https://bscscan.com',
    polygon: 'https://polygonscan.com'
  },
  assets: [
    {
      address: '0xf4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2',
      name: 'pNetwork Token',
      decimals: 18,
      symbol: 'ethPNT',
      logo: './assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: false,
      feesManagerClaimEnabled: false,
      symbolPrice: 'PNT'
    },
    {
      address: '0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed',
      name: 'pNetwork Token',
      decimals: 18,
      symbol: 'PNT',
      logo: './assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: true,
      feesManagerClaimEnabled: true,
      symbolPrice: 'PNT'
    },
    {
      address: '0x62199b909fb8b8cf870f97bef2ce6783493c4908',
      name: 'pTokens pBTC',
      decimals: 18,
      symbol: 'pBTC',
      logo: './assets/svg/pBTC.svg',
      borrowingManagerClaimEnabled: true,
      feesManagerClaimEnabled: true,
      symbolPrice: 'BTC'
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      name: 'USD Coin',
      decimals: 6,
      symbol: 'USDC',
      logo: './assets/svg/USDC.svg',
      borrowingManagerClaimEnabled: true,
      feesManagerClaimEnabled: true,
      symbolPrice: 'USDC'
    }
  ]
}

export default settings
