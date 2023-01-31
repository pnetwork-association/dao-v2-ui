import React, { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'

import { toastifyTransaction } from '../../../utils/transaction'
import { useEpochs } from '../../../hooks/use-epochs'

import Text from '../../base/Text'
import Asset from '../Asset'
import Accordion from '../../base/Accordion'
//import { formatCurrency } from '../../../utils/amount'

const ClaimByEpochs = ({ assets, claim }) => {
  const { currentEpoch } = useEpochs()
  const [loading, setLoading] = useState(null)
  const [claimed, setClaimed] = useState(null)

  const orderedAssets = useMemo(() => {
    if (!assets) return []

    return Object.keys(assets)
      .reverse()
      .map((_epoch, _index) => assets[_epoch])
  }, [assets])

  const onClaim = useCallback(
    async (_address, _epoch) => {
      try {
        setLoading(`${_epoch}_${_address}`)
        toastifyTransaction(await claim(_address, _epoch), () => {
          setLoading(null)
          setClaimed(`${_epoch}_${_address}`)
        })
      } catch (_err) {
        setLoading(null)
        console.error(_err)
      }
    },
    [claim]
  )

  return (
    <Accordion defaultActiveKey="0">
      {orderedAssets.map((_assets, _index) => {
        const epoch = orderedAssets.length - _index - 1
        return (
          <Accordion.Item
            key={`claim_${epoch}`}
            eventKey={_index}
            last={_index === orderedAssets.length - 1 ? 'true' : 'false'}
          >
            <Accordion.Header>
              <Text variant="text2">Epoch #{epoch}</Text>
            </Accordion.Header>
            <Accordion.Body>
              {_assets.map((_asset, _index) => (
                <Asset
                  key={`claim_${epoch}_${_index}`}
                  className={`align-items-center ${_index > 0 ? 'mt-3' : ''}`}
                  withButton={
                    BigNumber(_asset.amount).isGreaterThan(0) &&
                    epoch <= currentEpoch &&
                    claimed !== `${epoch}_${_asset.address}`
                  }
                  buttonText={'Claim'}
                  loading={loading === `${epoch}_${_asset.address}`}
                  formattedAmount={_asset.formattedAmount}
                  formattedCountervalue={_asset.formattedCountervalue}
                  logo={_asset.logo}
                  name={_asset.name}
                  symbol={_asset.symbol}
                  onClickButton={() => onClaim(_asset.address, epoch)}
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

export default ClaimByEpochs
