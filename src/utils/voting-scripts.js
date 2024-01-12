// window.Buffer = window.Buffer || require('buffer').Buffer
// import abi from 'ethereumjs-abi'

// TODO adapt for vite

const createExecutorId = (id) => `0x${String(id).padStart(8, '0')}`
const encodeCallScript = (actions, specId = 1) => {
  return actions.reduce((script, { to, calldata }) => {
    // const addr = abi.rawEncode(['address'], [to]).toString('hex')
    // const length = abi.rawEncode(['uint256'], [(calldata.length - 2) / 2]).toString('hex')
    // // Remove 12 first 0s of padding for addr and 28 0s for uint32
    // return script + addr.slice(24) + length.slice(56) + calldata.slice(2)
    return 'this is a mockup'
  }, createExecutorId(specId))
}

export { createExecutorId, encodeCallScript }
