import { useContext, useEffect, useRef, useState } from 'react'
import Toast from 'react-bootstrap/Toast'
import { Web3SettingsButton } from 'react-web3-settings'
import { ToastContainer } from 'react-bootstrap'

import { ProposalsContext } from '../../context/Proposals'
import styled from 'styled-components'

const Flex = styled.div`
  display: flex;
  align-item: center;
  justify-content: flex-end;
  @media (max-width: 1400px) {
    position: relative;
    bottom: 0;
  }
`

const RpcErrorToast = () => {
  const proposalsContext = useContext(ProposalsContext)
  const [show, setShow] = useState(false)
  const proposalsLength = useRef(0)

  useEffect(() => {
    const setShowTrue = () => {
      if (proposalsLength.current === 0) setShow(true)
    }
    if (proposalsContext.proposals.length === 0) {
      setTimeout(setShowTrue, 10000)
    } else setShow(false)
  }, [proposalsContext])

  useEffect(() => {
    if (proposalsContext.proposals.length !== proposalsLength.current)
      proposalsLength.current = proposalsContext.proposals.length
  }, [proposalsContext])

  return (
    <ToastContainer position="bottom-end" className="pb-5 position-fixed">
      <Toast onClose={() => setShow(false)} show={show} bg="warning" className="m-3">
        <Toast.Header>
          <strong className="me-auto">Possible RPC Endopoint Error</strong>
        </Toast.Header>
        <Toast.Body>If no proposals are displayed you can try to set a custom RPC Endpoint</Toast.Body>
        <Flex>
          <Web3SettingsButton className={'api-button-toast'} text="Settings" />
        </Flex>
      </Toast>
    </ToastContainer>
  )
}

export default RpcErrorToast
