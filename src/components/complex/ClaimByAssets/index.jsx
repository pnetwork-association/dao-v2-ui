import React, { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import { gnosis } from 'wagmi/chains'

import { toastifyTransaction } from '../../../utils/transaction'

import Asset from '../Asset'
import Box from '../../base/Box'

const ClaimByAssets = ({ assets, claim }) => {
  const [loading, setLoading] = useState(null)
  const [claimed, setClaimed] = useState(null)

  const onClaim = useCallback(
    async (_address) => {
      try {
        setLoading(_address)
        toastifyTransaction(await claim(_address), { chainId: gnosis.id }, () => {
          setLoading(null)
          setClaimed(_address)
        })
      } catch (_err) {
        setLoading(null)
        console.error(_err)
      }
    },
    [claim]
  )

  return (
    <Box style={{ padding: 0 }}>
      {assets.map((_asset, _index) => (
        <Asset
          key={`claim_asset_${_index}`}
          className={`align-items-center ${_index > 0 ? 'mt-3' : ''}`}
          withButton={BigNumber(_asset.amount).isGreaterThan(0) && claimed !== _asset.address}
          buttonText={'Claim'}
          loading={loading === _asset.address}
          formattedAmount={_asset.formattedAmount}
          formattedCountervalue={_asset.formattedCountervalue}
          logo={_asset.logo}
          name={_asset.name}
          symbol={_asset.symbol}
          onClickButton={() => onClaim(_asset.address)}
        />
      ))}
    </Box>
  )
}

export default ClaimByAssets
