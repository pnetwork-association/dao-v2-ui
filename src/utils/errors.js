export const isValidError = (_msg) =>
  !_msg.includes('user rejected transaction') && !_msg.includes('User denied to sign a transaction')
