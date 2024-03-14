import VaultABI from '../abis/Vault.json'
import DandelionVotingABI from '../abis/DandelionVoting.json'
import EthPNTABI from '../abis/EthPNT.json'
import pNetworkV2VaultABI from '../abis/pNetworkV2Vault.json'
import ForwarderABI from '../abis/Forwarder.json'
import RewardsManagerABI from '../abis/RewardsManager.json'
import MerklDistributionCreatorABI from '../abis/MerklDistributionCreator.json'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { readContract } from '@wagmi/core'

import settings from '../../settings'

export const vaultContract = new ethers.utils.Interface(VaultABI)
export const ethPNTContract = new ethers.utils.Interface(EthPNTABI)
export const pNetworkV2Vault = new ethers.utils.Interface(pNetworkV2VaultABI)
export const rewardsManager = new ethers.utils.Interface(RewardsManagerABI)
export const forwarder = new ethers.utils.Interface(ForwarderABI)
export const distributionCreator = new ethers.utils.Interface(MerklDistributionCreatorABI)
export const dandelionVotingContract = new ethers.utils.Interface(DandelionVotingABI)

const ONE_DAY = 60 * 60 * 24

export const prepareInflationData = (amount) => {
  const ethPNTAsset = settings.assets.find((asset) => asset.symbol == 'ethPNT')
  if (!ethPNTAsset) throw new Error('ethPNT asset config not found!')
  const ethPNTAddress = ethPNTAsset.address
  if (!ethPNTAddress) throw new Error('ethPNT asset address not found!')
  const ethPNTDecimals = ethPNTAsset.decimals
  if (!ethPNTDecimals) throw new Error('ethPNT asset decimals not found!')

  const rawAmount = BigNumber(amount)
    .multipliedBy(10 ** ethPNTDecimals)
    .toFixed()

  return {
    rawAmount: rawAmount,
    ethPNTAddress: ethPNTAddress
  }
}

export const prepareInflationProposal = async (ethPNTAddress, receiverAddress, rawAmount) => [
  {
    to: ethPNTAddress,
    calldata: ethPNTContract.encodeFunctionData('withdrawInflation', [settings.contracts.financeVault, rawAmount])
  },
  {
    to: settings.contracts.financeVault,
    calldata: vaultContract.encodeFunctionData('transfer', [ethPNTAddress, receiverAddress, rawAmount])
  }
]

const sha3 = (_string) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(_string))

const getCorrectEpochStartTimestamp = async () => {
  const now = ethers.BigNumber.from(Math.floor(Date.now() / 1000))
  const ethereumBlockTime = 15 // seconds

  const durationBlocks = await readContract({
    address: settings.contracts.dandelionVoting,
    abi: DandelionVotingABI,
    functionName: 'durationBlocks',
    args: []
  })
  const executionDelayBlocks = await readContract({
    address: settings.contracts.dandelionVoting,
    abi: DandelionVotingABI,
    functionName: 'executionDelayBlocks',
    args: []
  })
  const blocksRequiredBeforeExecuting = durationBlocks.add(executionDelayBlocks)
  const timeRequiredBeforeExecuting = blocksRequiredBeforeExecuting.mul(ethereumBlockTime) // seconds
  // We allow enough time for the execution before the campaign expires, that is
  // executionBlockTs + 1 day
  return now.add(timeRequiredBeforeExecuting).add(ONE_DAY)
}

export const getCampaignPayloadFromParameters = async (
  _uniswapV3Pool,
  _rewardToken,
  _amount,
  _token0Percentage,
  _token1Percentage,
  _feesPercentage,
  _campaignDurationInMonths
) => {
  // From the front end we'll get the percentage (i.e. for 45.10% we'll use 4510)
  const propToken0 = _token0Percentage * 100
  const propToken1 = _token1Percentage * 100
  const propFees = _feesPercentage * 100
  const epochStartTs = await getCorrectEpochStartTimestamp()
  const campaignDurationInHours = _campaignDurationInMonths * 28 * 24 // 4 weeks per month => 28 days, 24 hours per day

  if (!ethers.utils.isAddress(_rewardToken)) throw new Error('Invalid address', _rewardToken)
  if (!ethers.utils.isAddress(_uniswapV3Pool)) throw new Error('Invalid address', _uniswapV3Pool)

  return {
    rewardId: sha3('pnetwork-incentives'),
    uniV3Pool: _uniswapV3Pool,
    rewardToken: _rewardToken,
    amount: _amount,
    positionWrappers: [],
    wrapperTypes: [],
    propToken0: propToken0,
    propToken1: propToken1,
    propFees: propFees,
    epochStart: epochStartTs,
    numEpoch: campaignDurationInHours,
    isOutOfRangeIncentivized: 0,
    boostedReward: 0,
    boostingAddress: settings.zeroAddress,
    additionalData: sha3('pnetwork-incentives')
  }
}
