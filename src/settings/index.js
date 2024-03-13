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
    erc20Vault: '0xe396757EC7E6aC7C8E5ABE7285dde47b98F22db8',
    pntOnGnosis: '0x8805Aa0C1a8e59b03fA95740F691E28942Cf44f6',
    pntOnPolygon: '0xb6bcae6468760bc0cdfb9c8ef4ee75c9dd23e1ed',
    pntOnEthereum: '0x89Ab32156e46F46D02ade3FEcbe5Fc4243B9AAeD',
    pntOnBsc: '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
    daoPnt: '0xFF8Ce5Aca26251Cc3f31e597291c71794C06092a',
    dandelionVotingV1: '0x2211bFD97b1c02aE8Ac305d206e9780ba7D8BfF4',
    dandelionVotingV2: '0xb1b013D9ffbA9B19Be1b4BF7a489F0Cc5d96F6Ec',
    dandelionVotingV3: '0x0cf759bcCfEf5f322af58ADaE2D28885658B5e02',
    acl: '0x50b2b8e429cB51bD43cD3E690e5BEB9eb674f6d7',
    stakingManager: '0xdEE8ebE2b7152ECCd935fd67134BF1bad55302BC',
    stakingManagerLM: '0x74107f07765A918890c7a0E9d420Dc587539aD42',
    stakingManagerRM: '0x9ce64A5c880153CD15C097C8D90c39cB073aE945',
    lendingManager: '0xEf3A54f764F58848e66BaDc427542b44C44b5553',
    epochsManager: '0xFDD7d2f23F771F05C6CEbFc9f9bC2A771FAE302e',
    registrationManager: '0x08342a325630bE00F55A7Bc5dD64D342B1D3d23D',
    feesManager: '0x053b3d59F06601dF87D9EdD24CB2a81FAE93405f',
    forwarderOnGnosis: '0x2422eb5B6a20C7b8e3567C12Ed6f5ED9d1Cf1f79',
    forwarderOnMainnet: '0xe2cb2C8fDc086FC576b49aCF2F71D44DDe7e3804',
    forwarderOnPolygon: '0xC4A989fcb73c6563580dfe9d5439088a98D6C1de',
    forwarderOnBsc: '0x545d1Da3095a74336D121a8e2078104DDC64AfCE',
    financeVault: '0x6239968e6231164687CB40f8389d933dD7f7e0A5',
    crossExecutor: '0x6a4Bd6DE0de7b80F24A307f31B40856da975b5A7'
  },
  pnetworkIds: {
    mainnet: '0x005fe7f9',
    interim: '0xffffffff',
    polygon: '0x0075dd4c',
    gnosis: '0x00f1918e',
    bsc: '0x00e4b170'
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
    polygon: 'https://polygonscan.com',
    gnosis: 'https://gnosisscan.io'
  },
  rpc: {
    gnosis: 'https://rpc.gnosischain.com'
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
    blocksWindow: 30000n,
    limitBlock: 31222303
  }
}

export default settings
