import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { polygon } from 'wagmi/chains'

import settings from '../settings'
import { formatAssetAmount } from '../utils/amount'
import { useStats } from './use-stats'
import { getPntAddressByChainId } from '../utils/preparers/balance'
import { removeUselessDecimals } from '../utils/amount'

const useBalances = () => {
  const { address } = useAccount()
  const activeChainId = useChainId()

  const { data: pntBalanceData } = useBalance({
    token: getPntAddressByChainId(activeChainId),
    address
  })

  const { data: daoPntBalanceData } = useBalance({
    token: settings.contracts.daoPnt,
    address,
    chainId: polygon.id
  })

  const pntBalance = useMemo(
    () => (pntBalanceData ? BigNumber(pntBalanceData?.value.toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [pntBalanceData]
  )
  const daoPntBalance = useMemo(
    () => (daoPntBalanceData ? BigNumber(daoPntBalanceData?.value.toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [daoPntBalanceData]
  )

  return {
    daoPntBalance: removeUselessDecimals(daoPntBalance),
    formattedDaoPntBalance: formatAssetAmount(daoPntBalance, 'daoPNT'),
    formattedPntBalance: formatAssetAmount(pntBalance, 'PNT'),
    pntBalance: removeUselessDecimals(pntBalance)
  }
}

const useVotingPower = () => {
  const { daoPntBalance } = useBalances()
  const { daoPntTotalSupply } = useStats()

  const votingPower = useMemo(
    () => BigNumber(daoPntBalance).dividedBy(daoPntTotalSupply).multipliedBy(100),
    [daoPntBalance, daoPntTotalSupply]
  )

  return {
    formattedVotingPower: formatAssetAmount(votingPower, '%', {
      decimals: 6
    }),
    votingPower
  }
}

export { useBalances, useVotingPower }
