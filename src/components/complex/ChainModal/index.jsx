import { Fragment, useState, useEffect, useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useNetwork, useSwitchNetwork, useAccount } from 'wagmi'
import { polygon } from 'wagmi/chains'
import styled from 'styled-components'
import { FaInfoCircle } from 'react-icons/fa'

import { isValidError } from '../../../utils/errors'
import { chainIdToIcon } from '../../../contants'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import Tooltip from '../../base/Tooltip'

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

const ChainModal = ({ show, onClose }) => {
  const activeNetwork = useNetwork()
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
            const isCurrentChain = _chain.id === activeNetwork.chain.id
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
                      <Tooltip
                        placement="bottom"
                        overlayType="popover"
                        text="The pNetwork DAO v2 is currently only available on the Polygon chain"
                      >
                        <div>
                          <StyledFaInfoCircle />
                        </div>
                      </Tooltip>
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
            Your wallet does not support switching networks via external dapps. Try switching network from within your
            wallet instead.
          </Text>
        )}
      </div>
    </Modal>
  )
}

export default ChainModal
