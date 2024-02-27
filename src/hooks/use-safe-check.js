import { useEffect, useState } from 'react'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import { getContract } from 'viem'

const GNOSIS_PROXY_CONTRACT_BYTECODE =
  '0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033'

const ABI = [
  {
    inputs: [],
    name: 'VERSION',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

const useIsSafe = () => {
  const { address } = useAccount()
  const client = usePublicClient()
  const chainId = useChainId()
  const [isSafe, setIsSafe] = useState(null)

  useEffect(() => {
    const getCode = async () => {
      try {
        const code = await client.getBytecode({ address: address, blockTag: 'latest' })
        if (code === GNOSIS_PROXY_CONTRACT_BYTECODE) {
          const contract = getContract({
            address: address,
            abi: ABI,
            client: client
          })
          const version = await contract.read.VERSION()
          if (version.charAt(0) !== '1') throw new Error('Unexpected safe version')
          // a nice solution would be check also the singleton address for each chain based on version
          // but since it's an internal variable we cannot access it.

          setIsSafe(true)
          return
        }

        setIsSafe(false)
      } catch (_err) {
        console.error(_err)
        setIsSafe(false)
      }
    }

    if (address && client && chainId) {
      getCode()
    }
  }, [address, client, chainId])

  return isSafe
}

export { useIsSafe }
