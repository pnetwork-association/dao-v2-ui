import React from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'

import A from '../components/base/A'

const StyledA = styled(A)`
  font-size: 16px;
`

const toastifyTransaction = (_data, _cb) => {
  toast.success(
    <div>
      <StyledA href={`https://etherscan.io/tx/${_data.hash}`} target="_blank">
        Transaction
      </StyledA>{' '}
      broadcasted!
    </div>
  )

  _data.wait(1).then(() => {
    toast.success(
      <div>
        <StyledA href={`https://etherscan.io/tx/${_data.hash}`} target="_blank">
          Transaction
        </StyledA>{' '}
        confirmed!
      </div>
    )
    _cb?.()
  })
}

export { toastifyTransaction }
