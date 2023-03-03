import { Fragment, useState, useEffect, useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useChainId, useSwitchNetwork, useAccount } from 'wagmi'
import styled from 'styled-components'

import { isValidError } from '../../../utils/errors'

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

const chainIdToIcon = {
  1: 'ethereum.svg',
  56: 'bsc.svg',
  137: 'polygon.svg'
}

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
                <Col xs={8} className="pl-1">
                  <NetworkContainer>
                    <NetworkIcon src={`./assets/svg/${chainIdToIcon[_chain.id]}`} />
                    <Text>{_chain.name}</Text>
                  </NetworkContainer>
                </Col>
                <Col xs={4} className="d-flex justify-content-end align-items-center text-end">
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
