const settings = {
  contracts: {
    pnt: '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
    daoPnt: '0xe824F81cD136BB7a28480baF8d7E5f0E8E4B693E',
    voting: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    acl: '0xFDcae423E5e92B76FE7D1e2bcabd36fca8a6a8Fe',
    // TODO: use real ones once deployed on mainnet
    stakingManager: '0xDf951d2061b12922BFbF22cb17B17f3b39183570',
    borrowingManager: '0x8f119cd256a0FfFeed643E830ADCD9767a1d517F',
    epochsManager: '0x4f42528B7bF8Da96516bECb22c1c6f53a8Ac7312',
    registrationManager: '0xe14058B1c3def306e2cb37535647A04De03Db092',
    testToken1: '0x6533158b042775e2FdFeF3cA1a782EFDbB8EB9b1',
    testToken2: '0x73C68f1f41e4890D06Ba3e71b9E9DfA555f1fb46',
    feesManager: '0x74ef2B06A1D2035C33244A4a263FF00B84504865',
    signer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
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
      logo: 'assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: false,
      symbolPrice: 'PNT'
    },
    {
      address: '0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed',
      name: 'pNetwork Token',
      decimals: 18,
      symbol: 'PNT',
      logo: 'assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'PNT'
    },
    {
      address: '0x62199b909fb8b8cf870f97bef2ce6783493c4908',
      name: 'pTokens pBTC',
      decimals: 18,
      symbol: 'pBTC',
      logo: 'assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'BTC'
    },
    {
      address: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
      name: 'GALA',
      decimals: 18,
      symbol: 'pGALA',
      logo: 'assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: false,
      symbolPrice: 'GALA'
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      name: 'USD Coin',
      decimals: 6,
      symbol: 'USDC',
      logo: 'assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'USDC'
    },
    {
      address: '0x3D0221aA6175c3B88103ecEAf2f5D551b23006C8',
      name: 'Test Token 1',
      decimals: 18,
      symbol: 'TST1',
      logo: 'assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: true
    },
    {
      address: '0xd55Edfc91FA7453EE5a8be275c75dBE18cEA2710',
      name: 'Test Token 2',
      decimals: 18,
      symbol: 'TST2',
      logo: 'assets/svg/PNT.svg',
      borrowingManagerClaimEnabled: true
    }
  ]
}

export default settings
