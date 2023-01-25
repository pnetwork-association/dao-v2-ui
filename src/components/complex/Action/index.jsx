import BigNumber from 'bignumber.js'
import React from 'react'
import styled from 'styled-components'

import settings from '../../../settings'
import { getAddressExplorerLink } from '../../../utils/explorer'

import { formatAssetAmount } from '../../../utils/amount'
import A from '../../base/A'
import Text from '../../base/Text'

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
    const { from, fromNickname, to, toNickname, value, address } = action
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
          {fromNickname}
        </Address>
        <Text>&nbsp;to&nbsp;</Text>
        <Address href={getAddressExplorerLink(to)} target="_blank">
          {toNickname}
        </Address>
      </div>
    )
  }

  if (action.name === 'StartVote') {
    const { creator, creatorNickname, metadata } = action

    return (
      <div className="d-flex">
        <span>
          <Address href={getAddressExplorerLink(creator)} target="_blank">
            {creatorNickname}
          </Address>
          <Text>&nbsp;opened a new proposal:&nbsp;</Text>
          <Text variant="text2">{metadata}</Text>
        </span>
      </div>
    )
  }

  if (action.name === 'Staked') {
    const { formattedAmount, formattedDuration, receiver, receiverNickname } = action

    return (
      <div className="d-flex">
        <span>
          <Address href={getAddressExplorerLink(receiver)} target="_blank">
            {receiverNickname}
          </Address>
          <Text>&nbsp;staked&nbsp;</Text>
          <Text variant="text2">{formattedAmount}&nbsp;</Text>
          <AssetLogo src={'assets/svg/PNT.svg'} />
          <Text>&nbsp;&nbsp;for&nbsp;</Text>
          <Text variant="text2">{formattedDuration}</Text>
        </span>
      </div>
    )
  }

  return <div></div>
}

export default Action
