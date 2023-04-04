import { useEffect, useState } from 'react'
import axios from 'axios'
import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useContractReads, erc20ABI, useChainId } from 'wagmi'
import { polygon } from 'wagmi/chains'

import settings from '../settings'
import { formatAssetAmount } from '../utils/amount'
import { useEpochs } from './use-epochs'
import { getPntAddressByChainId } from '../utils/preparers/balance'

const useStats = () => {
  const [daoPntOnBscTotalSupply, setDaoPntOnBscTotalSupply] = useState(0)
  const activeChainId = useChainId()

  const {
    currentEpoch,
    currentEpochEndsAt,
    currentEpochEndsIn,
    currentEpochStartedAt,
    formattedCurrentEpoch,
    formattedCurrentEpochEndAt,
    formattedCurrentEpochStartedAt
  } = useEpochs()

  const { data } = useContractReads({
    cacheTime: 1000 * 60 * 2,
    contracts: [
      {
        address: getPntAddressByChainId(activeChainId),
        abi: erc20ABI,
        functionName: 'totalSupply',
        args: []
      },
      {
        address: settings.contracts.daoPnt,
        abi: erc20ABI,
        functionName: 'totalSupply',
        args: [],
        chainId: polygon.id
      }
    ]
  })

  useEffect(() => {
    const fetchDaoPntOnBscTotalSupply = async () => {
      try {
        const { data } = await axios.get(
          `https://pnetwork.watch:443/api/datasources/proxy/1/query?db=pnetwork-volumes-1&q=SELECT+LAST%28%22daopnt_supply%22%29+FROM+%22daopnt_supply%22+WHERE+%28%22chain%22+%3D+%27bsc%27%29`
        )
        setDaoPntOnBscTotalSupply(data.results[0].series[0].values[0][1])
      } catch (_err) {
        console.error(_err)
      }
    }

    fetchDaoPntOnBscTotalSupply()
  }, [])

  const pntTotalSupply = useMemo(
    () => (data && data[0] ? BigNumber(data[0].toString()).dividedBy(10 ** 18) : BigNumber(null)),
    [data]
  )
  const daoPntTotalSupply = useMemo(
    () =>
      data && data[1]
        ? BigNumber(data[1].toString())
            .dividedBy(10 ** 18)
            .plus(daoPntOnBscTotalSupply ? daoPntOnBscTotalSupply : 0)
        : BigNumber(null),
    [data, daoPntOnBscTotalSupply]
  )
  const percentageStakedPnt = useMemo(
    () => daoPntTotalSupply.dividedBy(pntTotalSupply).multipliedBy(100),
    [pntTotalSupply, daoPntTotalSupply]
  )

  return {
    currentEpoch,
    currentEpochEndsAt,
    currentEpochEndsIn,
    currentEpochStartedAt,
    daoPntTotalSupply: daoPntTotalSupply.toFixed(),
    formattedCurrentEpoch,
    formattedCurrentEpochEndAt,
    formattedCurrentEpochStartedAt,
    formattedDaoPntTotalSupply: formatAssetAmount(daoPntTotalSupply, 'daoPNT', {
      decimals: 0
    }),
    formattedPercentageStakedPnt: formatAssetAmount(percentageStakedPnt, '%', {
      decimals: 2
    }),
    formattedPntTotalSupply: formatAssetAmount(pntTotalSupply, 'PNT'),
    percentageStakedPnt: percentageStakedPnt.toFixed(),
    pntTotalSupply: pntTotalSupply.toFixed()
  }
}

export { useStats }
