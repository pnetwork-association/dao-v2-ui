import BigNumber from 'bignumber.js'
import moment from 'moment'

import { formatAssetAmount } from './amount'

const now = moment().unix()

const extrapolateProposalData = (_proposal) => {
  const index = _proposal.indexOf('http')
  return index > 0
    ? {
        url: _proposal.slice(index).trim(),
        description: _proposal.slice(0, index)
      }
    : {
        url: null,
        description: _proposal
      }
}

const escapeUrl = (_url) =>
  Buffer.from(_url)
    .toString('utf-8')
    // eslint-disable-next-line no-control-regex
    .replace(/\u0000/g, '')

const styleProposalHtml = (_html, _theme) => {
  let html = _html

  html = html.replace(/color:#000000/g, `color: ${_theme.text1}`)
  html = html.replace(/font-weight:700;/g, `font-weight:700;color:${_theme.text2}!important;`)
  html = html.replace(/font-weight:700/g, `font-weight:700;color:${_theme.text2}!important;`)
  html = html.replace(/font-family:"Arial"/g, "font-family: 'Chivo', sans-serif")
  html = html.replace(/Summary/g, `<span style="font-size:14pt;font-weight:700">Summary</span>`)
  html = html.replace(/Motivation/g, `<span style="font-size:14pt;font-weight:700">Motivation</span>`)
  html = html.replace(/Specification/g, `<span style="font-size:14pt;font-weight:700">Specification</span>`)
  html = html.replace(/href/g, `target="_blank" href`)
  const index = html.indexOf('</style>')

  const rules = `
    a{color: ${_theme.secondary1} !important;}
  `

  return html.slice(0, index) + rules + html.slice(index, html.length)
}

const prepareOldProposal = (
  _proposal,
  _voteData,
  _voteActions,
  _executionBlockNumberTimestamp,
  _chainId,
  _idStart = 0,
  _durationBlocks
) => {
  const [
    open,
    executed,
    startBlock,
    executionBlock,
    snapshotBlock,
    supportRequired,
    rawMinAcceptQuorum,
    rawVotingPower,
    yea,
    nay,
    script
  ] = _voteData

  console.log('_voteData', executed, executionBlock, open, script, snapshotBlock, startBlock)

  const votingPower = BigNumber(rawVotingPower.toString()).dividedBy(10 ** 18)
  const no = BigNumber(nay.toString()).dividedBy(10 ** 18)
  const yes = BigNumber(yea.toString()).dividedBy(10 ** 18)

  const votingPnt = yes.plus(no)
  const percentageYea = yes.dividedBy(votingPnt).multipliedBy(100)
  const percentageNay = no.dividedBy(votingPnt).multipliedBy(100)

  const quorum = yes.dividedBy(votingPower)
  const minAcceptQuorum = BigNumber(rawMinAcceptQuorum.toString()).dividedBy(10 ** 18)

  const quorumReached = quorum.isGreaterThan(minAcceptQuorum)
  const passed = percentageYea.isGreaterThan(51) && quorumReached

  const endBlock = BigNumber(startBlock.toString()).plus(BigNumber(_durationBlocks.toString()))

  // No need to calculate the countdown on old votes on eth since are all closed and the new ones will be only on Polygon
  // TODO: What does it happen if keep creating vote on ethereum?
  const countdown = -1

  console.log('_executionBlockNumberTimestamp', _executionBlockNumberTimestamp)

  const formattedCloseDate =
    countdown > 0
      ? `~${moment.unix(now + countdown).format('MMM DD YYYY - HH:mm:ss')}`
      : Number(_executionBlockNumberTimestamp)
      ? moment.unix(Number(_executionBlockNumberTimestamp)).format('MMM DD YYYY - HH:mm:ss')
      : null

  const url = escapeUrl(_proposal.url)

  return {
    ..._proposal,
    actions: _voteActions,
    chainId: _chainId,
    effectiveId: _proposal.id,
    endBlock: Number(endBlock),
    executed,
    executionBlock: Number(executionBlock),
    formattedCloseDate,
    formattedPercentageNay: formatAssetAmount(percentageNay, '%', {
      decimals: 2
    }),
    formattedPercentageYea: formatAssetAmount(percentageYea, '%', {
      decimals: 2
    }),
    formattedVotingPnt: formatAssetAmount(votingPnt, 'PNT'),
    id: _proposal.id + _idStart,
    minAcceptQuorum: minAcceptQuorum.toFixed(),
    multihash: url.slice(url.length - 46, url.length),
    no: no,
    open,
    passed,
    quorum: quorum.toFixed(),
    quorumReached,
    script,
    snapshotBlock: Number(snapshotBlock),
    startBlock: Number(startBlock),
    url,
    votingPnt,
    votingPower: votingPower,
    yes: yes
  }
}

const prepareNewProposal = (_proposal, _voteData, _voteActions, _chainId, _idStart = 0, _duration) => {
  const { executed, executionDate, open, script, snapshotBlock, startDate } = _voteData

  const votingPower = BigNumber(_voteData.votingPower.toString()).dividedBy(10 ** 18)
  const no = BigNumber(_voteData.nay.toString()).dividedBy(10 ** 18)
  const yes = BigNumber(_voteData.yea.toString()).dividedBy(10 ** 18)
  const votingPnt = yes.plus(no)
  const percentageYea = yes.dividedBy(votingPnt).multipliedBy(100)
  const percentageNay = no.dividedBy(votingPnt).multipliedBy(100)

  const quorum = yes.dividedBy(votingPower)
  const minAcceptQuorum = BigNumber(_voteData.minAcceptQuorum.toString()).dividedBy(10 ** 18)

  const quorumReached = quorum.isGreaterThan(minAcceptQuorum)
  const passed = percentageYea.isGreaterThan(51) && quorumReached

  const endDate = startDate.add(_duration)

  const countdown = now < endDate.toNumber() ? endDate.toNumber() - now : -1

  const formattedCloseDate =
    countdown > 0
      ? `~${moment.unix(now + countdown).format('MMM DD YYYY - HH:mm:ss')}`
      : moment.unix(endDate).format('MMM DD YYYY - HH:mm:ss')

  const url = escapeUrl(_proposal.url)

  return {
    ..._proposal,
    actions: _voteActions,
    chainId: _chainId,
    effectiveId: _proposal.id,
    endDate: endDate.toNumber(),
    executed,
    executionDate: executionDate.toNumber(),
    formattedCloseDate,
    formattedPercentageNay: formatAssetAmount(percentageNay, '%', {
      decimals: 2
    }),
    formattedPercentageYea: formatAssetAmount(percentageYea, '%', {
      decimals: 2
    }),
    formattedVotingPnt: formatAssetAmount(votingPnt, 'PNT'),
    id: _proposal.id + _idStart,
    minAcceptQuorum: minAcceptQuorum.toFixed(),
    multihash: url.slice(url.length - 46, url.length),
    no: no,
    open,
    passed,
    quorum: quorum.toFixed(),
    quorumReached,
    script,
    snapshotBlock: snapshotBlock.toNumber(),
    startDate: startDate.toNumber(),
    url,
    votingPnt,
    votingPower: votingPower,
    yes: yes
  }
}

export { extrapolateProposalData, prepareNewProposal, prepareOldProposal, styleProposalHtml }
