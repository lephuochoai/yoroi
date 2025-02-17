import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'

import {mocks} from '../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {StakingCenter} from './StakingCenter'

storiesOf('StakingCenter', module)
  .add('loaded', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,
          createDelegationTx: mocks.createDelegationTx.success,
        }}
      >
        <StakingCenter />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
  .add('loading', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,
          createDelegationTx: mocks.createDelegationTx.loading,
        }}
      >
        <StakingCenter />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
  .add('error', () => (
    <QueryClientProvider client={new QueryClient()}>
      <WalletManagerProviderMock
        wallet={{
          ...mocks.wallet,
          createDelegationTx: mocks.createDelegationTx.error,
        }}
      >
        <StakingCenter />
      </WalletManagerProviderMock>
    </QueryClientProvider>
  ))
