import React, { useMemo } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useSwitchNetwork } from 'wagmi'
import styled from 'styled-components'

import { chainIdToIcon } from '../../../contants'

import Select from '../../base/Select'
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
`

const FALLBACK_CHAINS = [
  {
    id: 1,
    name: 'Ethereum'
  },
  {
    id: 137,
    name: 'Polygon'
  },
  {
    id: 56,
    name: 'BNB Smart Chain'
  }
]

const ChainSelection = ({ onChange }) => {
  const { chains } = useSwitchNetwork()

  const options = useMemo(() => {
    const effectiveChains = chains.length > 0 ? chains : FALLBACK_CHAINS
    return effectiveChains.map((_chain) => {
      return {
        option: _chain.id,
        component: (
          <NetworkRow key={_chain.id} className="mt-1">
            <Col xs={8} className="pl-1">
              <NetworkContainer>
                <NetworkIcon src={`./assets/svg/${chainIdToIcon[_chain.id]}`} />
                <Text>{_chain.name}</Text>
              </NetworkContainer>
            </Col>
            <Col xs={4} className="d-flex justify-content-end align-items-center text-end"></Col>
          </NetworkRow>
        )
      }
    })
  }, [chains])

  return <Select options={options} onSelect={onChange} />
}

export default ChainSelection
