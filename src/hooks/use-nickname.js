import { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { getNickname } from '../utils/nicknames'

const useNickname = () => {
  const { address } = useAccount()

  return useMemo(() => (!address ? '-' : getNickname(address)), [address])
}

export { useNickname }
