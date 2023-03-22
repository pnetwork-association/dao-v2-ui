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
    daoPnt: '0xd73EfE7D4884c124A854bFB499D48626ef062539',
    dandelionVotingOld: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    dandelionVoting: '0x31dD13472b9C6753843BB099E464b60C848d8D35',
    acl: '0xB83ebd9296bE6D86325b68f6DC6bf2f923576580',
    stakingManager: '0x7c74254862BBEc10Ce6B28C036Fd69418034dE0E',
    stakingManagerBM: '0xD95D72965258AB791DC38F55f017b014ec7034d7',
    stakingManagerRM: '0x31c1d5f794111B5e4FEd8F62bfb8ed3f6Bd22b6E',
    borrowingManager: '0x26Bb44a16cd34aa748E86034f5d305A09C96501C',
    epochsManager: '0x3C044593de9593713394dF8Fee3A1b7fa974db6e',
    registrationManager: '0x2171D65A315CA7B8c081f491E0d22ca60e6D40eE',
    feesManager: '0x456F799eC7Ad4361312af70ee3a9D508aA8572cB',
    forwarderOnPolygon: '0x76D079b79e20989C0dD022ABcf5fF7D76DD3964f',
    forwarderOnMainnet: '0x0e9A8c66f744fE88bf37D0b6E32f55e16BA4974E',
    forwarderOnBsc: '0x1DAa27FbB620b985ef495d28c1fD8c17Ba83D122',
    financeVault: '0x1EEAb57654572b26117f92b3E9bd919536218570'
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
