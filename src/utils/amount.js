import BigNumber from 'bignumber.js'
import { format } from 'currency-formatter'
import numeral from 'numeral'
import { ethers } from 'ethers'

export const formatAssetAmount = (_amount, _symbol, _opts = {}) => {
  const { decimals = 3, forceDecimals = false } = _opts
  if (BigNumber(_amount).isNaN()) {
    return '-'
  }

  const formattedNumber = forceDecimals
    ? BigNumber(_amount).toFixed(decimals)
    : numeral(_amount).format(`0,0[.]${'0'.repeat(decimals)}`)
  return `${formattedNumber} ${_symbol}`
}

export const removeUselessZeros = (_amount) => _amount.replace(/(\.0+|0+)$/, '')

export const shouldBeApproximated = (_amount, _decimals) => {
  const full = BigNumber(_amount).toFixed().split('.')
  return full[1] ? full[1].length > _decimals : false
}

export const formatCurrency = (_amount, _currency) =>
  BigNumber(_amount).isNaN()
    ? `- ${_currency}`
    : format(BigNumber(_amount).toFixed(), {
        code: _currency,
        decimal: '.',
        thousand: ',',
        format: _currency ? '%s %v' : '%v'
      })

export const removeUselessDecimals = (_amount, _decimals = 5) =>
  BigNumber(BigNumber(_amount).toFixed(_decimals)).toFixed()

export const getEthersOnChainAmount = (_amount) =>
  _amount.toString().length > 0
    ? ethers.BigNumber.from(
        BigNumber(_amount)
          .multipliedBy(10 ** 18)
          .toFixed()
      )
    : ethers.BigNumber.from('0')
