import React, { useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'

import { useEpochs } from '../../../hooks/use-epochs'
import { useSentinel } from '../../../hooks/use-registration-manager'

import PageTemplate from '../../templates/PageTemplate'
import RegisterSentinelModal from '../../complex/RegisterSentinelModal'
import Line from '../../base/Line'
import Box from '../../base/Box'
import Text from '../../base/Text'
import Icon from '../../base/Icon'
import ButtonSecondary from '../../base/ButtonSecondary'

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 5px;
`

const BoxHeaderLine = styled(Line)`
  margin: 0;
  margin-top: 13px;
`

const RegisterButton = styled(ButtonSecondary)`
  width: 26px;
  height: 26px;
  background: ${({ theme }) => theme.text4};
  border-radius: 50%;
  border: 0;
  margin-left: 10px;
`

const ButtonIcon = styled(Icon)`
  color: ${({ theme }) => theme.white} !important;
`

const Nodes = () => {
  const [showRegisterSentinelModal, setShowRegisterSentinelModal] = useState(false)
  const { formattedCurrentEpoch, formattedCurrentEpochEndAt } = useEpochs()
  const { endEpoch, formattedSentinelAddress, kind, startEpoch } = useSentinel()

  return (
    <PageTemplate>
      <Box>
        <Row>
          <Col className="d-flex">
            <StyledIcon icon="sentinel" />
            <BoxHeaderLine size="lg" />
            <RegisterButton className="float-end" onClick={() => setShowRegisterSentinelModal(true)}>
              <ButtonIcon icon="plus" />
            </RegisterButton>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col xs={6}>
            <Text>Epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedCurrentEpoch}</Text>
          </Col>
        </Row>
        <Line />
        <Row className="mt-2">
          <Col xs={6}>
            <Text>Current epochs ends at</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedCurrentEpochEndAt}</Text>
          </Col>
        </Row>

        <Line />
        <Row>
          <Col xs={6}>
            <Text>Your sentinel</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedSentinelAddress}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={6}>
            <Text>Registration type</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{kind}</Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={8}>
            <Text>Sentinel registration starts at epoch</Text>
          </Col>
          <Col xs={4} className="text-end">
            <Text variant={'text2'}>
              {startEpoch ? '#' : '-'}
              {startEpoch}
            </Text>
          </Col>
        </Row>
        <Line />
        <Row>
          <Col xs={8}>
            <Text>Sentinel registration ends at epoch</Text>
          </Col>
          <Col xs={4} className="text-end">
            <Text variant={'text2'}>
              {endEpoch ? '#' : '-'}
              {endEpoch}
            </Text>
          </Col>
        </Row>
        <Line />
      </Box>
      <RegisterSentinelModal show={showRegisterSentinelModal} onClose={() => setShowRegisterSentinelModal(false)} />
    </PageTemplate>
  )
}

export default Nodes
