import React, { Fragment } from 'react'
import styled from 'styled-components'

import { useActivities } from '../../../hooks/use-activities'

import Box from '../../base/Box'
import Line from '../../base/Line'
import Action from '../Action'
import Text from '../../base/Text'
import Spinner from '../../base/Spinner'

const StyledLine = styled(Line)`
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
`

const SpinnerContainer = styled.div`
  margin-top: 332.5px;
  margin-left: 50%;
`
const Activities = ({ ..._props }) => {
  const { activities, isLoading } = useActivities()

  return (
    <Box {..._props}>
      {isLoading && (
        <SpinnerContainer>
          <Spinner size="lg" />
        </SpinnerContainer>
      )}
      {!isLoading &&
        activities.map(({ type, ..._activity }, _index) => {
          return (
            <Fragment key={`activity_${_index}`}>
              <div>
                <Action action={{ ..._activity, name: type }} />
                <Text size="sm">{_activity.formattedDate}</Text>
              </div>

              <StyledLine />
            </Fragment>
          )
        })}
    </Box>
  )
}

export default Activities
