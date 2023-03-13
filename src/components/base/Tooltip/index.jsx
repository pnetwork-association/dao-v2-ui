import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import BaseTooltip from 'react-bootstrap/Tooltip'

const Tooltip = ({ id, text, children }) => {
  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={<BaseTooltip id={id}>{text}</BaseTooltip>}
    >
      {children}
    </OverlayTrigger>
  )
}

export default Tooltip
