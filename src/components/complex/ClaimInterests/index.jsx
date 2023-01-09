import React from 'react'

import { useClaimInterest } from '../../../hooks/use-borrowing-manager'

import Claim from '../Claim'

const ClaimInterests = ({ assetsByEpochs }) => {
  const { claim } = useClaimInterest()

  return <Claim assetsByEpochs={assetsByEpochs} claim={claim} />
}

export default ClaimInterests
