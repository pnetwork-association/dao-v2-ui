import React from 'react'
import { Modal } from 'react-bootstrap'
import styled from 'styled-components'

import Text from '../Text'

const StyledModalTitle = styled(Text)`
  font-size: 20px;
  color: ${({ theme }) => theme.text2} !important;
  @media (max-width: 767.98px) {
    font-size: 16px;
  }
`

const StyledBody = styled(Modal.Body)`
  color: ${({ theme }) => theme.text1};
  font-size: 18px;
  padding: 0.25rem 0.75rem;
  background: ${({ theme }) => theme.white};
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
`

const StyledHeader = styled(Modal.Header)`
  background: ${({ theme }) => theme.white};
  border: 0;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  span {
    color: ${({ theme }) => theme.text1};
  }
`

const MyModal = ({ show, title, children, size = 'lg', bodyStyle, onClose }) => {
  return (
    <Modal show={show} aria-labelledby="modal" size={size} centered onHide={onClose}>
      <StyledHeader closeButton>
        <StyledModalTitle>{title}</StyledModalTitle>
      </StyledHeader>
      <StyledBody style={bodyStyle}>{children}</StyledBody>
    </Modal>
  )
}

export default MyModal
