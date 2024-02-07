import { keccak256, toBytes } from 'viem'

const getRole = (_role) => keccak256(toBytes(_role))

export { getRole }
