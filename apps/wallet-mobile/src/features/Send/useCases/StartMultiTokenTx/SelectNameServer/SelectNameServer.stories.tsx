import {init} from '@emurgo/cross-csl-mobile'
import {storiesOf} from '@storybook/react-native'
import {tokenBalanceMocks} from '@yoroi/portfolio'
import {resolverApiMaker, resolverManagerMaker, ResolverProvider, resolverStorageMaker} from '@yoroi/resolver'
import {defaultTransferState, TransferProvider, TransferState} from '@yoroi/transfer'
import {Resolver} from '@yoroi/types'
import * as React from 'react'

import {QueryProvider} from '../../../../../../.storybook/decorators'
import {Boundary} from '../../../../../components'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SelectNameServer} from './SelectNameServer'

storiesOf('Send SelectNameServer', module)
  .addDecorator((story) => {
    const wallet: YoroiWallet = walletMocks.wallet

    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={wallet}>{story()}</WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('unselected NS', () => <UnselectedNS />)
  .add('selected NS', () => <SelectedNS />)

const UnselectedNS = () => {
  const resolverApi = resolverApiMaker({
    apiConfig: {
      [Resolver.NameServer.Unstoppable]: {
        apiKey: 'apiKey',
      },
    },
    cslFactory: init,
  })
  const resolverStorage = resolverStorageMaker()
  const resolverManager = resolverManagerMaker(resolverStorage, resolverApi)

  return (
    <TransferProvider initialState={mockUnselectedNameServer}>
      <ResolverProvider resolverManager={resolverManager}>
        <Boundary>
          <SelectNameServer />
        </Boundary>
      </ResolverProvider>
    </TransferProvider>
  )
}

const SelectedNS = () => {
  const resolverApi = resolverApiMaker({
    apiConfig: {
      [Resolver.NameServer.Unstoppable]: {
        apiKey: 'apiKey',
      },
    },
    cslFactory: init,
  })
  const resolverStorage = resolverStorageMaker()
  const resolverManager = resolverManagerMaker(resolverStorage, resolverApi)

  return (
    <TransferProvider initialState={mockSelectedNameServer}>
      <ResolverProvider resolverManager={resolverManager}>
        <Boundary>
          <SelectNameServer />
        </Boundary>
      </ResolverProvider>
    </TransferProvider>
  )
}

const mockSelectedNameServer: TransferState = {
  ...defaultTransferState,
  targets: [
    {
      entry: {
        address: 'addr1vxggvx6uq9mtf6e0tyda2mahg84w8azngpvkwr5808ey6qsy2ww7d',
        amounts: {
          [tokenBalanceMocks.primaryETH.info.id]: tokenBalanceMocks.primaryETH,
        },
      },
      receiver: {
        as: 'domain',
        resolve: '$stackchain',
        selectedNameServer: Resolver.NameServer.Cns,
        addressRecords: {
          handle: 'addr1vxggvx6uq9mtf6e0tyda2mahg84w8azngpvkwr5808ey6qsy2ww7d',
          cns: 'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
        },
      },
    },
  ],
}
const mockUnselectedNameServer: TransferState = {
  ...defaultTransferState,
  targets: [
    {
      entry: {
        address: '',
        amounts: {
          [tokenBalanceMocks.primaryETH.info.id]: tokenBalanceMocks.primaryETH,
        },
      },
      receiver: {
        as: 'domain',
        resolve: '$stackchain',
        selectedNameServer: undefined,
        addressRecords: {
          handle: 'addr1vxggvx6uq9mtf6e0tyda2mahg84w8azngpvkwr5808ey6qsy2ww7d',
          cns: 'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
        },
      },
    },
  ],
}
