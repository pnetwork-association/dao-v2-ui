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
    daoPnt: '0x99dDB0A2739F7EDB7F00f48EaDb5455A90AAeB8d',
    dandelionVotingOld: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    dandelionVoting: '0x18185a61369d66E7E2666c611c2eE2187E5D09A2',
    acl: '0xa8d9d188dab755c78dbf3970b275fbcffdffe9a0',
    stakingManager: '0x026deb88447eC0C45F4d9BA62052eb3d480Fb42D',
    stakingManagerLM: '0x431aA174a6c9412D6D28035c49e58337fAF7A002',
    stakingManagerRM: '0xfBa3C9a8Db03277CA21fb3F86b77EC3386e58F9B',
    lendingManager: '0x8c4eb02723538075f4f687e9B4460eE602d518d3',
    epochsManager: '0x025D03B082FdE40B3dF631374d6B490e1882865D',
    registrationManager: '0xe3Ea0E8F505bCAf8491537Ed588bc93b17b6BFB5',
    feesManager: '0xA7acFe84550e555439fC510f2F17f17Ef8F4fB54',
    financeVault: '0xE52A08078085D073045288Db0B591a5d91a5A687',
    forwarderOnMainnet: '0x2308A0779ba2Dfc0a5A240d9d491C020D8C78a6a',
    forwarderOnPolygon: '0xcc5118564A59aF7A2218E44C16F88d12127e6b70',
    forwarderOnBsc: '0x2308A0779ba2Dfc0a5A240d9d491C020D8C78a6a'
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
