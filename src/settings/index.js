const settings = {
  contracts: {
    pnt: '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
    daoPnt: '0xe824F81cD136BB7a28480baF8d7E5f0E8E4B693E',
    voting: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    stakingManager: '0xeb10e80D99655B51E3a981E888a73D0B21e21A6C',
    acl: '0xFDcae423E5e92B76FE7D1e2bcabd36fca8a6a8Fe',
    // TODO: use real ones once deployed on mainnet
    borrowingManager: '0xde7B03F1634774cA6B9b754567dDd65bbAe8E860',
    epochsManager: '0x320d624a6357B5c9D7f016cF39662EDf4C888D84',
    registrationManager: '0xD32e049B450AF9e444cc8CC8Da8E922C523A5524',
    testToken1: '0x9985049e4779a3d98CD4d423AbfFcF5C304D3168',
    testToken2: '0x119Fc5b9631610e99371367c8e4ed5adF371916E',
    feesManager: '0x8d1ba21C25754edc3fe996970636727Cf227490C'
  },
  stakingManager: {
    minStakeDays: 7
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
      logo: 'https://assets.eidoo.io/blockchains/1/assets/0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed/logo.png',
      borrowingManagerClaimEnabled: false,
      symbolPrice: 'PNT'
    },
    {
      address: '0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed',
      name: 'pNetwork Token',
      decimals: 18,
      symbol: 'PNT',
      logo: 'https://assets.eidoo.io/blockchains/1/assets/0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed/logo.png',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'PNT'
    },
    {
      address: '0x62199b909fb8b8cf870f97bef2ce6783493c4908',
      name: 'pTokens pBTC',
      decimals: 18,
      symbol: 'pBTC',
      logo: 'https://assets.eidoo.io/blockchains/1/assets/0x62199b909fb8b8cf870f97bef2ce6783493c4908/logo.png',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'BTC'
    },
    {
      address: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
      name: 'GALA',
      decimals: 18,
      symbol: 'pGALA',
      logo: 'https://assets.eidoo.io/blockchains/1/assets/0x15d4c048f83bd7e37d49ea4c83a07267ec4203da/logo.png',
      borrowingManagerClaimEnabled: false,
      symbolPrice: 'GALA'
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      name: 'USD Coin',
      decimals: 6,
      symbol: 'USDC',
      logo: 'https://assets.eidoo.io/blockchains/1/assets/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'USDC'
    },
    {
      address: '0x3D0221aA6175c3B88103ecEAf2f5D551b23006C8',
      name: 'Test Token 1',
      decimals: 18,
      symbol: 'TST1',
      logo: 'https://assets.eidoo.io/blockchains/1/assets/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png',
      borrowingManagerClaimEnabled: true
    },
    {
      address: '0xd55Edfc91FA7453EE5a8be275c75dBE18cEA2710',
      name: 'Test Token 2',
      decimals: 18,
      symbol: 'TST2',
      logo: 'https://assets.eidoo.io/blockchains/1/assets/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png',
      borrowingManagerClaimEnabled: true
    }
  ]
}

export default settings
