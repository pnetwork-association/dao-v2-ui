import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useAccount, useBalance } from 'wagmi'

import settings from '../settings'
import { formatAssetAmount } from '../utils/amount'
import { useStats } from './use-stats'

const useBalances = () => {
  const { address } = useAccount()

  const { data: pntBalanceData } = useBalance({
    token: settings.contracts.pnt,
    address: address
  })

  const { data: daoPntBalanceData } = useBalance({
    token: settings.contracts.daoPnt,
    address: address
  })

  const pntBalance = useMemo(
    () => (pntBalanceData ? BigNumber(pntBalanceData?.value.toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [pntBalanceData]
  )
  const daoPntBalance = useMemo(
    () => (daoPntBalanceData ? BigNumber(daoPntBalanceData?.value.toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [daoPntBalanceData]
  )

  // const daoPntBalance = daoPntBalanceData ? BigNumber(daoPntBalanceData?.value.toString()).dividedBy(10 ** 18) : BigNumber(null)
  return {
    daoPntBalance: daoPntBalance,
    formattedDaoPntBalance: formatAssetAmount(daoPntBalance, 'daoPNT'),
    formattedPntBalance: formatAssetAmount(pntBalance, 'PNT'),
    pntBalance: pntBalance
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
