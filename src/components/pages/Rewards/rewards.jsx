import React from 'react'
import { Col, Row } from 'react-bootstrap'

import Box from '../../base/Box'
import Activities from '../../complex/Activities'
import Proposals from '../../complex/Proposals'
import SentinelHistoricalChart from '../../complex/SentinelHistoricalChart'
import Stats from '../../complex/Stats'
import PageTemplate from '../../templates/PageTemplate'
import Text from '../../base/Text'

const Rewards = () => {
  return (
    <PageTemplate>
      <Text size={'34'} variant={'text3'}>
        pNetwork DAO Rewards
      </Text>
      <br />
      <br />
      <Text size={'18'} variant={'text3'}>
        The new pNetwork Dao encourages active participation in the network by rewarding stakers who engage in the
        voting process.
      </Text>
      <Text size={'18'} variant={'text3'}>
        pNetwork DAO operates using Epochs as time references.
      </Text>
      <Text size={'16'} variant={'text1'}>
        Epoch: The period of time between changes in the identity table and reward payments. (Initially a mot, measured
        in consensus views) At the end of every epoch, insufficiently staked node operators are refunded their stake,
        rewards are paid to those who are currently staked, committed tokens are marked as staked, unstaking tokens are
        marked as unstaked, and unstaking requests are changed from staked to unstaking.
      </Text>
    </PageTemplate>
  )
}

export default Rewards
