import { encodeAbiParameters, parseAbiParameters } from 'viem'

const createExecutorId = (id) => `0x${String(id).padStart(8, '0')}`
const encodeCallScript = (actions, specId = 1) => {
  return actions.reduce((script, { to, calldata }) => {
    const addr = encodeAbiParameters(parseAbiParameters('address'), [to]).substring(2)
    const length = encodeAbiParameters(parseAbiParameters('uint256'), [(calldata.length - 2) / 2]).substring(2)
    // Remove 12 first 0s of padding for addr and 28 0s for uint32
    return script + addr.slice(24) + length.slice(56) + calldata.slice(2)
  }, createExecutorId(specId))
}

export { createExecutorId, encodeCallScript }
