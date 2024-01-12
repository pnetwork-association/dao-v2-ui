import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { erc20Abi } from 'viem' 
import { polygon } from 'wagmi/chains'

import settings from '../settings'
import { formatAssetAmount } from '../utils/amount'
import { useEpochs } from './use-epochs'

const useStats = () => {
  const {
    currentEpoch,
    currentEpochEndsAt,
    currentEpochEndsIn,
    currentEpochStartedAt,
    formattedCurrentEpoch,
    formattedCurrentEpochEndAt,
    formattedCurrentEpochStartedAt
  } = useEpochs()

  const { data } = useReadContracts({
    watch: true,
    contracts: [
      {
        address: settings.contracts.pntOnEthereum,
        abi: erc20Abi,
        functionName: 'totalSupply',
        args: [],
        chainId: mainnet.id
      },
      {
        address: settings.contracts.daoPnt,
        abi: erc20Abi,
        functionName: 'totalSupply',
        args: [],
        chainId: polygon.id
      }
    ]
  })

  /*useEffect(() => {
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
  }, [])*/

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
      decimals: 2,
      forceDecimals: true
    }),
    formattedPntTotalSupply: formatAssetAmount(pntTotalSupply, 'PNT'),
    percentageStakedPnt: percentageStakedPnt.toFixed(),
    pntTotalSupply: pntTotalSupply.toFixed()
  }
}

export { useStats }
