import BigNumber from 'bignumber.js'

export const formatAssetAmount = (_amount, _symbol, _opts = {}) => {
  const { decimals = 3, checkApproximation = false } = _opts
  if (BigNumber(_amount).isNaN()) {
    return '-'
  }

  if (shouldBeApproximated(_amount, decimals) && checkApproximation) {
    return formatAssetAmountWithEstimation(_amount, _symbol, _opts)
  }

  return `${BigNumber(_amount)
    .toFixed(decimals)
    .replace(/(\.0+|0+)$/, '')
    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
    .replace(/\B(?=(\d{decimals})+(?!\d))/g, ',')} ${_symbol}`
}

export const formatAssetAmountWithEstimation = (_amount, _symbol, _opts = {}) => {
  const { decimals = 6 } = _opts
  if (BigNumber(_amount).isEqualTo(0) || BigNumber(_amount).isNaN()) {
    return `- ${_symbol}`
  }

  return `~${BigNumber(_amount)
    .toFixed(decimals)
    .replace(/(\.0+|0+)$/, '')
    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
    .replace(/\B(?=(\d{decimals})+(?!\d))/g, ',')} ${_symbol}`
}

export const removeUselessZeros = (_amount) => _amount.replace(/(\.0+|0+)$/, '')

export const shouldBeApproximated = (_amount, _decimals) => {
  const full = BigNumber(_amount).toFixed().split('.')
  return full[1] ? full[1].length > _decimals : false
}
