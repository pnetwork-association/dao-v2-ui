import React, { useState } from 'react'
import { Row, Col } from 'react-bootstrap'

import Modal from '../../base/Modal'
import InfoBox from '../../base/InfoBox'
import Button from '../../base/Button'

const Disclaimer = () => {
  const [show, setShow] = useState(true)

  return (
    <Modal show={show} title="Disclaimer" size="md">
      <Row>
        <Col>
          <InfoBox type="warning">
            The DAO v3 is released in beta, and the code is not audited; there could be bugs and additional risks.
            Please don't stake large amounts or assets you can't afford to lose. Despite all safety measures and the
            safeguards we have put in place, there is still risk involved in using it, and we advise you to proceed only
            if you are comfortable with the possibility of encountering bugs, glitches and funds loss.
          </InfoBox>
        </Col>
      </Row>
      <Row className="mt-2 mb-2">
        <Col>
          <Button onClick={() => setShow(false)}>Proceed</Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default Disclaimer
