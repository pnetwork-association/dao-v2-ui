// import axios from 'axios'
import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useContractReads, erc20ABI } from 'wagmi'

import settings from '../settings'
import { formatAssetAmount } from '../utils/amount'
import { useBalances } from './use-balances'
import { useAccountLendedAmountInTheCurrentEpoch, useAccountLoanEndEpoch } from './use-borrowing-manager'
import { useEpochs } from './use-epochs'

const useOverview = () => {
  // const [pendingRewards, setPendingRewards] = useState([])
  const { pntBalance, daoPntBalance, formattedPntBalance, formattedDaoPntBalance } = useBalances()
  const { value: lendedAmountCurrentEpoch, formattedValue: formattedLendedAmountCurrentEpoch } =
    useAccountLendedAmountInTheCurrentEpoch()
  const loanEndEpoch = useAccountLoanEndEpoch()
  const { currentEpoch, formattedCurrentEpoch } = useEpochs()

  /*useEffect(() => {
    const fetchPendingRewards = async () => {
      try {
        const { data } = awaitaxios.get(`https://widgets.eidoo.app/api/get_rewards?address=${address}`)
        console.log(data)
      } catch(_err) {
        console.error(_err)
      }
    }

    fetchPendingRewards()
  }, [address])*/

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
  const votingPower = useMemo(
    () => BigNumber(daoPntBalance).dividedBy(daoPntTotalSupply).multipliedBy(100),
    [daoPntBalance, daoPntTotalSupply]
  )
  const percentageStakedPnt = useMemo(
    () => daoPntTotalSupply.dividedBy(pntTotalSupply).multipliedBy(100),
    [pntTotalSupply, daoPntTotalSupply]
  )

  return {
    currentEpoch,
    daoPntBalance,
    daoPntTotalSupply: daoPntTotalSupply.toFixed(),
    formattedCurrentEpoch,
    formattedDaoPntBalance,
    formattedDaoPntTotalSupply: formatAssetAmount(daoPntTotalSupply, 'daoPNT'),
    formattedLendedAmountCurrentEpoch,
    formattedPercentageStakedPnt: formatAssetAmount(percentageStakedPnt, '%', {
      decimals: 2
    }),
    formattedPntBalance,
    formattedPntTotalSupply: formatAssetAmount(pntTotalSupply, 'PNT'),
    formattedVotingPower: formatAssetAmount(votingPower, '%', {
      decimals: 6
    }),
    lendedAmountCurrentEpoch,
    loanEndEpoch,
    percentageStakedPnt: percentageStakedPnt.toFixed(),
    pntBalance,
    pntTotalSupply: pntTotalSupply.toFixed(),
    votingPower: votingPower.toFixed()
  }
}

export { useOverview }
