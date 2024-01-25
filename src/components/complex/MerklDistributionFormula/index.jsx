import Text from '../../base/Text'
import Input from '../../base/Input'
import { Col, Row } from 'react-bootstrap'

const MerklDistributionFormula = (props) => {
  return (
    <div>
      <Text size="sm">Distribution Formula:</Text>
      <Row xs={1} md={3}>
        <Col>
          <Text size="sm">% PNT</Text>
          <Input {...props[0]} />
        </Col>
        <Col>
          <Text size="sm">% wETH</Text>
          <Input {...props[1]} />
        </Col>
        <Col>
          <Text size="sm">% Fees</Text>
          <Input {...props[2]} />
        </Col>
      </Row>
    </div>
  )
}

export default MerklDistributionFormula
