import { ethers } from 'ethers'

const getRole = (_role) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(_role))

export { getRole }
