import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {defaultStackNavigationOptions, WalletInitRoutes} from '../../kernel/navigation'
import {PreparingWalletScreen} from './common/PreparingWalletScreen/PreparingWalletScreen'
import {CheckNanoXScreen} from './legacy/CheckNanoX/CheckNanoXScreen'
import {ConnectNanoXScreen} from './legacy/ConnectNanoX/ConnectNanoXScreen'
import {ImportReadOnlyWalletScreen} from './legacy/ImportReadOnlyWallet/ImportReadOnlyWalletScreen'
import {SaveNanoXScreen} from './legacy/SaveNanoX/SaveNanoXScreen'
import {SaveReadOnlyWalletScreen} from './legacy/SaveReadOnlyWallet/SaveReadOnlyWalletScreen'
import {ChooseMnemonicTypeScreen} from './useCases/ChooseMnemonicType/ChooseMnemonicTypeScreen'
import {ChooseNetworkScreen} from './useCases/ChooseNetwork/ChooseNetworkScreen'
import {ChooseSetupTypeScreen} from './useCases/ChooseSetupType/ChooseSetupTypeScreen'
import {AboutRecoveryPhraseScreen} from './useCases/CreateWallet/AboutRecoveryPhraseScreen'
import {RecoveryPhraseScreen} from './useCases/CreateWallet/RecoveryPhraseScreen'
import {VerifyRecoveryPhraseScreen} from './useCases/CreateWallet/VerifyRecoveryPhraseScreen'
import {WalletDetailsScreen} from './useCases/CreateWallet/WalletDetailsScreen'
import {RestoreWalletDetailsScreen} from './useCases/RestoreWallet/RestoreWalletDetailsScreen'
import {RestoreWalletScreen} from './useCases/RestoreWallet/RestoreWalletScreen'

const Stack = createStackNavigator<WalletInitRoutes>()
export const SetupWalletNavigator = () => {
  const strings = useStrings()
  const {atoms, color} = useTheme()

  const navigationOptions = React.useMemo(() => defaultStackNavigationOptions(atoms, color), [atoms, color])

  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: {backgroundColor: 'transparent'},
        ...navigationOptions,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
      }}
    >
      <Stack.Screen
        name="setup-wallet-choose-setup-type-init"
        component={ChooseSetupTypeScreen}
        options={{title: strings.addNewWalletTitle, headerLeft: () => null}}
      />

      <Stack.Screen
        name="setup-wallet-choose-setup-type"
        component={ChooseSetupTypeScreen}
        options={{title: strings.addNewWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-create-choose-network"
        component={ChooseNetworkScreen}
        options={{title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-choose-network"
        component={ChooseNetworkScreen}
        options={{title: strings.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-choose-mnemonic-type"
        component={ChooseMnemonicTypeScreen}
        options={{title: strings.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-details-form"
        component={WalletDetailsScreen}
        options={{...navigationOptions, title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-form"
        component={RestoreWalletScreen}
        options={{title: strings.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-details"
        component={RestoreWalletDetailsScreen}
        options={{title: strings.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-import-read-only"
        component={ImportReadOnlyWalletScreen}
        options={{
          title: strings.importReadOnlyTitle,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="setup-wallet-save-read-only"
        component={SaveReadOnlyWalletScreen}
        options={{title: strings.saveReadOnlyWalletTitle}}
      />

      <Stack.Screen //
        name="setup-wallet-check-nano-x"
        component={CheckNanoXScreen}
        options={{title: strings.checkNanoXTitle}}
      />

      <Stack.Screen //
        name="setup-wallet-connect-nano-x"
        options={{title: strings.connectNanoXTitle}}
        component={ConnectNanoXScreenWrapper}
      />

      <Stack.Screen
        name="setup-wallet-save-nano-x"
        component={SaveNanoXScreen}
        options={{
          title: strings.saveNanoXTitle,
        }}
      />

      <Stack.Screen //
        name="setup-wallet-about-recovery-phase"
        component={AboutRecoveryPhraseScreen}
        options={{title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-recovery-phrase-mnemonic"
        component={RecoveryPhraseScreen}
        options={{title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-verify-recovery-phrase-mnemonic"
        component={VerifyRecoveryPhraseScreen}
        options={{title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-preparing-wallet"
        component={PreparingWalletScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

const ConnectNanoXScreenWrapper = () => <ConnectNanoXScreen />

const messages = defineMessages({
  addNewWalletTitle: {
    id: 'components.walletinit.walletinitscreen.title',
    defaultMessage: '!!!Add new wallet',
  },
  createWalletTitle: {
    id: 'components.walletinit.createwallet.createwalletscreen.title',
    defaultMessage: '!!!Create wallet',
  },
  restoreWalletTitle: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.title',
    defaultMessage: '!!!Restore wallet',
  },
  importReadOnlyTitle: {
    id: 'components.walletinit.importreadonlywalletscreen.title',
    defaultMessage: '!!!Read-only Wallet',
  },
  saveReadOnlyWalletTitle: {
    id: 'components.walletinit.savereadonlywalletscreen.title',
    defaultMessage: '!!!Verify read-only wallet',
  },
  mnemonicShowTitle: {
    id: 'components.walletinit.createwallet.mnemonicshowscreen.title',
    defaultMessage: '!!!Recovery phrase',
  },
  mnemonicCheckTitle: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.title',
    defaultMessage: '!!!Recovery phrase',
  },
  verifyRestoredWalletTitle: {
    id: 'components.walletinit.verifyrestoredwallet.title',
    defaultMessage: '!!!Verify restored wallet',
  },
  walletCredentialsTitle: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
  },
  connectNanoXTitle: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.title',
    defaultMessage: '!!!Connect to Ledger Device',
  },
  checkNanoXTitle: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.title',
    defaultMessage: '!!!Connect to Ledger Device',
  },
  saveNanoXTitle: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.title',
    defaultMessage: '!!!Save wallet',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    addNewWalletTitle: intl.formatMessage(messages.addNewWalletTitle),
    createWalletTitle: intl.formatMessage(messages.createWalletTitle),
    restoreWalletTitle: intl.formatMessage(messages.restoreWalletTitle),
    importReadOnlyTitle: intl.formatMessage(messages.importReadOnlyTitle),
    saveReadOnlyWalletTitle: intl.formatMessage(messages.saveReadOnlyWalletTitle),
    mnemonicShowTitle: intl.formatMessage(messages.mnemonicShowTitle),
    mnemonicCheckTitle: intl.formatMessage(messages.mnemonicCheckTitle),
    verifyRestoredWalletTitle: intl.formatMessage(messages.verifyRestoredWalletTitle),
    walletCredentialsTitle: intl.formatMessage(messages.walletCredentialsTitle),
    connectNanoXTitle: intl.formatMessage(messages.connectNanoXTitle),
    checkNanoXTitle: intl.formatMessage(messages.checkNanoXTitle),
    saveNanoXTitle: intl.formatMessage(messages.saveNanoXTitle),
  }
}
