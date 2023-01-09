import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { Row, Col } from 'react-bootstrap'

import {
  useClaimableInterestsAssetsByAssets,
  useClaimInterestByEpoch,
  useClaimableInterestsAssetsByEpochs
} from '../../../hooks/use-borrowing-manager'

import ClaimByEpochs from '../ClaimByEpochs'
import ClaimByAssets from '../ClaimByAssets'
import Text from '../../base/Text'

const TypeText = styled(Text)`
  color: ${({ theme, active }) => (active === 'true' ? theme.text4 : theme.text1)};
  margin-right: 1rem;
  cursor: pointer;
`

const ClaimInterests = () => {
  const [type, setType] = useState('byAssets')
  const { claim: claimByEpoch } = useClaimInterestByEpoch()
  const claimableInterestsAssetsByEpochs = useClaimableInterestsAssetsByEpochs()
  const claimableInterestAssetsByAssets = useClaimableInterestsAssetsByAssets()

  return (
    <Fragment>
      <Row className="mb-2">
        <Col xs={8} className="d-flex align-items-end">
          <TypeText active={type === 'byAssets' ? 'true' : 'false'} onClick={() => setType('byAssets')}>
            Claim by assets
          </TypeText>
          <TypeText active={type === 'byEpochs' ? 'true' : 'false'} onClick={() => setType('byEpochs')}>
            Claim by epochs
          </TypeText>
        </Col>
      </Row>
      <div className="mb-3">
        {type === 'byEpochs' && <ClaimByEpochs assets={claimableInterestsAssetsByEpochs} claim={claimByEpoch} />}
        {type === 'byAssets' && <ClaimByAssets assets={claimableInterestAssetsByAssets} claim={claimByEpoch} />}
      </div>
    </Fragment>
  )
}

export default ClaimInterests
