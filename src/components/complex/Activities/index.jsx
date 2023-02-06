import React from 'react'
import styled from 'styled-components'

import { useActivities } from '../../../hooks/use-activities'

import Box from '../../base/Box'
import Line from '../../base/Line'
import Action from '../Action'
import Text from '../../base/Text'
import Spinner from '../../base/Spinner'

const SpinnerContainer = styled.div`
  margin-top: 60px;
  margin-left: 50%;
`

const Activities = ({ ..._props }) => {
  const { activities, isLoading } = useActivities()

  return (
    <Box
      {..._props}
      headerTitle="Recent activities"
      bodyStyle={{
        height: 174,
        maxHeight: 174,
        overflowY: 'auto'
      }}
    >
      {isLoading && (
        <SpinnerContainer>
          <Spinner size="lg" />
        </SpinnerContainer>
      )}
      {!isLoading &&
        activities.map(({ type, ..._activity }, _index) => {
          const key = `activity_${_index}`
          return (
            <div key={key}>
              <Action action={{ ..._activity, name: type }} />
              <Text id={key} size="xs">
                {_activity.formattedDateFromNow}
              </Text>
              {_index !== activities.length - 1 && <Line />}
            </div>
          )
        })}
    </Box>
  )
}

export default Activities
