import { expect, it, vi, describe } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import * as wagmi from 'wagmi'

import { useCreateProposal } from '../use-proposals'

const PROPOSAL_SCRIPT =
  '0x00000001139ad01cacbbe51b4a2b099e52c47693ba87351b00000064beabacc8000000000000000000000000f4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2000000000000000000000000f1f6568a76559d85cf68e6597fa587544184dd460000000000000000000000000000000000000000000000000de0b6b3a7640000'
const INVALID_PROPOSAL_SCRIPT =
  '0xd01cacbbe51b4a2b099e52c47693ba87351b00000064beabacc8000000Zf4ea6b892853413bd9d9f1a5d3a620a0ba39c5b2000000000000000000000000f1f6568a76559d85cf68e6597fa587544184dd460000000000000000000000000000000000000000000000000de0b6b3a7640000'
const VALID_IPFS_MULTIHASH = 'QmRSJ13Zy8w1xUpyKEDiyZEWcTXVc4arjb1agJkuv1Ghri'
const INVALID_IPFS_MULTIHASH = '-DmRSJ13Zy8w1xUpyKEDiyZEWcTXVc4arjb1agJkuv1Ghri'

vi.mock('../../utils/role', () => {
  return {
    getRole: vi.fn(() => '0xe7dcd7275292e064d090fbc5f3bd7995be23b502c1fed5cd94cfddbbdcd32bbc')
  }
})
vi.mock('wagmi', async (importOriginal) => {
  const orginalLib = await importOriginal()
  return {
    ...orginalLib,
    useAccount: vi.fn(() => {
      return {
        address: '0xb794f5ea0ba39494ce839613fffba74279579268'
      }
    }),
    useBalance: vi.fn(() => {
      return {
        data: {
          value: 200000n
        }
      }
    }),
    useSimulateContract: vi.fn(() => {
      return {
        request: [PROPOSAL_SCRIPT, 'alj https://ipfs.io/ipfs/QmRSJ13Zy8w1xUpyKEDiyZEWcTXVc4arjb1agJkuv1Ghri', false]
      }
    }),
    useWriteContract: vi.fn(() => {
      return {
        writeContract: () => 'proposal-created',
        error: undefined,
        data: 'proposal-data',
        isLoading: false
      }
    })
  }
})

describe('use-proposal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('Should prevent create proposal if account has not permission', () => {
    const useReadContractsMock = vi.spyOn(wagmi, 'useReadContracts')
    useReadContractsMock.mockReturnValue({
      data: [
        {
          result: false,
          status: 'success'
        },
        {
          result: 200000000000000000000000n,
          status: 'success'
        }
      ]
    })

    const { result } = renderHook(() => useCreateProposal())

    expect(result.current.canCreateProposal).toBeFalsy()
    expect(result.current.createProposal()).toBe('proposal-created')
    expect(result.current.createProposalData).toBe('proposal-data')
    expect(result.current.createProposalError).toBe(undefined)
    expect(result.current.hasPermission).toBeFalsy()
    expect(result.current.hasPermissionOrEnoughBalance).toBeFalsy()
    expect(result.current.ipfsMultihash).toBe('')
    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.isScriptValid).toBeFalsy()
    expect(result.current.isValidIpfsMultiHash).toBeFalsy()
    expect(result.current.metadata).toBe('')
    expect(result.current.minOpenVoteAmount).toBe(200000000000000000000000n)
    expect(result.current.script).toBe('')
    expect(result.current.showScript).toBeFalsy()
  })

  it('Should allow create proposal if account has permission ', () => {
    const mockWagmi = vi.spyOn(wagmi, 'useReadContracts')
    mockWagmi.mockReturnValue({
      data: [
        {
          result: true,
          status: 'success'
        },
        {
          result: 2000000000000000000000000n,
          status: 'success'
        }
      ]
    })

    const useBalance = vi.spyOn(wagmi, 'useBalance')
    useBalance.mockReturnValue({
      data: {
        value: 1999999999999999999999999n
      }
    })

    const { result } = renderHook(() => useCreateProposal())

    expect(result.current.canCreateProposal).toBeFalsy()
    expect(result.current.createProposal()).toBe('proposal-created')
    expect(result.current.createProposalData).toBe('proposal-data')
    expect(result.current.createProposalError).toBe(undefined)
    expect(result.current.hasPermission).toBeTruthy()
    expect(result.current.hasPermissionOrEnoughBalance).toBeTruthy()
    expect(result.current.ipfsMultihash).toBe('')
    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.isScriptValid).toBeFalsy()
    expect(result.current.isValidIpfsMultiHash).toBeFalsy()
    expect(result.current.metadata).toBe('')
    expect(result.current.minOpenVoteAmount).toBe(2000000000000000000000000n)
    expect(result.current.script).toBe('')
    expect(result.current.showScript).toBeFalsy()
  })

  it('Should allow create proposal if account has enough daoPNT ', () => {
    const mockWagmi = vi.spyOn(wagmi, 'useReadContracts')
    mockWagmi.mockReturnValue({
      data: [
        {
          result: false,
          status: 'success'
        },
        {
          result: 2000000000000000000000000n,
          status: 'success'
        }
      ]
    })

    const useBalance = vi.spyOn(wagmi, 'useBalance')
    useBalance.mockReturnValue({
      data: {
        value: 2000000000000000000000001n
      }
    })

    const { result } = renderHook(() => useCreateProposal())

    act(() => {
      result.current.setIpfsMultihash(VALID_IPFS_MULTIHASH)
      result.current.setMetadata('metadata')
      result.current.setShowScript(true)
      result.current.setScript(PROPOSAL_SCRIPT)
    })

    expect(result.current.canCreateProposal).toBeTruthy()
    expect(result.current.createProposal()).toBe('proposal-created')
    expect(result.current.createProposalData).toBe('proposal-data')
    expect(result.current.createProposalError).toBe(undefined)
    expect(result.current.hasPermission).toBeFalsy()
    expect(result.current.hasPermissionOrEnoughBalance).toBeTruthy()
    expect(result.current.ipfsMultihash).toBe(VALID_IPFS_MULTIHASH)
    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.isScriptValid).toBeTruthy()
    expect(result.current.isValidIpfsMultiHash).toBeTruthy()
    expect(result.current.metadata).toBe('metadata')
    expect(result.current.minOpenVoteAmount).toBe(2000000000000000000000000n)
    expect(result.current.script).toBe(PROPOSAL_SCRIPT)
    expect(result.current.showScript).toBeTruthy()
  })

  it('Should prevent create proposal if it has invalid IPFS multihash', () => {
    const mockWagmi = vi.spyOn(wagmi, 'useReadContracts')
    mockWagmi.mockReturnValue({
      data: [
        {
          result: false,
          status: 'success'
        },
        {
          result: 2000000000000000000000000n,
          status: 'success'
        }
      ]
    })

    const useBalance = vi.spyOn(wagmi, 'useBalance')
    useBalance.mockReturnValue({
      data: {
        value: 2000000000000000000000001n
      }
    })

    const { result } = renderHook(() => useCreateProposal())

    act(() => {
      result.current.setIpfsMultihash(INVALID_IPFS_MULTIHASH)
      result.current.setMetadata('metadata')
      result.current.setShowScript(true)
      result.current.setScript(PROPOSAL_SCRIPT)
    })

    expect(result.current.canCreateProposal).toBeFalsy()
    expect(result.current.createProposal()).toBe('proposal-created')
    expect(result.current.createProposalData).toBe('proposal-data')
    expect(result.current.createProposalError).toBe(undefined)
    expect(result.current.hasPermission).toBeFalsy()
    expect(result.current.hasPermissionOrEnoughBalance).toBeTruthy()
    expect(result.current.ipfsMultihash).toBe(INVALID_IPFS_MULTIHASH)
    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.isScriptValid).toBeTruthy()
    expect(result.current.isValidIpfsMultiHash).toBeFalsy()
    expect(result.current.metadata).toBe('metadata')
    expect(result.current.minOpenVoteAmount).toBe(2000000000000000000000000n)
    expect(result.current.script).toBe(PROPOSAL_SCRIPT)
    expect(result.current.showScript).toBeTruthy()
  })

  it('Should prevent create proposal if it has invalid script', () => {
    const mockWagmi = vi.spyOn(wagmi, 'useReadContracts')
    mockWagmi.mockReturnValue({
      data: [
        {
          result: false,
          status: 'success'
        },
        {
          result: 2000000000000000000000000n,
          status: 'success'
        }
      ]
    })

    const useBalance = vi.spyOn(wagmi, 'useBalance')
    useBalance.mockReturnValue({
      data: {
        value: 2000000000000000000000001n
      }
    })

    const { result } = renderHook(() => useCreateProposal())

    act(() => {
      result.current.setIpfsMultihash(VALID_IPFS_MULTIHASH)
      result.current.setMetadata('metadata')
      result.current.setShowScript(true)
      result.current.setScript(INVALID_PROPOSAL_SCRIPT)
    })

    expect(result.current.canCreateProposal).toBeFalsy()
    expect(result.current.createProposal()).toBe('proposal-created')
    expect(result.current.createProposalData).toBe('proposal-data')
    expect(result.current.createProposalError).toBe(undefined)
    expect(result.current.hasPermission).toBeFalsy()
    expect(result.current.hasPermissionOrEnoughBalance).toBeTruthy()
    expect(result.current.ipfsMultihash).toBe(VALID_IPFS_MULTIHASH)
    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.isScriptValid).toBeFalsy()
    expect(result.current.isValidIpfsMultiHash).toBeTruthy()
    expect(result.current.metadata).toBe('metadata')
    expect(result.current.minOpenVoteAmount).toBe(2000000000000000000000000n)
    expect(result.current.script).toBe(INVALID_PROPOSAL_SCRIPT)
    expect(result.current.showScript).toBeTruthy()
  })
})
