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
    stakingManager: '0xdC527eb5a26Fe76c66b2fA61a983f67F2E5f2Ad8',
    stakingManagerBM: '0x3c11162d411Ea86b7F6d002741DBC3E22893AAca',
    stakingManagerRM: '0x38e6f8F37c002444E1D2e1344e86170278a25d3e',
    borrowingManager: '0xFa5F0FaeBf569599dFCe24AC2Aa250fcB8A42d68',
    epochsManager: '0x9Fb730772e63839eea3dcC5539Bd7038Fd6Faf92',
    registrationManager: '0xa14e8Ba1A8E8c49Ad24E73Ca096A8f5960Cf1292',
    feesManager: '0x0b5a21b5615A93bA5aA633DCf4cdA17f000C3d49',
    forwarderOnPolygon: '0x76D079b79e20989C0dD022ABcf5fF7D76DD3964f',
    forwarderOnMainnet: '0x0e9A8c66f744fE88bf37D0b6E32f55e16BA4974E',
    forwarderOnBsc: '0x1DAa27FbB620b985ef495d28c1fD8c17Ba83D122'
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
