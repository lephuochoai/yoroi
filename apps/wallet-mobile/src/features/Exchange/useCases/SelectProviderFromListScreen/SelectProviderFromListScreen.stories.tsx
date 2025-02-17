import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SelectProviderFromListScreen} from './SelectProviderFromListScreen'

storiesOf('Exchange SelectProviderFromListScreen', module).add('Default', () => {
  return (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
        <View style={styles.container}>
          <SelectProviderFromListScreen />
        </View>
      </ExchangeProvider>
    </WalletManagerProviderMock>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
