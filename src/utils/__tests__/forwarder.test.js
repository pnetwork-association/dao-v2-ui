import { subtractFee } from '../preparers/forwarder'

describe('preparers for forwarder', () => {
  describe('subtractFee', () => {
    it('should subtract fees for host-to-host', () => {
      expect(subtractFee(10000, false)).toEqual(9975n)
      expect(subtractFee('10000', false)).toEqual(9975n)
    })
    it('should subtract fees for native-to-host', () => {
      expect(subtractFee(10000, true)).toEqual(9990n)
      expect(subtractFee('10000', true)).toEqual(9990n)
    })
  })
})
