import React, { useState } from 'react'
import { Row, Col } from 'react-bootstrap'

import Modal from '../../base/Modal'
import Button from '../../base/Button'
import Text from '../../base/Text'

const Disclaimer = () => {
  const [show, setShow] = useState(true)

  return (
    <Modal show={show} title="Welcome to the new pNetwork DAO" size="md">
      <Row>
        <Col>
          <Text>
            The new pNetwork DAO is hosted on Gnosis Chain and implements new features:
            <br />
            - Stake from Gnosis, Bsc, Polygon, Ethereum chains.
            <br />
            - Vote to accrue rewards up to 27% APY.
            <br />
            - Lend your staked PNT.
            <br />- Borrow staked PNT to start your own node.
          </Text>
        </Col>
      </Row>
      <Row className="mt-2 mb-2">
        <Col>
          <Button onClick={() => setShow(false)}>Get started</Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default Disclaimer
