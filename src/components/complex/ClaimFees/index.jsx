import React from 'react'
import { Tab } from 'react-bootstrap'

import {
  useClaimableFeesAssetsByAssets,
  useClaimableFeesAssetsByEpochs,
  useClaimFeeByEpoch,
  useClaimFeeByEpochsRange
} from '../../../hooks/use-fees-manager'

import ClaimByEpochs from '../ClaimByEpochs'
import ClaimByAssets from '../ClaimByAssets'
import Tabs from '../../base/Tabs'

const ClaimFees = ({ type }) => {
  const { claim: claimByEpoch } = useClaimFeeByEpoch()
  const { claim: claimByAssets } = useClaimFeeByEpochsRange()
  const claimableFeesAssetsByEpochs = useClaimableFeesAssetsByEpochs({ type })
  const claimableFeesAssetsByAssets = useClaimableFeesAssetsByAssets({ type })

  return (
    <Tabs defaultActiveKey="byAsset" fill>
      <Tab eventKey="byAsset" title="Claim by Assets">
        <ClaimByAssets assets={claimableFeesAssetsByAssets} claim={claimByAssets} />
      </Tab>
      <Tab eventKey="byEpoch" title="Claim by Epoch">
        <ClaimByEpochs assets={claimableFeesAssetsByEpochs} claim={claimByEpoch} />
      </Tab>
    </Tabs>
  )
}

export default ClaimFees
