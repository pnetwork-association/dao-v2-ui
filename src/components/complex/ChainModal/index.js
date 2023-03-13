import { Fragment, useState, useEffect, useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useChainId, useSwitchNetwork, useAccount } from 'wagmi'
import { polygon } from 'wagmi/chains'
import styled from 'styled-components'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import { FaInfoCircle } from 'react-icons/fa'

import { isValidError } from '../../../utils/errors'
import { chainIdToIcon } from '../../../contants'

import Modal from '../../base/Modal'
import Text from '../../base/Text'

const NetworkIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  margin-right: 10px;
`

const NetworkContainer = styled.div`
  display: flex;
  align-items: center;
`

const NetworkRow = styled(Row)`
  padding: 0.5rem 0rem;
  border-radius: 10px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.superLightGray};
  }
`

const Point = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 10px;
  background: ${({ theme }) => theme.green};
`

const StyledFaInfoCircle = styled(FaInfoCircle)`
  margin-right: 5px;
  cursor: pointer;
  height: 16px;
  width: 16px;
`

const StyledPopover = styled(Popover)`
  border: 1px solid ${({ theme }) => theme.superLightGray};
`

const ChainModal = ({ show, onClose }) => {
  const activeChainId = useChainId()
  const { chains, error: networkError, switchNetwork } = useSwitchNetwork()
  const { connector: activeConnector } = useAccount()
  const [switchingToChain, setSwitchingToChain] = useState(false)

  const stopSwitching = useCallback(() => {
    setSwitchingToChain(null)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!activeConnector) {
      return
    }

    const stopSwitching = () => {
      setSwitchingToChain(null)
      onClose()
    }

    let provider
    activeConnector?.getProvider?.().then((_provider) => {
      provider = _provider
      provider.on('chainChanged', stopSwitching)
    })

    return () => {
      provider?.removeListener('chainChanged', stopSwitching)
    }
  }, [activeConnector, onClose, stopSwitching])

  useEffect(() => {
    if (networkError && isValidError(networkError)) {
      stopSwitching()
    }
  }, [networkError, stopSwitching])

  return (
    <Modal title="Switch network" show={show} size="md" onClose={onClose}>
      <div className="p-1">
        {switchNetwork ? (
          chains.map((_chain) => {
            const isCurrentChain = _chain.id === activeChainId
            const switching = _chain.id === switchingToChain

            return (
              <NetworkRow
                key={_chain.id}
                className="mt-1"
                onClick={
                  isCurrentChain
                    ? undefined
                    : () => {
                        setSwitchingToChain(_chain.id)
                        switchNetwork(_chain.id)
                      }
                }
              >
                <Col xs={9} className="pl-1">
                  <NetworkContainer>
                    <NetworkIcon src={`./assets/svg/${chainIdToIcon[_chain.id]}`} />
                    <div className="d-flex align-items-center">
                      <Text>{_chain.name}</Text>
                      <Text size="sm">
                        &nbsp;&nbsp;({_chain.id === polygon.id ? 'Native' : 'Compatibility'}&nbsp;mode)&nbsp;&nbsp;
                      </Text>
                      <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 250, hide: 400 }}
                        overlay={
                          <StyledPopover>
                            <Popover.Body>
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                              ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                              ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                              sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                              est laborum.
                            </Popover.Body>
                          </StyledPopover>
                        }
                      >
                        <div>
                          <StyledFaInfoCircle />
                        </div>
                      </OverlayTrigger>
                    </div>
                  </NetworkContainer>
                </Col>
                <Col xs={3} className="d-flex justify-content-end align-items-center text-end">
                  {isCurrentChain && (
                    <Fragment>
                      <Text size="sm">Connected</Text>
                      <Point />
                    </Fragment>
                  )}
                  {switching && <Text size="sm">Confirm in Wallet</Text>}
                </Col>
              </NetworkRow>
            )
          })
        ) : (
          <Text>
            Your wallet does not support switching networks. Try switching networks from within your wallet instead.
          </Text>
        )}
      </div>
    </Modal>
  )
}

export default ChainModal
