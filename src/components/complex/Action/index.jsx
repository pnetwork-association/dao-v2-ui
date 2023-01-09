import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import settings from '../../../settings'
import { slicer } from '../../../utils/address'
import { getAddressExplorerLink } from '../../../utils/explorer'

import Text from '../../base/Text'
import A from '../../base/A'
import { ethers } from 'ethers'
import { formatAssetAmount } from '../../../utils/amount'

const Address = styled(A)`
  font-size: 15px;
`

const AssetLogo = styled.img`
  width: 24px;
  height: 24px;
  @media (max-width: 767.98px) {
    width: 16px;
    height: 16px;
  }
`

const Action = ({ action }) => {
  if (action.name === 'Transfer') {
    const { from, to, value, address } = action
    const asset = settings.assets.find((_asset) => _asset.address.toLowerCase() === address.toLowerCase())
    const amount = formatAssetAmount(BigNumber(value).dividedBy(10 ** 18), asset.symbol)

    return (
      <div className="d-flex">
        <Text variant="text2">Transfer&nbsp;</Text>
        <Text>of&nbsp;</Text>
        <Text variant="text2">{amount}&nbsp;</Text>
        <AssetLogo src={asset.logo} />
        <Text>&nbsp;&nbsp;from&nbsp;</Text>
        <Address href={getAddressExplorerLink(from)} target="_blank">
          {slicer(ethers.utils.getAddress(from))}
        </Address>
        <Text>&nbsp;to&nbsp;</Text>
        <Address href={getAddressExplorerLink(to)} target="_blank">
          {slicer(ethers.utils.getAddress(to))}
        </Address>
      </div>
    )
  }

  return <div></div>
}

export default Action
