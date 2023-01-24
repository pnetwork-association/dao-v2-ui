import React, { Fragment } from 'react'

import { useActivities } from '../../../hooks/use-activities'

import Box from '../../base/Box'
import Line from '../../base/Line'
import Action from '../Action'

const Activities = ({ ..._props }) => {
  const { activities } = useActivities()

  return (
    <Box {..._props}>
      <div>
        {[...activities, ...activities, ...activities, ...activities, ...activities, ...activities, ...activities].map(
          ({ type, ..._activity }, _index) => {
            return (
              <Fragment key={`activity_${_index}`}>
                <Action action={{ ..._activity, name: type }} />
                <Line />
              </Fragment>
            )
          }
        )}
      </div>
    </Box>
  )
}

export default Activities
