import { act, renderHook } from '@testing-library/react'
const ethers = require('ethers')
const wagmi = require('wagmi')

import { useUnstake } from '../use-staking-manager'
import settings from '../../settings'
import StakingManagerABI from '../../utils/abis/StakingManager.json'

const unstakeMock = jest.fn()

describe('useUnStake', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('Should be disabled if no PNT and amount set', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: undefined,
      status: 'idle'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'unstake' })
    const useContractWriteSpy = jest
      .spyOn(wagmi, 'useContractWrite')
      .mockReturnValue({ write: () => null, error: undefined, data: undefined, status: 'idle' })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useUnstake())

    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'getStakedLocks',
      args: ['0x1234567890123456789012345678901234567890'],
      enabled: '0x1234567890123456789012345678901234567890',
      watch: true
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'unstake',
      args: [ethers.BigNumber.from('0')],
      enabled: false
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: undefined
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('unstake')
    expect(result.current.amount).toBe('0')
    expect(result.current.isUnstaking).toBe(false)
    expect(result.current.unstakeData).toBe(undefined)
    expect(result.current.unstakeError).toBe(undefined)
    expect(result.current.unstakeStatus).toBe('idle')
  })

  it('Should be disabled if daoPNT are available and amount set > daoPNT', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: [
        {
          0: ethers.BigNumber.from('1671880343'),
          1: ethers.BigNumber.from('604800'),
          2: ethers.BigNumber.from('1000000000000000000000'),
          lockDate: ethers.BigNumber.from('1671880343'),
          duration: ethers.BigNumber.from('604800'),
          amount: ethers.BigNumber.from('1000000000000000000000')
        },
        {
          0: ethers.BigNumber.from('1683142595'),
          1: ethers.BigNumber.from('8640000'),
          2: ethers.BigNumber.from('1998792631540000000000000'),
          lockDate: ethers.BigNumber.from('1683142595'),
          duration: ethers.BigNumber.from('8640000'),
          amount: ethers.BigNumber.from('1998792631540000000000000')
        }
      ],
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'unstake' })
    const useContractWriteSpy = jest
      .spyOn(wagmi, 'useContractWrite')
      .mockReturnValue({ write: () => null, error: undefined, data: undefined, status: 'idle' })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useUnstake())

    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'getStakedLocks',
      args: ['0x1234567890123456789012345678901234567890'],
      enabled: '0x1234567890123456789012345678901234567890',
      watch: true
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'unstake',
      args: [ethers.BigNumber.from('0')],
      enabled: false
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('unstake')
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: undefined
    })
    expect(result.current.amount).toBe('0')
    expect(result.current.isUnstaking).toBe(false)
    expect(result.current.unstakeData).toBe(undefined)
    expect(result.current.unstakeError).toBe(undefined)
    expect(result.current.unstakeStatus).toBe('idle')

    act(() => {
      result.current.setAmount('2000000')
    })

    expect(usePrepareContractWriteSpy).toHaveBeenLastCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'unstake',
      args: [ethers.utils.parseEther('2000000')],
      enabled: false
    })
    expect(useContractWriteSpy).toHaveBeenLastCalledWith('unstake')
    expect(useWaitForTransactionSpy).toHaveBeenLastCalledWith({
      hash: undefined
    })
    expect(result.current.amount).toBe('2000000')
    expect(result.current.isUnstaking).toBe(false)
    expect(result.current.unstakeData).toBe(undefined)
    expect(result.current.unstakeError).toBe(undefined)
    expect(result.current.unstakeStatus).toBe('idle')
  })

  it('Should be enabled if daoPNT are available and amount set <= daoPNT', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: [
        {
          0: ethers.BigNumber.from('1671880343'),
          1: ethers.BigNumber.from('604800'),
          2: ethers.BigNumber.from('1000000000000000000000'),
          lockDate: ethers.BigNumber.from('1671880343'),
          duration: ethers.BigNumber.from('604800'),
          amount: ethers.BigNumber.from('1000000000000000000000')
        },
        {
          0: ethers.BigNumber.from('1683142595'),
          1: ethers.BigNumber.from('8640000'),
          2: ethers.BigNumber.from('1998792631540000000000000'),
          lockDate: ethers.BigNumber.from('1683142595'),
          duration: ethers.BigNumber.from('8640000'),
          amount: ethers.BigNumber.from('1998792631540000000000000')
        }
      ],
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'unstake' })
    const useContractWriteSpy = jest
      .spyOn(wagmi, 'useContractWrite')
      .mockReturnValue({ write: () => null, error: undefined, data: undefined, status: 'idle' })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useUnstake())

    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'getStakedLocks',
      args: ['0x1234567890123456789012345678901234567890'],
      enabled: '0x1234567890123456789012345678901234567890',
      watch: true
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'unstake',
      args: [ethers.BigNumber.from('0')],
      enabled: false
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('unstake')
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: undefined
    })
    expect(result.current.amount).toBe('0')
    expect(result.current.isUnstaking).toBe(false)
    expect(result.current.unstakeData).toBe(undefined)
    expect(result.current.unstakeError).toBe(undefined)
    expect(result.current.unstakeStatus).toBe('idle')

    act(() => {
      result.current.setAmount('1999792.63154')
    })

    expect(usePrepareContractWriteSpy).toHaveBeenLastCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'unstake',
      args: [ethers.utils.parseEther('1999792.63154')],
      enabled: true
    })
    expect(useContractWriteSpy).toHaveBeenLastCalledWith('unstake')
    expect(useWaitForTransactionSpy).toHaveBeenLastCalledWith({
      hash: undefined
    })
    expect(result.current.amount).toBe('1999792.63154')
    expect(result.current.isUnstaking).toBe(false)
    expect(result.current.unstakeData).toBe(undefined)
    expect(result.current.unstakeError).toBe(undefined)
    expect(result.current.unstakeStatus).toBe('idle')
  })

  it('Should return data and isLoading if called successfully and tx receipt still pending', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: [
        {
          0: ethers.BigNumber.from('1671880343'),
          1: ethers.BigNumber.from('604800'),
          2: ethers.BigNumber.from('1000000000000000000000'),
          lockDate: ethers.BigNumber.from('1671880343'),
          duration: ethers.BigNumber.from('604800'),
          amount: ethers.BigNumber.from('1000000000000000000000')
        },
        {
          0: ethers.BigNumber.from('1683142595'),
          1: ethers.BigNumber.from('8640000'),
          2: ethers.BigNumber.from('1998792631540000000000000'),
          lockDate: ethers.BigNumber.from('1683142595'),
          duration: ethers.BigNumber.from('8640000'),
          amount: ethers.BigNumber.from('1998792631540000000000000')
        }
      ],
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'unstake' })
    const useContractWriteSpy = jest
      .spyOn(wagmi, 'useContractWrite')
      .mockReturnValue({
        write: unstakeMock,
        error: undefined,
        data: { hash: 'unstake-txHash', wait: 'unstake-wait-function' },
        status: 'success'
      })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: true })

    const { result } = renderHook(() => useUnstake())

    act(() => {
      result.current.setAmount('1999792.63154')
      result.current.unstake()
    })

    expect(useContractReadSpy).toHaveBeenLastCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'getStakedLocks',
      args: ['0x1234567890123456789012345678901234567890'],
      enabled: '0x1234567890123456789012345678901234567890',
      watch: true
    })
    expect(usePrepareContractWriteSpy).toHaveBeenLastCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'unstake',
      args: [ethers.utils.parseEther('1999792.63154')],
      enabled: true
    })
    expect(useContractWriteSpy).toHaveBeenLastCalledWith('unstake')
    expect(useWaitForTransactionSpy).toHaveBeenLastCalledWith({
      hash: 'unstake-txHash'
    })
    expect(unstakeMock).toHaveBeenCalled()
    expect(result.current.amount).toBe('1999792.63154')
    expect(result.current.isUnstaking).toBe(true)
    expect(result.current.unstakeData).toEqual({ hash: 'unstake-txHash', wait: 'unstake-wait-function' })
    expect(result.current.unstakeError).toBe(undefined)
    expect(result.current.unstakeStatus).toBe('success')
  })

  it('Should return data and not be loading if called successfully and tx receipt received', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: [
        {
          0: ethers.BigNumber.from('1671880343'),
          1: ethers.BigNumber.from('604800'),
          2: ethers.BigNumber.from('1000000000000000000000'),
          lockDate: ethers.BigNumber.from('1671880343'),
          duration: ethers.BigNumber.from('604800'),
          amount: ethers.BigNumber.from('1000000000000000000000')
        },
        {
          0: ethers.BigNumber.from('1683142595'),
          1: ethers.BigNumber.from('8640000'),
          2: ethers.BigNumber.from('1998792631540000000000000'),
          lockDate: ethers.BigNumber.from('1683142595'),
          duration: ethers.BigNumber.from('8640000'),
          amount: ethers.BigNumber.from('1998792631540000000000000')
        }
      ],
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'unstake' })
    const useContractWriteSpy = jest
      .spyOn(wagmi, 'useContractWrite')
      .mockReturnValue({
        write: unstakeMock,
        error: undefined,
        data: { hash: 'unstake-txHash', wait: 'unstake-wait-function' },
        status: 'success'
      })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useUnstake())

    act(() => {
      result.current.setAmount('1999792.63154')
      result.current.unstake()
    })

    expect(useContractReadSpy).toHaveBeenLastCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'getStakedLocks',
      args: ['0x1234567890123456789012345678901234567890'],
      enabled: '0x1234567890123456789012345678901234567890',
      watch: true
    })
    expect(usePrepareContractWriteSpy).toHaveBeenLastCalledWith({
      address: settings.contracts.stakingManager,
      abi: StakingManagerABI,
      functionName: 'unstake',
      args: [ethers.utils.parseEther('1999792.63154')],
      enabled: true
    })
    expect(useContractWriteSpy).toHaveBeenLastCalledWith('unstake')
    expect(useWaitForTransactionSpy).toHaveBeenLastCalledWith({
      hash: 'unstake-txHash'
    })
    expect(unstakeMock).toHaveBeenCalled()
    expect(result.current.amount).toBe('1999792.63154')
    expect(result.current.isUnstaking).toBe(false)
    expect(result.current.unstakeData).toEqual({ hash: 'unstake-txHash', wait: 'unstake-wait-function' })
    expect(result.current.unstakeError).toBe(undefined)
    expect(result.current.unstakeStatus).toBe('success')
  })
})
