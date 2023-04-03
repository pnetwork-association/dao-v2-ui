import React from 'react'
import { Tab } from 'react-bootstrap'

import {
  useClaimableRewardsAssetsByAssets,
  useClaimRewardByEpoch,
  useClaimRewardByEpochsRange,
  useClaimableRewardsAssetsByEpochs
} from '../../../hooks/use-lending-manager'

import ClaimByEpochs from '../ClaimByEpochs'
import ClaimByAssets from '../ClaimByAssets'
import Tabs from '../../base/Tabs'

const ClaimRewards = () => {
  const { claim: claimByEpoch } = useClaimRewardByEpoch()
  const { claim: claimByAssets } = useClaimRewardByEpochsRange()
  const claimableRewardsAssetsByEpochs = useClaimableRewardsAssetsByEpochs()
  const claimableRewardAssetsByAssets = useClaimableRewardsAssetsByAssets()

  return (
    <Tabs defaultActiveKey="byAsset" fill>
      <Tab eventKey="byAsset" title="Claim by Assets">
        <ClaimByAssets assets={claimableRewardAssetsByAssets} claim={claimByAssets} />
      </Tab>
      <Tab eventKey="byEpoch" title="Claim by Epoch">
        <ClaimByEpochs assets={claimableRewardsAssetsByEpochs} claim={claimByEpoch} />
      </Tab>
    </Tabs>
  )
}

export default ClaimRewards
