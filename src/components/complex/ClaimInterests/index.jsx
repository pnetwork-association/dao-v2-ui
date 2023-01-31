import React from 'react'
import { Tab } from 'react-bootstrap'

import {
  useClaimableInterestsAssetsByAssets,
  useClaimInterestByEpoch,
  useClaimInterestByEpochsRange,
  useClaimableInterestsAssetsByEpochs
} from '../../../hooks/use-borrowing-manager'

import ClaimByEpochs from '../ClaimByEpochs'
import ClaimByAssets from '../ClaimByAssets'
import Tabs from '../../base/Tabs'

const ClaimInterests = () => {
  const { claim: claimByEpoch } = useClaimInterestByEpoch()
  const { claim: claimByAssets } = useClaimInterestByEpochsRange()
  const claimableInterestsAssetsByEpochs = useClaimableInterestsAssetsByEpochs()
  const claimableInterestAssetsByAssets = useClaimableInterestsAssetsByAssets()

  return (
    <Tabs defaultActiveKey="byAsset" fill>
      <Tab eventKey="byAsset" title="Claim by Assets">
        <ClaimByAssets assets={claimableInterestAssetsByAssets} claim={claimByAssets} />
      </Tab>
      <Tab eventKey="byEpoch" title="Claim by Epoch">
        <ClaimByEpochs assets={claimableInterestsAssetsByEpochs} claim={claimByEpoch} />
      </Tab>
    </Tabs>
  )
}

export default ClaimInterests
