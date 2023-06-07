const settings = {
  links: {
    audit: 'https://github.com/cryptonicsconsulting/audits/tree/master/pToken',
    stats: 'https://pnetwork.watch/',
    coinmarketcap: 'https://coinmarketcap.com/currencies/pnetwork/',
    twitter: 'https://twitter.com/pNetworkDeFi',
    telegram: 'https://t.me/pNetworkDefi',
    'p.network': 'https://p.network/',
    github: 'https://github.com/pnetwork-association',
    docs: 'https://p.network/wiki'
  },
  contracts: {
    pTokensVault: '0xe396757EC7E6aC7C8E5ABE7285dde47b98F22db8',
    pntOnPolygon: '0xb6bcae6468760bc0cdfb9c8ef4ee75c9dd23e1ed',
    pntOnEthereum: '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
    pntOnBsc: '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
    daoPnt: '0x1adA73b624b3B89cebdd457db8cBA5d34eb05E95',
    dandelionVotingOld: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    dandelionVoting: '0xb1b013D9ffbA9B19Be1b4BF7a489F0Cc5d96F6Ec',
    acl: '0x5956a8361ac72e85cb3b94c92881166a4df84afd',
    stakingManager: '0x1491733a4c3Fa754e895fcd99ACDECa0D33645c3',
    stakingManagerLM: '0x027EB5E0DB037Ec08df1e9d4F94ddE416472A23B',
    stakingManagerRM: '0x4ca8b8B5A409e7A5910fa4D7298b50985FE41059',
    lendingManager: '0xa65e64ae3A3Ae4A7Ea11D7C2596De779C34dD6af',
    epochsManager: '0xbA1067FB99Ad837F0e2895B57D1635Bdbefa789E',
    registrationManager: '0xCcdbBC9Dea73673dF74E1EE4D5faC8c6Ce1930ef',
    feesManager: '0xE2261C279FE39CEA798Cd96b72ccB150bc164310',
    forwarderOnMainnet: '0x728Ee450B8c75699149dd297ED6Ec4176D8DF65E',
    forwarderOnPolygon: '0x257A984836F4459954CE09955E3c00e8C5b1fb89',
    forwarderOnBsc: '0x728Ee450B8c75699149dd297ED6Ec4176D8DF65E',
    financeVault: '0x139Ad01CAcbbe51B4A2B099E52C47693Ba87351b'
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
      lendingManagerClaimEnabled: false,
      feesManagerClaimEnabled: false,
      symbolPrice: 'PNT'
    },
    {
      address: '0xB6bcae6468760bc0CDFb9C8ef4Ee75C9dd23e1Ed',
      name: 'pNetwork Token',
      decimals: 18,
      symbol: 'PNT',
      logo: './assets/svg/PNT.svg',
      lendingManagerClaimEnabled: true,
      feesManagerClaimEnabled: true,
      symbolPrice: 'PNT'
    },
    {
      address: '0xd7ecf95Cf7eF5256990BeAf4ac895cD9e64cb947',
      name: 'pTokens pBTC',
      decimals: 18,
      symbol: 'pBTC',
      logo: './assets/svg/pBTC.svg',
      lendingManagerClaimEnabled: true,
      feesManagerClaimEnabled: true,
      symbolPrice: 'BTC'
    }
  ],
  activities: {
    blocksWindow: 130000,
    limitBlock: 41124493
  }
}

export default settings
