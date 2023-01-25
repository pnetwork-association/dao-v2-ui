import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useAccount, useBalance, useContractRead, erc20ABI } from 'wagmi'

import settings from '../settings'
import { formatAssetAmount } from '../utils/amount'

const useBalances = () => {
  const { address } = useAccount()

  const { data: pntBalanceData } = useBalance({
    token: settings.contracts.pnt,
    address
  })

  const { data: daoPntBalanceData } = useBalance({
    token: settings.contracts.daoPnt,
    address
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
    daoPntBalance: daoPntBalance.toFixed(),
    formattedDaoPntBalance: formatAssetAmount(daoPntBalance, 'daoPNT'),
    formattedPntBalance: formatAssetAmount(pntBalance, 'PNT'),
    pntBalance: pntBalance.toFixed()
  }
}

const useVotingPower = () => {
  const { daoPntBalance } = useBalances()

  const { data } = useContractRead({
    address: settings.contracts.daoPnt,
    abi: erc20ABI,
    functionName: 'totalSupply',
    args: []
  })

  const daoPntTotalSupply = useMemo(() => BigNumber(data?.toString()).dividedBy(10 ** 18), [data])

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
