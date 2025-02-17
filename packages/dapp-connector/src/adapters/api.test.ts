import {dappConnectorApiMaker} from './api'
import {managerMock} from '../manager.mocks'

describe('dappConnectorApiMaker', () => {
  describe('getDApps', () => {
    it('should throw error if fetching fails', async () => {
      const fakeFetchData = () => Promise.reject(new Error('fake error'))
      await expect(() => dappConnectorApiMaker({request: fakeFetchData}).getDApps()).rejects.toThrow()
    })

    it('should throw error if response is invalid', async () => {
      const fakeResult = {tag: 'right' as const, value: {data: {dapps: 1}}} as const
      const fakeFetchData = () => Promise.resolve(fakeResult)
      await expect(() => dappConnectorApiMaker({request: fakeFetchData as any}).getDApps()).rejects.toThrow()
    })

    it('should throw error if response is left', async () => {
      const fakeResult = {tag: 'left' as const, error: {status: 404, message: 'Not found', responseData: null}} as const
      const fakeFetchData = () => Promise.resolve(fakeResult)
      await expect(() => dappConnectorApiMaker({request: fakeFetchData as any}).getDApps()).rejects.toThrow()
    })

    it('should return data if response is valid', async () => {
      const fakeResult = {tag: 'right' as const, value: {data: await managerMock.getDAppList()}} as const
      const fakeFetchData = () => Promise.resolve(fakeResult)
      const result = await dappConnectorApiMaker({request: fakeFetchData as any}).getDApps()
      expect(result).toEqual({
        ...fakeResult.value.data,
        dapps: fakeResult.value.data.dapps.map((d) => ({...d, logo: 'https://daehx1qv45z7c.cloudfront.net/icon.png'})),
      })
    })
  })
})
