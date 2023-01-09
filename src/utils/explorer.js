import settings from '../settings'

const normalizeExplorer = (_explorer) =>
  _explorer[_explorer.length - 1] === '/' ? _explorer.slice(0, _explorer.length - 1) : _explorer

const getAddressExplorerLink = (_address) => {
  return `${normalizeExplorer(settings.explorer)}/address/${_address}`
}

export { getAddressExplorerLink }
