import { waitFor, render, screen, act, fireEvent } from '@testing-library/react'
import BigNumber from 'bignumber.js'
const { BigNumber: EthersBigNumber, utils } = require('ethers')
const wagmi = require('wagmi')

import MigrateModal from '..'
import * as useStakingManager from '../../../../hooks/use-staking-manager'

jest.mock('../../../../hooks/use-staking-manager', () => {
  return {
    useUserStake: jest.fn(),
    useUnstake: jest.fn(),
    useStake: jest.fn()
  }
})

jest.mock('../../../../utils/transaction', () => {
  return {
    toastifyTransaction: jest.fn()
  }
})
jest.mock('../../../../components/base/Icon/index')
jest.mock('../../../../components/base/Slider/index')

const setUnstakeAmountSpy = jest.fn()
const setStakeAmountSpy = jest.fn()
const setReceiverSpy = jest.fn()
const unstakeSpy = jest.fn()
const approveSpy = jest.fn()
const stakeSpy = jest.fn()
const unstakeDataMock = {
  hash: 'unstake-txHash',
  wait: () => new Promise((resolve) => setTimeout(() => resolve('unstake-data'), 1000))
}
const approveDataMock = {
  hash: 'approve-txHash',
  wait: () => new Promise((resolve) => setTimeout(() => resolve('approve-data'), 1000))
}
const stakeDataMock = {
  hash: 'stake-txHash',
  wait: () => new Promise((resolve) => setTimeout(() => resolve('stake-data'), 1000))
}

describe('MigrateModal', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('Should not show migrate pop up if no PNT to unstake are available', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('0'),
      fomattedAvailableToUnstakePntAmount: '0 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '0',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: () => {},
      unstakeData: undefined,
      unstakeError: undefined,
      unstakeStatus: 'idle'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '0',
      approve: () => {},
      approved: () => {},
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: () => {},
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: false,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest.spyOn(wagmi, 'useBalance').mockReturnValue({ data: { value: EthersBigNumber.from('0') } })

    const { container } = render(<MigrateModal />)
    expect(container).toBeEmptyDOMElement()
  })

  it('Should show popup and begin button if PNT to unstake are available', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('1999792.63154'),
      fomattedAvailableToUnstakePntAmount: '1,999,792.632 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '0',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: undefined, //{ hash: 'unstake-txHash', wait: () => new Promise(resolve => setTimeout(() => resolve('approve-forwarder-data'), 1000))}
      unstakeError: undefined,
      unstakeStatus: 'idle'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '0',
      approve: () => {},
      approved: () => {},
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: () => {},
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: false,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest.spyOn(wagmi, 'useBalance').mockReturnValue({ data: { value: EthersBigNumber.from('0') } })

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    const beginButton = screen.getByText('Migrate 1,999,792.632 PNT')
    expect(beginButton).toBeInTheDocument()
    localStorageCheck = { ...localStorage }
    expect(localStorage.length).toBe(0)
    fireEvent.click(beginButton)
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'started',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })

    // Check setUnstakeAmount and setSstakeAmount
    // Mocked setAmount functions do not actually set the amounts, therefore they are called twice because of useEffect.
    // This however is not representative of the actual hook interaction: for this reason only the last call is checked.
    expect(setUnstakeAmountSpy).toHaveBeenLastCalledWith('1999792.63154')
    expect(setStakeAmountSpy).toHaveBeenLastCalledWith('1999792.63154')
    expect(setReceiverSpy).toHaveBeenLastCalledWith('0x1234567890123456789012345678901234567890')
    const unstakeButton = screen.getByRole('button', { name: 'Unstake from DAOv1' })
    expect(unstakeButton).toBeInTheDocument()
  })

  it('Should call unstake if amount is set and status is started', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('1999792.63154'),
      fomattedAvailableToUnstakePntAmount: '1,999,792.632 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: undefined, //{ hash: 'unstake-txHash', wait: () => new Promise(resolve => setTimeout(() => resolve('approve-forwarder-data'), 1000))}
      unstakeError: undefined,
      unstakeStatus: 'idle'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '0',
      approve: () => {},
      approved: () => {},
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: () => {},
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: false,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest.spyOn(wagmi, 'useBalance').mockReturnValue({ data: { value: EthersBigNumber.from('0') } })

    localStorage.setItem('migration-status', 'started')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    // stakeAmount is 0: the component should try to set it to the localStorage found amount
    expect(setStakeAmountSpy).toHaveBeenLastCalledWith('1999792.63154')
    expect(setReceiverSpy).toHaveBeenLastCalledWith('0x1234567890123456789012345678901234567890')
    const unstakeButton = screen.getByRole('button', { name: 'Unstake from DAOv1' })
    expect(unstakeButton).toBeInTheDocument()
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'started',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
    fireEvent.click(unstakeButton)
    expect(unstakeSpy).toHaveBeenCalled()
  })

  it('Should display loading spinner if isUnstaking', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('1999792.63154'),
      fomattedAvailableToUnstakePntAmount: '1,999,792.632 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: true,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: undefined, //{ hash: 'unstake-txHash', wait: () => new Promise(resolve => setTimeout(() => resolve('approve-forwarder-data'), 1000))}
      unstakeError: undefined,
      unstakeStatus: 'idle'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '0',
      approve: () => {},
      approved: () => {},
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '0x1234567890123456789012345678901234567890',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: () => {},
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: false,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest.spyOn(wagmi, 'useBalance').mockReturnValue({ data: { value: EthersBigNumber.from('0') } })

    localStorage.setItem('migration-status', 'started')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    // stakeAmount is 0: the component should try to set it to the localStorage found amount
    expect(setStakeAmountSpy).toHaveBeenLastCalledWith('1999792.63154')
    expect(setUnstakeAmountSpy).not.toHaveBeenCalled()
    expect(setReceiverSpy).not.toHaveBeenCalled()
    const unstakeText = screen.getByText('Unstake from DAOv1')
    const unstakeLoading = screen.getByTestId('loader-unstake')
    expect(unstakeText).toBeInTheDocument()
    expect(unstakeLoading).toBeInTheDocument()
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'started',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
  })

  it("Should move to 'unstaked' state if unstake succeded", async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('1999792.63154'),
      fomattedAvailableToUnstakePntAmount: '1,999,792.632 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: unstakeDataMock,
      unstakeError: undefined,
      unstakeStatus: 'success'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '1999792.63154',
      approve: () => {},
      approved: () => {},
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: () => {},
      stake: () => {},
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: false,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest.spyOn(wagmi, 'useBalance').mockReturnValue({ data: { value: EthersBigNumber.from('0') } })

    localStorage.setItem('migration-status', 'started')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'unstaked',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
    expect(setStakeAmountSpy).not.toHaveBeenCalled()
    expect(setUnstakeAmountSpy).not.toHaveBeenCalled()
    const stakeText = screen.getByText('Stake to DAOv3')
    const stakeLoading = screen.getByTestId('loader')
    expect(stakeText).toBeInTheDocument()
    expect(stakeLoading).toBeInTheDocument()
  })

  it('Should enable approve when unstaked PNT are received', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('0'),
      fomattedAvailableToUnstakePntAmount: '0 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: unstakeDataMock,
      unstakeError: undefined,
      unstakeStatus: 'success'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '1999792.63154',
      approve: approveSpy,
      approved: false,
      approveData: undefined,
      approveEnabled: true,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '0x1234567890123456789012345678901234567890',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: () => {},
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: false,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: EthersBigNumber.from('1999792631540000000000000') } })

    localStorage.setItem('migration-status', 'unstaked')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    expect(setStakeAmountSpy).not.toHaveBeenCalled()
    expect(setUnstakeAmountSpy).not.toHaveBeenCalled()
    const approveButton = screen.getByRole('button', { name: 'Approve stake' })
    expect(approveButton).toBeInTheDocument()
    fireEvent.click(approveButton)
    expect(approveSpy).toHaveBeenCalled()
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'unstaked',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
  })

  it('Should display loading spinner if isApproving', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('0'),
      fomattedAvailableToUnstakePntAmount: '0 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: unstakeDataMock,
      unstakeError: undefined,
      unstakeStatus: 'success'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '1999792.63154',
      approve: approveSpy,
      approved: false,
      approveData: undefined,
      approveEnabled: true,
      approveError: undefined,
      duration: 7,
      isApproving: true,
      isStaking: false,
      receiver: '0x1234567890123456789012345678901234567890',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: () => {},
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: false,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: EthersBigNumber.from('1999792631540000000000000') } })

    localStorage.setItem('migration-status', 'unstaked')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    expect(setStakeAmountSpy).not.toHaveBeenCalled()
    expect(setUnstakeAmountSpy).not.toHaveBeenCalled()
    expect(setReceiverSpy).not.toHaveBeenCalled()
    const unstakeText = screen.getByText('Stake to DAOv3')
    const unstakeLoading = screen.getByTestId('loader-approve')
    expect(unstakeText).toBeInTheDocument()
    expect(unstakeLoading).toBeInTheDocument()
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'unstaked',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
  })

  it('Should display loading spinner if approved but allowance still not updated', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('0'),
      fomattedAvailableToUnstakePntAmount: '0 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: unstakeDataMock,
      unstakeError: undefined,
      unstakeStatus: 'success'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '1999792.63154',
      approve: approveSpy,
      approved: true,
      approveData: approveDataMock,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '0x1234567890123456789012345678901234567890',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: () => {},
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: false,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: EthersBigNumber.from('1999792631540000000000000') } })

    localStorage.setItem('migration-status', 'unstaked')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    expect(setStakeAmountSpy).not.toHaveBeenCalled()
    expect(setUnstakeAmountSpy).not.toHaveBeenCalled()
    expect(setReceiverSpy).not.toHaveBeenCalled()
    const unstakeText = screen.getByText('Stake to DAOv3')
    const unstakeLoading = screen.getByTestId('loader')
    expect(unstakeText).toBeInTheDocument()
    expect(unstakeLoading).toBeInTheDocument()
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'unstaked',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
  })

  it('Should display enable staking if allowance is sufficient', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('0'),
      fomattedAvailableToUnstakePntAmount: '0 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: unstakeDataMock,
      unstakeError: undefined,
      unstakeStatus: 'success'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('1999792631540000000000000'),
      amount: '1999792.63154',
      approve: approveSpy,
      approved: true,
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '0x1234567890123456789012345678901234567890',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: stakeSpy,
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: true,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: EthersBigNumber.from('1999792631540000000000000') } })

    localStorage.setItem('migration-status', 'unstaked')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    expect(setStakeAmountSpy).not.toHaveBeenCalled()
    expect(setUnstakeAmountSpy).not.toHaveBeenCalled()
    expect(setReceiverSpy).not.toHaveBeenCalled()
    const stakeButton = screen.getByRole('button', { name: 'Stake on DAOv3' })
    expect(stakeButton).toBeInTheDocument()
    fireEvent.click(stakeButton)
    expect(stakeSpy).toHaveBeenCalled()
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'unstaked',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
  })

  it('Should display additional options enable staking if allowance is sufficient', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('0'),
      fomattedAvailableToUnstakePntAmount: '0 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: unstakeDataMock,
      unstakeError: undefined,
      unstakeStatus: 'success'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('1999792631540000000000000'),
      amount: '1999792.63154',
      approve: approveSpy,
      approved: true,
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '0x1234567890123456789012345678901234567890',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: stakeSpy,
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: true,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: EthersBigNumber.from('1999792631540000000000000') } })

    localStorage.setItem('migration-status', 'unstaked')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    expect(setStakeAmountSpy).not.toHaveBeenCalled()
    expect(setUnstakeAmountSpy).not.toHaveBeenCalled()
    expect(setReceiverSpy).not.toHaveBeenCalled()
    const optionsButton = screen.getByText('Show advanced Options')
    expect(optionsButton).toBeInTheDocument()
    fireEvent.click(optionsButton)
    const lockTimeOption = screen.getByText('Lock time')
    expect(lockTimeOption).toBeInTheDocument()
    const receiverOption = screen.getByPlaceholderText('receiver here ....')
    expect(receiverOption).toBeInTheDocument()
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'unstaked',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
  })

  it('Should move to finish if staked successfully', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('0'),
      fomattedAvailableToUnstakePntAmount: '0 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '1999792.63154',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: unstakeDataMock,
      unstakeError: undefined,
      unstakeStatus: 'success'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('1999792631540000000000000'),
      amount: '1999792.63154',
      approve: approveSpy,
      approved: true,
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '0x1234567890123456789012345678901234567890',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: stakeSpy,
      stakeStatus: 'success',
      stakeData: stakeDataMock,
      stakeEnabled: true,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest
      .spyOn(wagmi, 'useBalance')
      .mockReturnValue({ data: { value: EthersBigNumber.from('1999792631540000000000000') } })

    localStorage.setItem('migration-status', 'unstaked')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    const { container } = await act(async () => render(<MigrateModal />))

    let localStorageCheck
    await waitFor(() => expect(screen.getByText(/Migrate to the new pNetwork DAO/)).toBeInTheDocument())
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'staked',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
    expect(setStakeAmountSpy).not.toHaveBeenCalled()
    expect(setUnstakeAmountSpy).not.toHaveBeenCalled()
    expect(setReceiverSpy).not.toHaveBeenCalled()
    const finishButton = screen.getByRole('button', { name: 'Finish' })
    expect(finishButton).toBeInTheDocument()
    fireEvent.click(finishButton)
    localStorageCheck = { ...localStorage }
    expect(localStorageCheck).toEqual({
      'migration-status': 'finish',
      'migration-account': '0x1234567890123456789012345678901234567890',
      'migration-amount': '1999792.63154'
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('Should not show migrate pop up if already finished', async () => {
    jest.spyOn(useStakingManager, 'useUserStake').mockReturnValue({
      availableToUnstakePntAmount: BigNumber('0'),
      fomattedAvailableToUnstakePntAmount: '0 PNT',
      status: 'success'
    })
    jest.spyOn(useStakingManager, 'useUnstake').mockReturnValue({
      amount: '0',
      isUnstaking: false,
      setAmount: setUnstakeAmountSpy,
      unstake: unstakeSpy,
      unstakeData: unstakeDataMock,
      unstakeError: undefined,
      unstakeStatus: 'success'
    })
    jest.spyOn(useStakingManager, 'useStake').mockReturnValue({
      allowance: EthersBigNumber.from('0'),
      amount: '0',
      approve: approveSpy,
      approved: false,
      approveData: undefined,
      approveEnabled: false,
      approveError: undefined,
      duration: 7,
      isApproving: false,
      isStaking: false,
      receiver: '',
      setAmount: setStakeAmountSpy,
      setApproved: () => {},
      setDuration: () => {},
      setReceiver: setReceiverSpy,
      stake: stakeSpy,
      stakeStatus: 'idle',
      stakeData: undefined,
      stakeEnabled: true,
      stakeError: undefined
    })
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    jest.spyOn(wagmi, 'useBalance').mockReturnValue({ data: { value: EthersBigNumber.from('0') } })

    localStorage.setItem('migration-status', 'finish')
    localStorage.setItem('migration-account', '0x1234567890123456789012345678901234567890')
    localStorage.setItem('migration-amount', '1999792.63154')

    const { container } = await act(async () => render(<MigrateModal />))
    expect(container).toBeEmptyDOMElement()
  })
})
