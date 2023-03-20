import styled from 'styled-components'
import { useCallback } from 'react'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import BaseTooltip from 'react-bootstrap/Tooltip'
import Popover from 'react-bootstrap/Popover'

const StyledPopover = styled(Popover)`
  border: 1px solid ${({ theme }) => theme.superLightGray};
`

const Tooltip = ({ id, overlayType = 'tooltip', placement = 'right', text, children }) => {
  const renderOverlay = useCallback(
    (_props) => {
      if (overlayType === 'popover') {
        return (
          <StyledPopover id={id} {..._props}>
            <Popover.Body>{text}</Popover.Body>
          </StyledPopover>
        )
      }

      return (
        <BaseTooltip id={id} {..._props}>
          {text}
        </BaseTooltip>
      )
    },
    [overlayType, id, text]
  )

  return (
    <OverlayTrigger placement={placement} delay={{ show: 250, hide: 400 }} overlay={renderOverlay}>
      {children}
    </OverlayTrigger>
  )
}

export default Tooltip
