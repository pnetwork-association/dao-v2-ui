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
    pnt: '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
    daoPnt: '0xe824F81cD136BB7a28480baF8d7E5f0E8E4B693E',
    dandelionVoting: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    acl: '0xFDcae423E5e92B76FE7D1e2bcabd36fca8a6a8Fe',
    // TODO: use real ones once deployed on mainnet
    stakingManager: '0xD94A92749C0bb33c4e4bA7980c6dAD0e3eFfb720',
    borrowingManager: '0xe14058B1c3def306e2cb37535647A04De03Db092',
    epochsManager: '0x4f42528B7bF8Da96516bECb22c1c6f53a8Ac7312',
    registrationManager: '0xF5b81Fe0B6F378f9E6A3fb6A6cD1921FCeA11799',
    feesManager: '0x6533158b042775e2FdFeF3cA1a782EFDbB8EB9b1'
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
  explorer: 'https://etherscan.io',
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
      address: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
      name: 'GALA',
      decimals: 18,
      symbol: 'pGALA',
      logo: './assets/svg/GALA.svg',
      borrowingManagerClaimEnabled: true,
      feesManagerClaimEnabled: true,
      symbolPrice: 'GALA'
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
