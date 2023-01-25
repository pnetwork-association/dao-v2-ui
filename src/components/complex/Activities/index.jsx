import React, { Fragment } from 'react'
import styled from 'styled-components'

import { useActivities } from '../../../hooks/use-activities'

import Box from '../../base/Box'
import Line from '../../base/Line'
import Action from '../Action'
import Text from '../../base/Text'

const StyledLine = styled(Line)`
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
`

const Activities = ({ ..._props }) => {
  const { activities } = useActivities()

  return (
    <Box {..._props}>
      <div>
        {[...activities, ...activities, ...activities, ...activities, ...activities, ...activities, ...activities].map(
          ({ type, ..._activity }, _index) => {
            return (
              <Fragment key={`activity_${_index}`}>
                <div>
                  <Action action={{ ..._activity, name: type }} />
                  <Text size="sm">{_activity.formattedDate}</Text>
                </div>

                <StyledLine />
              </Fragment>
            )
          }
        )}
      </div>
    </Box>
  )
}

export default Activities
