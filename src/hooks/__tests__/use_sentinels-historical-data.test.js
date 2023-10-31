import { handlePartialData, getEpochsFromRawData } from '../use-sentinels-historical-data'
import { completeData, partialData } from './api.data'
import axios from 'axios'

jest.mock('axios')

it('should elaborate data', () => {
  const pData = handlePartialData(partialData)
  const cData = handlePartialData(completeData)
  const nData = handlePartialData(0)
  expect(typeof pData).toBe('object')
  expect(typeof cData).toBe('object')
  expect(nData).toBe(null)
  expect(pData['epochs']['45']['fees']['pBTC']['amount']).toBe('NaN')
  expect(pData['epochs']['18']).toEqual(cData['epochs']['18'])
})

it('should retreive partial data', async () => {
  axios.get.mockResolvedValue({ data: partialData })
  const { epochs: expectedData } = handlePartialData(partialData)
  const data = await getEpochsFromRawData()
  expect(data).toEqual(expectedData)
})

it('should retreive data', async () => {
  axios.get.mockResolvedValue({ data: completeData })
  const { epochs: expectedData } = handlePartialData(completeData)
  const data = await getEpochsFromRawData()
  expect(data).toEqual(expectedData)
})

it('throws if data is neither a object or a string', async () => {
  try {
    axios.get.mockResolvedValue({ data: 0 })
    void (await getEpochsFromRawData())
    fail()
  } catch (_err) {
    expect(_err.message).toBe('Unrecongnized data type')
  }
})

it('throws if epochs field is missing', async () => {
  try {
    axios.get.mockResolvedValue({ data: { files: 2 } })
    void (await getEpochsFromRawData())
    fail()
  } catch (_err) {
    expect(_err.message).toBe('Data do not contain epochs information')
  }
})
