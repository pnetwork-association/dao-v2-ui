import { expect, it, vi, describe } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { erc20Abi } from 'viem'
import * as wagmi from 'wagmi'

import { useStake } from '../use-staking-manager'
import StakingManagerABI from '../../utils/abis/StakingManager.json'
import settings from '../../settings'

const mockedStake = vi.fn(() => '0x8967f020aba6481b3ded6a184382fb536270d0678cd06e5fbeedfc9c41d54b67')

vi.mock('wagmi', async (importOriginal) => {
  const orginalLib = await importOriginal()
  return {
    ...orginalLib,
    useAccount: vi.fn(() => {
      return {
        address: '0xb794f5ea0ba39494ce839613fffba74279579268'
      }
    }),
    useChainId: vi.fn(() => {
      return 100
    }),
    useBalance: vi.fn(() => {
      return {
        data: {
          value: 200000000000000000000n
        }
      }
    }),
    useWaitForTransactionReceipt: vi.fn(() => {
      return {
        isLoading: false
      }
    }),
    useWriteContract: vi.fn(() => {
      return {
        writeContract: mockedStake,
        error: false,
        data: 'write-data',
        isLoading: false
      }
    })
    // useReadContract: vi.fn(() => {
    //   return {
    //     data: 2000n,
    //     refetch: () => {}
    //   }
    // })
  }
})

describe('use-proposal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('Should get stake data and functions', () => {
    vi.spyOn(wagmi, 'useReadContract').mockReturnValue({
      data: 200000000000000000000n,
      refetch: () => {}
    })

    const { result } = renderHook(() => useStake())

    expect(result.current.allowance).toBe(200000000000000000000n)
    expect(result.current.amount).toBe('0')
    expect(result.current.approved).toBeTruthy()
    expect(result.current.approveData).toBe('write-data')
    expect(result.current.approveEnabled).toBeFalsy()
    expect(result.current.approveError).toBeFalsy()
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBeFalsy()
    expect(result.current.isStaking).toBeFalsy()
    expect(result.current.receiver).toBe('0xb794f5ea0ba39494ce839613fffba74279579268')
    expect(result.current.stakeData).toBe('write-data')
    expect(result.current.stakeEnabled).toBeFalsy()
    expect(result.current.stakeError).toBeFalsy()

    act(() => {
      result.current.setAmount('200')
      result.current.setDuration(10)
      result.current.setReceiver('0xc564f5ea0ba39494ce839613fffba742795792aa')
    })

    expect(result.current.allowance).toBe(200000000000000000000n)
    expect(result.current.amount).toBe('200')
    expect(result.current.approved).toBeTruthy()
    expect(result.current.approveData).toBe('write-data')
    expect(result.current.approveEnabled).toBeFalsy()
    expect(result.current.approveError).toBeFalsy()
    expect(result.current.duration).toBe(10)
    expect(result.current.isApproving).toBeFalsy()
    expect(result.current.isStaking).toBeFalsy()
    expect(result.current.receiver).toBe('0xc564f5ea0ba39494ce839613fffba742795792aa')
    expect(result.current.stakeData).toBe('write-data')
    expect(result.current.stakeEnabled).toBeTruthy()
    expect(result.current.stakeError).toBeFalsy()

    act(() => {
      result.current.stake()
    })

    expect(mockedStake).toHaveBeenCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'stake',
      args: ['0xc564f5ea0ba39494ce839613fffba742795792aa', 200000000000000000000n, 864000],
      chainId: 100
    })
  })

  it('Should get approve if allowance < amount', () => {
    vi.spyOn(wagmi, 'useReadContract').mockReturnValue({
      data: 0n,
      refetch: () => {}
    })

    const { result } = renderHook(() => useStake())

    act(() => {
      result.current.setAmount('200')
    })

    expect(result.current.allowance).toBe(0n)
    expect(result.current.amount).toBe('200')
    expect(result.current.approved).toBeFalsy()
    expect(result.current.approveData).toBe('write-data')
    expect(result.current.approveEnabled).toBeTruthy()
    expect(result.current.approveError).toBeFalsy()
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBeFalsy()
    expect(result.current.isStaking).toBeFalsy()
    expect(result.current.receiver).toBe('0xb794f5ea0ba39494ce839613fffba74279579268')
    expect(result.current.stakeData).toBe('write-data')
    expect(result.current.stakeEnabled).toBeFalsy()
    expect(result.current.stakeError).toBeFalsy()

    act(() => {
      result.current.approve()
    })

    expect(mockedStake).toHaveBeenCalledWith({
      address: settings.contracts.pntOnGnosis,
      abi: erc20Abi,
      functionName: 'approve',
      args: [settings.contracts.stakingManager, 200000000000000000000n],
      account: '0xb794f5ea0ba39494ce839613fffba74279579268',
      chainId: 100
    })
  })
})
