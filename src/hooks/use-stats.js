// import axios from 'axios'
import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useContractReads, erc20ABI } from 'wagmi'

import settings from '../settings'
import { formatAssetAmount } from '../utils/amount'
import { useEpochs } from './use-epochs'

const useStats = () => {
  const { currentEpoch, formattedCurrentEpoch, formattedCurrentEpochEndAt } = useEpochs()

  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: settings.contracts.pnt,
        abi: erc20ABI,
        functionName: 'totalSupply',
        args: []
      },
      {
        address: settings.contracts.daoPnt,
        abi: erc20ABI,
        functionName: 'totalSupply',
        args: []
      }
    ]
  })

  const pntTotalSupply = useMemo(
    () => (data && data[0] ? BigNumber(data[0].toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [data]
  )
  const daoPntTotalSupply = useMemo(
    () => (data && data[1] ? BigNumber(data[1].toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [data]
  )
  const percentageStakedPnt = useMemo(
    () => daoPntTotalSupply.dividedBy(pntTotalSupply).multipliedBy(100),
    [pntTotalSupply, daoPntTotalSupply]
  )

  return {
    currentEpoch,
    daoPntTotalSupply: daoPntTotalSupply.toFixed(),
    formattedCurrentEpoch,
    formattedCurrentEpochEndAt,
    formattedDaoPntTotalSupply: formatAssetAmount(daoPntTotalSupply, 'daoPNT'),
    formattedPercentageStakedPnt: formatAssetAmount(percentageStakedPnt, '%', {
      decimals: 2
    }),
    formattedPntTotalSupply: formatAssetAmount(pntTotalSupply, 'PNT'),
    percentageStakedPnt: percentageStakedPnt.toFixed(),
    pntTotalSupply: pntTotalSupply.toFixed()
  }
}

export { useStats }
