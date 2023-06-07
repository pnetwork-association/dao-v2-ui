import { ethers } from 'ethers'

const hexToAscii = (_str) => {
  const hex = _str.slice(130).toString()
  return new TextDecoder().decode(
    new Uint8Array(
      Array.from(hex.matchAll('..')).map((_x) => {
        return parseInt(_x[0], 16)
      })
    )
  )
}

const isValidHexString = (_str) => (_str.length > 0 && _str.length % 2 === 0 ? ethers.utils.isHexString(_str) : false)

const isValidMultiHash = (_hash) => {
  return /^[A-HJ-NP-Za-km-z1-9]{46,50}$/.test(_hash)
}

export { hexToAscii, isValidHexString, isValidMultiHash }
