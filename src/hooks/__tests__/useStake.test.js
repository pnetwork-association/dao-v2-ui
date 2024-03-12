import { act, renderHook } from '@testing-library/react'
const ethers = require('ethers')
const wagmi = require('wagmi')

import { useStake } from '../use-staking-manager'
import settings from '../../settings'
import StakingManagerABI from '../../utils/abis/StakingManager.json'
import ForwarderABI from '../../utils/abis/Forwarder.json'

const usePrepareContractWriteMock = jest.fn(({ address, abi, functionName, args, enabled }) => {
  if (address === settings.contracts.pnt && functionName === 'approve' && args[0] === settings.contracts.forwarder)
    return {
      config: 'approve-forwarder'
    }
  if (address === settings.contracts.pnt && functionName === 'approve' && args[0] === settings.contracts.stakingManager)
    return {
      config: 'approve-stakingManager'
    }
  if (address === settings.contracts.forwarder && functionName === 'call')
    return {
      config: 'stake-forwarder'
    }
  if (address === settings.contracts.stakingManager && functionName === 'stake')
    return {
      config: 'stake-stakingManager'
    }
  return { config: null }
})

const useContractWriteMock = jest.fn((config) => {
  if (config === 'approve-forwarder')
    return {
      write: approveMock,
      error: undefined,
      data: {
        hash: 'approve-forwarder-txHash',
        wait: () => new Promise((resolve) => setTimeout(() => resolve('approve-forwarder-data'), 1000))
      },
      status: 'success'
    }
  if (config === 'approve-stakingManager')
    return {
      write: approveMock,
      error: undefined,
      data: {
        hash: 'approve-stakingManager-txHash',
        wait: () => new Promise((resolve) => setTimeout(() => resolve('approve-stakingManager-data'), 1000))
      },
      status: 'success'
    }
  if (config === 'stake-forwarder')
    return {
      write: stakeMock,
      error: undefined,
      data: {
        hash: 'stake-forwarder-txHash',
        wait: () => new Promise((resolve) => setTimeout(() => resolve('stake-forwarder-data'), 1000))
      },
      status: 'success'
    }
  if (config === 'stake-stakingManager')
    return {
      write: stakeMock,
      error: undefined,
      data: {
        hash: 'stake-stakingManager-txHash',
        wait: () => new Promise((resolve) => setTimeout(() => resolve('stake-stakingManager-data'), 1000))
      },
      status: 'success'
    }
})

const useWaitForTransactionMock = jest.fn(({ hash }) => {
  if (hash === 'approve-forwarder-txHash') return { isLoading: false }
  if (hash === 'approve-stakingManager-txHash') return { isLoading: false }
  if (hash === 'stake-forwarder-txHash') return { isLoading: false }
  if (hash === 'stake-stakingManager-txHash') return { isLoading: false }
})

const stakeMock = jest.fn()
const approveMock = jest.fn()

describe('useStake', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('Should be disabled if PNT, amount, address are not set', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: undefined })
    const useBalanceSpy = jest.spyOn(wagmi, 'useBalance').mockReturnValue({ data: ethers.utils.formatEther('0') })
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

    const { result } = renderHook(() => useStake())

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: undefined
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: [undefined, settings.contracts.stakingManager]
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'approve',
      args: [settings.contracts.stakingManager, ethers.utils.parseEther('0')],
      enabled: false
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: undefined
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('unstake')
    expect(result.current.amount).toBe('0')
    expect(result.current.allowance).toBe(undefined)
    expect(result.current.approveData).toBe(undefined)
    expect(result.current.approveEnabled).toBe(false)
    expect(result.current.approveError).toBe(undefined)
    expect(result.current.approved).toBe(false)
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.isStaking).toBe(false)
    expect(result.current.receiver).toBe(undefined)
    expect(result.current.stakeData).toBe(undefined)
    expect(result.current.stakeEnabled).toBe(false)
    expect(result.current.stakeError).toBe(undefined)
    expect(result.current.stakeStatus).toBe('idle')
  })

  it('Should be disabled if PNT, amount, are not set', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useBalanceSpy = jest.spyOn(wagmi, 'useBalance').mockReturnValue({ data: ethers.utils.formatEther('0') })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: ethers.utils.parseEther('0'),
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'unstake' })
    const useContractWriteSpy = jest
      .spyOn(wagmi, 'useContractWrite')
      .mockReturnValue({ write: () => null, error: undefined, data: undefined, status: 'idle' })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useStake())

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: '0x1234567890123456789012345678901234567890'
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: ['0x1234567890123456789012345678901234567890', settings.contracts.stakingManager]
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'approve',
      args: [settings.contracts.stakingManager, ethers.utils.parseEther('0')],
      enabled: false
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: undefined
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('unstake')
    expect(result.current.amount).toBe('0')
    expect(result.current.allowance).toEqual(ethers.utils.parseEther('0'))
    expect(result.current.approveData).toBe(undefined)
    expect(result.current.approveEnabled).toBe(false)
    expect(result.current.approveError).toBe(undefined)
    expect(result.current.approved).toBe(true) // both balance and allowance are 0
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.isStaking).toBe(false)
    expect(result.current.receiver).toBe('0x1234567890123456789012345678901234567890')
    expect(result.current.stakeData).toBe(undefined)
    expect(result.current.stakeEnabled).toBe(false)
    expect(result.current.stakeError).toBe(undefined)
    expect(result.current.stakeStatus).toBe('idle')
  })

  it('Should enable approval if PNT balance > allowance', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useBalanceSpy = jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: ethers.utils.parseEther('100') } })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: ethers.utils.parseEther('0'),
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest.spyOn(wagmi, 'usePrepareContractWrite')
    usePrepareContractWriteSpy.mockImplementation(usePrepareContractWriteMock)
    const useContractWriteSpy = jest.spyOn(wagmi, 'useContractWrite')
    useContractWriteSpy.mockImplementation(useContractWriteMock)
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction')
    useWaitForTransactionSpy.mockImplementation(useWaitForTransactionMock)

    const { result } = renderHook(() => useStake())

    act(() => {
      result.current.setAmount('100')
      result.current.approve()
    })

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: '0x1234567890123456789012345678901234567890'
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: ['0x1234567890123456789012345678901234567890', settings.contracts.stakingManager]
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'approve',
      args: [settings.contracts.stakingManager, ethers.utils.parseEther('0')],
      enabled: false
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: 'approve-stakingManager-txHash'
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('approve-stakingManager')
    expect(result.current.amount).toBe('100')
    expect(result.current.allowance).toEqual(ethers.utils.parseEther('0'))
    expect(result.current.approveData).toEqual({ hash: 'approve-stakingManager-txHash', wait: expect.any(Function) })
    expect(result.current.approveEnabled).toBe(true)
    expect(result.current.approveError).toBe(undefined)
    expect(result.current.approved).toBe(false)
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.isStaking).toBe(false)
    expect(result.current.receiver).toBe('0x1234567890123456789012345678901234567890')
    expect(approveMock).toHaveBeenCalled()
  })

  it('Should show is loading if approve tx not confirmed', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useBalanceSpy = jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: ethers.utils.parseEther('100') } })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: ethers.utils.parseEther('0'),
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'unstake' })
    const useContractWriteSpy = jest.spyOn(wagmi, 'useContractWrite').mockReturnValue({
      write: approveMock,
      error: undefined,
      data: {
        hash: 'approve-hash',
        wait: () => new Promise((resolve) => setTimeout(() => resolve('approve-forwarder-data'), 1000))
      },
      status: 'success'
    })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useStake())

    act(() => {
      result.current.setAmount('100')
      result.current.approve()
    })

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: '0x1234567890123456789012345678901234567890'
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: ['0x1234567890123456789012345678901234567890', settings.contracts.stakingManager]
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'approve',
      args: [settings.contracts.stakingManager, ethers.utils.parseEther('0')],
      enabled: false
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: 'approve-hash'
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('unstake')
    expect(result.current.amount).toBe('100')
    expect(result.current.allowance).toEqual(ethers.utils.parseEther('0'))
    expect(result.current.approveData).toEqual({ hash: 'approve-hash', wait: expect.any(Function) })
    expect(result.current.approveEnabled).toBe(true)
    expect(result.current.approveError).toBe(undefined)
    expect(result.current.approved).toBe(false)
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.receiver).toBe('0x1234567890123456789012345678901234567890')
    expect(approveMock).toHaveBeenCalled()
  })

  it('Should return approve data and status', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useBalanceSpy = jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: ethers.utils.parseEther('100') } })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: ethers.utils.parseEther('0'),
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'approve' })
    const useContractWriteSpy = jest.spyOn(wagmi, 'useContractWrite').mockReturnValue({
      write: approveMock,
      error: undefined,
      data: {
        hash: 'approve-hash',
        wait: () => new Promise((resolve) => setTimeout(() => resolve('approve-forwarder-data'), 1000))
      },
      status: 'success'
    })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useStake())

    act(() => {
      result.current.setAmount('100')
      result.current.approve()
    })

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: '0x1234567890123456789012345678901234567890'
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: ['0x1234567890123456789012345678901234567890', settings.contracts.stakingManager]
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'approve',
      args: [settings.contracts.stakingManager, ethers.utils.parseEther('0')],
      enabled: false
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: 'approve-hash'
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('approve')
    expect(result.current.amount).toBe('100')
    expect(result.current.allowance).toEqual(ethers.utils.parseEther('0'))
    expect(result.current.approveData).toEqual({ hash: 'approve-hash', wait: expect.any(Function) })
    expect(result.current.approveEnabled).toBe(true)
    expect(result.current.approveError).toBe(undefined)
    expect(result.current.approved).toBe(false)
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.receiver).toBe('0x1234567890123456789012345678901234567890')
    expect(approveMock).toHaveBeenCalled()
  })

  it('Should be approved and staking enabled if amount <= PNT balance && amount <= allowance', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useBalanceSpy = jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: ethers.utils.parseEther('100') } })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: ethers.utils.parseEther('100'),
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest
      .spyOn(wagmi, 'usePrepareContractWrite')
      .mockReturnValue({ config: 'approve' })
    const useContractWriteSpy = jest
      .spyOn(wagmi, 'useContractWrite')
      .mockReturnValue({ write: stakeMock, error: undefined, data: undefined, status: 'idle' })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useStake())

    act(() => {
      result.current.setAmount('100')
      result.current.stake()
    })

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: '0x1234567890123456789012345678901234567890'
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: ['0x1234567890123456789012345678901234567890', settings.contracts.stakingManager]
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: undefined
    })
    expect(result.current.amount).toBe('100')
    expect(result.current.allowance).toEqual(ethers.utils.parseEther('100'))
    expect(result.current.approveData).toEqual(undefined)
    expect(result.current.approveEnabled).toBe(false)
    expect(result.current.approveError).toBe(undefined)
    expect(result.current.approved).toBe(true)
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.isStaking).toBe(false)
    expect(result.current.receiver).toBe('0x1234567890123456789012345678901234567890')
    expect(result.current.stakeData).toBe(undefined)
    expect(result.current.stakeEnabled).toBe(true)
    expect(result.current.stakeError).toBe(undefined)
    expect(result.current.stakeStatus).toBe('idle')
    expect(stakeMock).toHaveBeenCalled()
  })

  it('Should return stake data and status', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useBalanceSpy = jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: ethers.utils.parseEther('100') } })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: ethers.utils.parseEther('100'),
      status: 'success'
    })
    jest.spyOn(wagmi, 'usePrepareContractWrite').mockReturnValue({ config: 'stake' })
    jest.spyOn(wagmi, 'useContractWrite').mockReturnValue({
      write: stakeMock,
      error: undefined,
      data: {
        hash: 'stake-hash',
        wait: () => new Promise((resolve) => setTimeout(() => resolve('stake-forwarder-data'), 1000))
      },
      status: 'success'
    })
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction').mockReturnValue({ isLoading: false })

    const { result } = renderHook(() => useStake())

    // act(() => {
    // result.current.setAmount('100')
    // })

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: '0x1234567890123456789012345678901234567890'
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: ['0x1234567890123456789012345678901234567890', settings.contracts.stakingManager]
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: 'stake-hash'
    })
    expect(result.current.amount).toBe('0')
    expect(result.current.allowance).toEqual(ethers.utils.parseEther('100'))
    expect(result.current.approveEnabled).toBe(false)
    expect(result.current.approved).toBe(true)
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.isStaking).toBe(false)
    expect(result.current.receiver).toBe('0x1234567890123456789012345678901234567890')
    expect(result.current.stakeData).toEqual({ hash: 'stake-hash', wait: expect.any(Function) })
    expect(result.current.stakeEnabled).toBe(false)
    expect(result.current.stakeError).toBe(undefined)
    expect(result.current.stakeStatus).toBe('success')
  })

  it('Should approve and stake', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useBalanceSpy = jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: ethers.utils.parseEther('100') } })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: ethers.utils.parseEther('100'),
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest.spyOn(wagmi, 'usePrepareContractWrite')
    usePrepareContractWriteSpy.mockImplementation(usePrepareContractWriteMock)
    const useContractWriteSpy = jest.spyOn(wagmi, 'useContractWrite')
    useContractWriteSpy.mockImplementation(useContractWriteMock)
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction')
    useWaitForTransactionSpy.mockImplementation(useWaitForTransactionMock)

    const { result } = renderHook(() => useStake())

    act(() => {
      result.current.setAmount('100')
      result.current.approve()
      result.current.stake()
    })

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: '0x1234567890123456789012345678901234567890'
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: ['0x1234567890123456789012345678901234567890', settings.contracts.stakingManager]
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'approve',
      args: [settings.contracts.stakingManager, ethers.utils.parseEther('0')],
      enabled: false
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: 'approve-stakingManager-txHash'
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('approve-stakingManager')
    expect(result.current.amount).toBe('100')
    expect(result.current.allowance).toEqual(ethers.utils.parseEther('100'))
    expect(result.current.approveData).toEqual({ hash: 'approve-stakingManager-txHash', wait: expect.any(Function) })
    expect(result.current.approveEnabled).toBe(false)
    expect(result.current.approveError).toBe(undefined)
    expect(result.current.approved).toBe(true)
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.isStaking).toBe(false)
    expect(result.current.receiver).toBe('0x1234567890123456789012345678901234567890')
    expect(result.current.stakeData).toEqual({ hash: 'stake-stakingManager-txHash', wait: expect.any(Function) })
    expect(result.current.stakeEnabled).toBe(true)
    expect(result.current.stakeError).toBe(undefined)
    expect(result.current.stakeStatus).toBe('success')
    expect(approveMock).toHaveBeenCalled()
    expect(stakeMock).toHaveBeenCalled()
  })

  it('Should approve and stake to Gnosis if migration is selected', async () => {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    const useBalanceSpy = jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: ethers.utils.parseEther('100') } })
    const useContractReadSpy = jest.spyOn(wagmi, 'useContractRead').mockReturnValue({
      data: ethers.utils.parseEther('100'),
      status: 'success'
    })
    const usePrepareContractWriteSpy = jest.spyOn(wagmi, 'usePrepareContractWrite')
    usePrepareContractWriteSpy.mockImplementation(usePrepareContractWriteMock)
    const useContractWriteSpy = jest.spyOn(wagmi, 'useContractWrite')
    useContractWriteSpy.mockImplementation(useContractWriteMock)
    const useWaitForTransactionSpy = jest.spyOn(wagmi, 'useWaitForTransaction')
    useWaitForTransactionSpy.mockImplementation(useWaitForTransactionMock)
    const USER_DATA =
      '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000020000000000000000000000008805aa0c1a8e59b03fa95740f691e28942cf44f6000000000000000000000000dee8ebe2b7152eccd935fd67134bf1bad55302bc0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000dee8ebe2b7152eccd935fd67134bf1bad55302bc0000000000000000000000000000000000000000000000056a6418b5058600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000642b54f55100000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000056a6418b5058600000000000000000000000000000000000000000000000000000000000000093a8000000000000000000000000000000000000000000000000000000000'

    const { result } = renderHook(() => useStake({ migration: true }))

    act(() => {
      result.current.setAmount('100')
      result.current.approve()
      result.current.stake()
    })

    expect(useBalanceSpy).toHaveBeenCalledWith({
      token: settings.contracts.pnt,
      address: '0x1234567890123456789012345678901234567890'
    })
    expect(useContractReadSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'allowance',
      args: ['0x1234567890123456789012345678901234567890', settings.contracts.forwarder]
    })
    expect(usePrepareContractWriteSpy).toHaveBeenCalledWith({
      address: settings.contracts.pnt,
      abi: wagmi.erc20ABI,
      functionName: 'approve',
      args: [settings.contracts.forwarder, ethers.utils.parseEther('100')],
      enabled: false
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: 'approve-forwarder-txHash'
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('approve-forwarder')
    // calls to the hook causes usePrepareContractWrite to be called multiple times for both approval and staking
    // Here the check is focused on the last call
    expect(usePrepareContractWriteSpy).toHaveBeenNthCalledWith(8, {
      address: settings.contracts.forwarder,
      abi: ForwarderABI,
      functionName: 'call',
      args: [
        ethers.utils.parseEther('100'),
        settings.contracts.forwarderOnGnosis,
        USER_DATA,
        settings.pnetworkIds.gnosis
      ],
      enabled: true
    })
    expect(useWaitForTransactionSpy).toHaveBeenCalledWith({
      hash: 'stake-forwarder-txHash'
    })
    expect(useContractWriteSpy).toHaveBeenCalledWith('stake-forwarder')
    expect(result.current.amount).toBe('100')
    expect(result.current.allowance).toEqual(ethers.utils.parseEther('100'))
    expect(result.current.approveData).toEqual({ hash: 'approve-forwarder-txHash', wait: expect.any(Function) })
    expect(result.current.approveEnabled).toBe(false)
    expect(result.current.approveError).toBe(undefined)
    expect(result.current.approved).toBe(true)
    expect(result.current.duration).toBe(7)
    expect(result.current.isApproving).toBe(false)
    expect(result.current.isStaking).toBe(false)
    expect(result.current.receiver).toBe('0x1234567890123456789012345678901234567890')
    expect(result.current.stakeData).toEqual({ hash: 'stake-forwarder-txHash', wait: expect.any(Function) })
    expect(result.current.stakeEnabled).toBe(true)
    expect(result.current.stakeError).toBe(undefined)
    expect(result.current.stakeStatus).toBe('success')
    expect(approveMock).toHaveBeenCalled()
    expect(stakeMock).toHaveBeenCalled()
  })
})
