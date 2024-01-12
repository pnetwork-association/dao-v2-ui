import React from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { mainnet } from 'wagmi/chains'

import { getExplorerUrlByChainId } from './explorer'

import A from '../components/base/A'
import Text from '../components/base/Text'

const StyledA = styled(A)`
  font-size: 17px !important;
  @media (max-width: 767.98px) {
    font-size: 15px !important;
  }
`

const toastifyTransaction = (_data, _opts = {}, _cb) => {
  const { chainId = mainnet.id } = _opts

  toast.success(
    <div>
      <StyledA href={`${getExplorerUrlByChainId(chainId)}/tx/${_data.hash}`} target="_blank">
        Transaction
      </StyledA>{' '}
      <Text size="lg" variant="white">
        broadcasted!
      </Text>
    </div>
  )

  _data.wait(1).then(() => {
    toast.success(
      <div>
        <StyledA href={`${getExplorerUrlByChainId(chainId)}/tx/${_data.hash}`} target="_blank">
          Transaction
        </StyledA>{' '}
        <Text size="lg" variant="white">
          confirmed!
        </Text>
      </div>
    )
    _cb?.()
  })
}

export { toastifyTransaction }
