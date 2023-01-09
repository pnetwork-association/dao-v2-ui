export const slicer = (_address, _opts = {}) => {
  const { left = 6, right = 4 } = _opts
  return `${_address.slice(0, left)}...${_address.slice(_address.length - right, _address.length)}`
}
