import BigNumber from 'bignumber.js'
import React from 'react'
import styled from 'styled-components'
import { useChainId } from 'wagmi'

import settings from '../../../settings'
import { getAddressExplorerUrl } from '../../../utils/explorer'

import { formatAssetAmount } from '../../../utils/amount'
import A from '../../base/A'
import Text from '../../base/Text'
import { BORROWING_SENTINEL } from '../../../contants'

const AssetLogo = styled.img`
  width: 24px;
  height: 24px;
  @media (max-width: 767.98px) {
    width: 16px;
    height: 16px;
  }
`

const Action = ({ action }) => {
  const activeChainId = useChainId()

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
          <A href={getAddressExplorerUrl(from, { chainId: activeChainId })} target="_blank">
            {fromNickname}
          </A>
          <Text>&nbsp;to&nbsp;</Text>
          <A href={getAddressExplorerUrl(to, { chainId: activeChainId })} target="_blank">
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
          <A href={getAddressExplorerUrl(creator, { chainId: activeChainId })} target="_blank">
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
          <A href={getAddressExplorerUrl(voter, { chainId: activeChainId })} target="_blank">
            {voterNickname}
          </A>
          <Text>&nbsp;voted&nbsp;</Text>
          <Text variant="text2">&nbsp;{supports ? 'YES' : 'NO'}&nbsp;</Text>
          <Text>&nbsp;to proposal&nbsp;</Text>
          <Text variant="text2">#{voteId}</Text>
        </span>
      </div>
    )
  }

  if (action.name === 'Staked') {
    const { formattedAmount, formattedDuration, receiver, receiverNickname } = action

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerUrl(receiver, { chainId: activeChainId })} target="_blank">
            {receiverNickname}
          </A>
          <Text>&nbsp;staked&nbsp;</Text>
          <Text variant="text2">{formattedAmount}&nbsp;</Text>
          <AssetLogo src={'./assets/svg/PNT.svg'} />
          <Text>&nbsp;&nbsp;for&nbsp;</Text>
          <Text variant="text2">{formattedDuration}</Text>
        </span>
      </div>
    )
  }

  if (action.name === 'Unstaked') {
    const { formattedAmount, receiver, receiverNickname } = action

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerUrl(receiver, { chainId: activeChainId })} target="_blank">
            {receiverNickname}
          </A>
          <Text>&nbsp;unstaked&nbsp;</Text>
          <Text variant="text2">{formattedAmount}&nbsp;</Text>
          <AssetLogo src={'./assets/svg/PNT.svg'} />
        </span>
      </div>
    )
  }

  if (action.name === 'Lended') {
    const { startEpoch, endEpoch, formattedAmount, lender, lenderNickname } = action

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerUrl(lender, { chainId: activeChainId })} target="_blank">
            {lenderNickname}
          </A>
          <Text>&nbsp;lent&nbsp;</Text>
          <Text variant="text2">{formattedAmount}&nbsp;</Text>
          <AssetLogo src={'./assets/svg/PNT.svg'} />
          <Text>&nbsp;&nbsp;for&nbsp;</Text>
          <Text variant="text2">{endEpoch - startEpoch + 1}</Text>
          <Text variant="text2">&nbsp;epochs</Text>
        </span>
      </div>
    )
  }

  if (action.name === 'DurationIncreased') {
    const { endEpoch, lender, lenderNickname } = action

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerUrl(lender, { chainId: activeChainId })} target="_blank">
            {lenderNickname}
          </A>
          <Text>&nbsp;increased his loan until epoch&nbsp;</Text>
          <Text variant="text2">{endEpoch}</Text>
        </span>
      </div>
    )
  }
  if (action.name === 'SentinelRegistrationUpdated') {
    const { kind, owner, ownerNickname, numberOfEpochs } = action

    return (
      <div className="d-flex">
        <span>
          <A href={getAddressExplorerUrl(owner, { chainId: activeChainId })} target="_blank">
            {ownerNickname}
          </A>
          <Text>&nbsp;registered a sentinel&nbsp;</Text>
          {kind === BORROWING_SENTINEL && (
            <Text>
              by borrowing{' '}
              <Text variant="text2">{formatAssetAmount(settings.registrationManager.minStakeAmount, 'PNT')}</Text>&nbsp;
            </Text>
          )}
          <Text>
            for&nbsp;
            <Text variant="text2">
              {numberOfEpochs} epoch{numberOfEpochs > 1 ? 's' : ''}
            </Text>
          </Text>
        </span>
      </div>
    )
  }

  return <div></div>
}

export default Action
