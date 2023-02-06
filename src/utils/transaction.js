import React from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'

import A from '../components/base/A'
import Text from '../components/base/Text'

const StyledA = styled(A)`
  font-size: 17px !important;
  @media (max-width: 767.98px) {
    font-size: 15px !important;
  }
`

const toastifyTransaction = (_data, _cb) => {
  toast.success(
    <div>
      <StyledA href={`https://etherscan.io/tx/${_data.hash}`} target="_blank">
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
        <StyledA href={`https://etherscan.io/tx/${_data.hash}`} target="_blank">
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
