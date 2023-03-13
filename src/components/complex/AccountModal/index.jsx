import { useCallback, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useAccount, useDisconnect } from 'wagmi'
import styled from 'styled-components'

import { useNickname } from '../../../hooks/use-nickname'
import { slicer } from '../../../utils/address'

import Modal from '../../base/Modal'
import Avatar from '../../base/Avatar'
import Text from '../../base/Text'
import Tooltip from '../../base/Tooltip'

const StyledAvatar = styled(Avatar)`
  border-radius: 50%;
`

const NicknameText = styled(Text)`
  font-weight: bold;
`

const AddressText = styled(Text)`
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.bg2};
    padding: 10px 10px;
    border-radius: 5px;
  }
`

const DisconnectText = styled(Text)`
  cursor: pointer;
`

const AccountModal = ({ show, onClose }) => {
  const { address } = useAccount()
  const nickname = useNickname()
  const [tooltipText, setTooltipText] = useState('Copy to clipboard!')
  const { disconnect } = useDisconnect({})

  const onCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(address).catch(console.error)
    setTooltipText('Copied!')
    setTimeout(() => {
      setTooltipText('Copy to clipboard!')
    }, 2000)
  }, [address])

  const onDisconnect = useCallback(() => {
    onClose()
    disconnect()
  }, [onClose, disconnect])

  return (
    <Modal show={show} size="sm" onClose={onClose}>
      <Row>
        <Col className="text-center">{address && <StyledAvatar address={address} />}</Col>
      </Row>
      <Row className="mt-1">
        <Col className="text-center">
          <NicknameText variant="text2" size="lg">
            {nickname}
          </NicknameText>
        </Col>
      </Row>
      <Row>
        <Col className="text-center">
          <Tooltip id="address-tooltip" text={tooltipText}>
            <AddressText id="address" size="sm" onClick={onCopyToClipboard}>
              ({address ? slicer(address) : '-'})
            </AddressText>
          </Tooltip>
        </Col>
      </Row>
      <Row className="mt-4 mb-2">
        <Col className="text-center">
          <DisconnectText variant="text2" size="sm" onClick={onDisconnect}>
            Disconnect
          </DisconnectText>
        </Col>
      </Row>
    </Modal>
  )
}

export default AccountModal
