import {BalanceToken} from '../balance/token'
import {
  SwapCancelOrderData,
  SwapCompletedOrder,
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
} from './order'
import {SwapPool} from './pool'

export interface SwapApi {
  createOrder(orderData: SwapCreateOrderData): Promise<SwapCreateOrderResponse>
  cancelOrder(orderData: SwapCancelOrderData): Promise<string>
  getOpenOrders(): Promise<SwapOpenOrder[]>
  getCompletedOrders(): Promise<SwapCompletedOrder[]>
  getPools(args: {
    tokenA: BalanceToken['info']['id']
    tokenB: BalanceToken['info']['id']
  }): Promise<SwapPool[]>
  getTokens(tokenIdBase: BalanceToken['info']['id']): Promise<BalanceToken[]>
  stakingKey: string
  primaryTokenId: BalanceToken['info']['id']
}
