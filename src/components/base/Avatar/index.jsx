import React from 'react'
import Blockies from 'react-blockies'

const Avatar = ({ address, ..._props }) => <Blockies seed={address.toLowerCase()} size={20} {..._props} />

export default Avatar
