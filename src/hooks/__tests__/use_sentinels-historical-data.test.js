import { handlePartialData } from '../use-sentinels-historical-data'
import { completeData, partialData } from './api.data'

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
