const settings = {
  contracts: {
    pnt: '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
    daoPnt: '0xe824F81cD136BB7a28480baF8d7E5f0E8E4B693E',
    voting: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    acl: '0xFDcae423E5e92B76FE7D1e2bcabd36fca8a6a8Fe',
    // TODO: use real ones once deployed on mainnet
    stakingManager: '0xd038A2EE73b64F30d65802Ad188F27921656f28F',
    borrowingManager: '0x09120eAED8e4cD86D85a616680151DAA653880F2',
    epochsManager: '0xeC1BB74f5799811c0c1Bff94Ef76Fb40abccbE4a',
    registrationManager: '0x6732128F9cc0c4344b2d4DC6285BCd516b7E59E6',
    feesManager: '0xAe9Ed85dE2670e3112590a2BB17b7283ddF44d9c',
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
      logo: 'assets/svg/pBTC.svg',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'BTC'
    },
    {
      address: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
      name: 'GALA',
      decimals: 18,
      symbol: 'pGALA',
      logo: 'assets/svg/GALA.svg',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'GALA'
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      name: 'USD Coin',
      decimals: 6,
      symbol: 'USDC',
      logo: 'assets/svg/USDC.svg',
      borrowingManagerClaimEnabled: true,
      symbolPrice: 'USDC'
    }
  ]
}

export default settings
