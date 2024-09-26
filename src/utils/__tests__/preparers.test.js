import { subtractFee } from '../preparers'

describe('preparers', () => {
  describe('subtractFee', () => {
    it('should correctly subtract fees', () => {
      expect(subtractFee(10000)).toEqual(9990n)
      expect(subtractFee('10000')).toEqual(9990n)
      expect(subtractFee('100')).toEqual(99n)
    })
  })
})
