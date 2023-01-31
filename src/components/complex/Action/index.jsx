import BigNumber from 'bignumber.js'
import React from 'react'
import styled from 'styled-components'

import settings from '../../../settings'
import { getAddressExplorerLink } from '../../../utils/explorer'

import { formatAssetAmount } from '../../../utils/amount'
import A from '../../base/A'
import Text from '../../base/Text'

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
        <span>
          <Text variant="text2">Transfer&nbsp;</Text>
          <Text>of&nbsp;</Text>
          <Text variant="text2">{amount}&nbsp;</Text>
          <AssetLogo src={asset.logo} />
          <Text>&nbsp;&nbsp;from&nbsp;</Text>
          <A href={getAddressExplorerLink(from)} target="_blank">
            {fromNickname}
          </A>
          <Text>&nbsp;to&nbsp;</Text>
          <A href={getAddressExplorerLink(to)} target="_blank">
            {toNickname}
          </A>
        </span>
      </div>
    )
  }

  if (action.name === 'StartVote') {
    const { creator, creatorNickname, metadata } = action

    const metadataWithoutIpfsLink = metadata ? metadata.split(' ').slice(0, -1).join(' ') : metadata

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerLink(creator)} target="_blank">
            {creatorNickname}
          </A>
          <Text>&nbsp;opened a new proposal:&nbsp;</Text>
          <Text variant="text2">{metadataWithoutIpfsLink}</Text>
        </span>
      </div>
    )
  }

  if (action.name === 'CastVote') {
    const { voter, voterNickname, supports, voteId } = action

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerLink(voter)} target="_blank">
            {voterNickname}
          </A>
          <Text>&nbsp;voted&nbsp;</Text>
          <Text variant="text2">&nbsp;{supports ? 'YES' : 'NO'}&nbsp;</Text>
          <Text>&nbsp;to vote&nbsp;</Text>
          <Text variant="text2">{voteId}</Text>
        </span>
      </div>
    )
  }

  if (action.name === 'Staked') {
    const { formattedAmount, formattedDuration, receiver, receiverNickname } = action

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerLink(receiver)} target="_blank">
            {receiverNickname}
          </A>
          <Text>&nbsp;staked&nbsp;</Text>
          <Text variant="text2">{formattedAmount}&nbsp;</Text>
          <AssetLogo src={'assets/svg/PNT.svg'} />
          <Text>&nbsp;&nbsp;for&nbsp;</Text>
          <Text variant="text2">{formattedDuration}</Text>
        </span>
      </div>
    )
  }

  if (action.name === 'Lended') {
    const { startEpoch, endEpoch, formattedAmount, lender, lenderNickname } = action

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerLink(lender)} target="_blank">
            {lenderNickname}
          </A>
          <Text>&nbsp;lended&nbsp;</Text>
          <Text variant="text2">{formattedAmount}&nbsp;</Text>
          <AssetLogo src={'assets/svg/PNT.svg'} />
          <Text>&nbsp;&nbsp;for&nbsp;</Text>
          <Text variant="text2">{endEpoch - startEpoch}</Text>
          <Text variant="text2">&nbsp;epochs</Text>
        </span>
      </div>
    )
  }

  return <div></div>
}

export default Action
