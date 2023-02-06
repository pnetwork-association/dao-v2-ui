export const isValidError = (_error) => {
  const message = _error?.data?.originalError?.error?.message || _error?.message?.toLowerCase()
  return !message.includes('user rejected transaction') && !message.includes('User denied to sign a transaction')
}
