import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { polygon } from 'wagmi/chains'

import settings from '../settings'
import { formatAssetAmount } from '../utils/amount'
import { useStats } from './use-stats'
import { getPntAddressByChainId } from '../utils/preparers/balance'
import { removeUselessDecimals } from '../utils/amount'

const usePntBalance = () => {
  const { address } = useAccount()
  const activeChainId = useChainId()

  const { data: pntBalanceData } = useBalance({
    token: getPntAddressByChainId(activeChainId),
    address,
    watch: true
  })

  const pntBalance = useMemo(
    () => (pntBalanceData ? BigNumber(pntBalanceData?.value.toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [pntBalanceData]
  )

  return {
    amount: pntBalance.isNaN() ? null : removeUselessDecimals(pntBalance),
    formattedAmount: formatAssetAmount(pntBalance, 'PNT')
  }
}

const useDaoPntBalance = () => {
  const { address } = useAccount()

  const { data: daoPntBalanceData } = useBalance({
    token: settings.contracts.daoPnt,
    address,
    chainId: polygon.id,
    watch: true
  })

  const daoPntBalance = useMemo(
    () => (daoPntBalanceData ? BigNumber(daoPntBalanceData?.value.toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [daoPntBalanceData]
  )

  return {
    amount: daoPntBalance.isNaN() ? null : removeUselessDecimals(daoPntBalance),
    formattedAmount: formatAssetAmount(daoPntBalance, 'daoPNT')
  }
}

const useBalances = () => {
  const pntBalance = usePntBalance()
  const daoPntBalance = useDaoPntBalance()

  return {
    daoPntBalance: daoPntBalance.amount,
    formattedDaoPntBalance: daoPntBalance.formattedAmount,
    formattedPntBalance: pntBalance.formattedAmount,
    pntBalance: pntBalance.amount
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

export { useBalances, useDaoPntBalance, usePntBalance, useVotingPower }
