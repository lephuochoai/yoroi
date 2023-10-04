import {Swap, Balance} from '@yoroi/types'

import {getBestSellPool} from './getBestSellPool'
import {getSellAmount} from './getSellAmount'

describe('getBestSellPool', () => {
  it('should return pool with min possible tokens to sell', () => {
    const pool1: Swap.Pool = {
      tokenA: {quantity: '522195900', tokenId: 'tokenA'},
      tokenB: {quantity: '7442057385', tokenId: 'tokenB'},
      tokenAPriceLovelace: '0',
      tokenBPriceLovelace: '0',
      fee: '0.3', // 0.3%
      provider: 'muesliswap_v2',
      price: 0,
      batcherFee: {quantity: '950000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool2: Swap.Pool = {
      tokenA: {quantity: '157622738316', tokenId: 'tokenA'},
      tokenB: {quantity: '2432884054682', tokenId: 'tokenB'},
      tokenAPriceLovelace: '0',
      tokenBPriceLovelace: '0',
      fee: '0.3', // 0.3%
      provider: 'vyfi',
      price: 0,
      batcherFee: {quantity: '1900000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool3: Swap.Pool = {
      tokenA: {quantity: '27273832383672', tokenId: 'tokenA'},
      tokenB: {quantity: '419770997375770', tokenId: 'tokenB'},
      tokenAPriceLovelace: '0',
      tokenBPriceLovelace: '0',
      fee: '0.3', // 0.3%
      provider: 'minswap',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool4: Swap.Pool = {
      tokenA: {quantity: '3324463783', tokenId: 'tokenA'},
      tokenB: {quantity: '50335968991', tokenId: 'tokenB'},
      tokenAPriceLovelace: '0',
      tokenBPriceLovelace: '0',
      fee: '0.35', // 0.3%
      provider: 'wingriders',
      price: 0,
      batcherFee: {quantity: '2000000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool5: Swap.Pool = {
      tokenA: {quantity: '9776356330', tokenId: 'tokenA'},
      tokenB: {quantity: '149474209737', tokenId: 'tokenB'},
      tokenAPriceLovelace: '0',
      tokenBPriceLovelace: '0',
      fee: '0.35', // 0.35%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const pool6: Swap.Pool = {
      tokenA: {quantity: '934171347', tokenId: 'tokenA'},
      tokenB: {quantity: '14274535204', tokenId: 'tokenB'},
      tokenAPriceLovelace: '0',
      tokenBPriceLovelace: '0',
      fee: '0.05', // 0.05%
      provider: 'sundaeswap',
      price: 0,
      batcherFee: {quantity: '2500000', tokenId: ''},
      deposit: {quantity: '2000000', tokenId: ''},
      poolId: '0',
      lastUpdate: '0',
      lpToken: {
        quantity: '0',
        tokenId: '0',
      },
    }

    const buy: Balance.Amount = {
      quantity: '1000000000',
      tokenId: 'tokenB',
    }

    const pools = [pool1, pool2, pool3, pool4, pool5, pool6]
    const bestSellPool = getBestSellPool(pools, buy)
    expect(bestSellPool?.provider).toBe('vyfi')

    if (bestSellPool) {
      const sellAmount = getSellAmount(bestSellPool, buy)
      expect(sellAmount.quantity).toBe('65010104')
    }
  })
})
