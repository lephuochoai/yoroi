import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQueryClient} from 'react-query'

import {
  Button,
  Checkbox,
  Checkmark,
  KeyboardAvoidingView,
  Spacer,
  Text,
  TextInput,
  TextInputProps,
} from '../../../components'
import {useWalletNavigation} from '../../../navigation'
import {useWalletManager} from '../../../wallet-manager/WalletManagerContext'
import {hasWalletsKey, useRemoveWallet, useWalletName} from '../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../WalletManager/Context/SelectedWalletContext'

export const RemoveWalletScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)
  const {resetToWalletSetupInit, resetToWalletSelection} = useWalletNavigation()
  const walletManager = useWalletManager()
  const queryClient = useQueryClient()

  const {removeWallet, isLoading: isRemoveWalletLoading} = useRemoveWallet(wallet.id, {
    onSuccess: async () => {
      queryClient.invalidateQueries({queryKey: [hasWalletsKey]})

      const walletMetas = await walletManager.listWallets()
      const hasWallets = walletMetas.length > 0

      if (hasWallets) {
        resetToWalletSelection()
        return
      }

      resetToWalletSetupInit()
    },
  })

  const [hasMnemonicWrittenDown, setHasMnemonicWrittenDown] = React.useState(false)
  const [typedWalletName, setTypedWalletName] = React.useState('')

  const disabled = isRemoveWalletLoading || (!wallet.isHW && !hasMnemonicWrittenDown) || walletName !== typedWalletName

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoider}>
        <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
          <Description>
            {!wallet.isHW && <Text style={styles.description}>{strings.descriptionParagraph1}</Text>}

            <Spacer height={24} />

            <Text style={styles.description}>{strings.descriptionParagraph2}</Text>
          </Description>

          <Spacer height={32} />

          <WalletInfo>
            <Text style={styles.walletNameLabel}>{strings.walletName}</Text>

            <Spacer height={10} />

            <Text style={styles.walletName}>{walletName}</Text>

            <Spacer height={24} />

            <WalletNameInput
              value={typedWalletName}
              onChangeText={setTypedWalletName}
              right={typedWalletName === walletName ? <Checkmark /> : undefined}
              errorText={typedWalletName !== walletName ? strings.walletNameMismatchError : undefined}
            />
          </WalletInfo>
        </ScrollView>

        <Spacer fill />

        <Actions>
          {!wallet.isHW && (
            <Checkbox
              checked={hasMnemonicWrittenDown}
              text={strings.hasWrittenDownMnemonic}
              onChange={setHasMnemonicWrittenDown}
            />
          )}

          <Spacer height={30} />

          <Button
            onPress={() => removeWallet()}
            title={strings.remove}
            style={styles.removeButton}
            disabled={disabled}
          />
        </Actions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const Description = (props: ViewProps) => {
  return <View {...props} />
}
const WalletInfo = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.descriptionContainer} />
}
const WalletNameInput = (props: TextInputProps) => {
  return <TextInput {...props} autoFocus enablesReturnKeyAutomatically returnKeyType="done" />
}
const Actions = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.actions} />
}

const messages = defineMessages({
  descriptionParagraph1: {
    id: 'components.settings.removewalletscreen.descriptionParagraph1',
    defaultMessage: '!!!If you wish to permanently delete the wallet make sure you have written down the mnemonic.',
  },
  descriptionParagraph2: {
    id: 'components.settings.removewalletscreen.descriptionParagraph2',
    defaultMessage: '!!!To confirm this operation type the wallet name below.',
  },
  walletName: {
    id: 'components.settings.removewalletscreen.walletName',
    defaultMessage: '!!!Wallet name',
  },
  walletNameInput: {
    id: 'components.settings.removewalletscreen.walletNameInput',
    defaultMessage: '!!!Wallet name',
  },
  walletNameMismatchError: {
    id: 'components.settings.removewalletscreen.walletNameMismatchError',
    defaultMessage: '!!!Wallet name does not match',
  },
  remove: {
    id: 'components.settings.removewalletscreen.remove',
    defaultMessage: '!!!Remove wallet',
  },
  hasWrittenDownMnemonic: {
    id: 'components.settings.removewalletscreen.hasWrittenDownMnemonic',
    defaultMessage:
      '!!!I have written down mnemonic of this wallet and understand that I cannot recover the wallet without it.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    descriptionParagraph1: intl.formatMessage(messages.descriptionParagraph1),
    descriptionParagraph2: intl.formatMessage(messages.descriptionParagraph2),
    walletName: intl.formatMessage(messages.walletName),
    walletNameInput: intl.formatMessage(messages.walletNameInput),
    walletNameMismatchError: intl.formatMessage(messages.walletNameMismatchError),
    remove: intl.formatMessage(messages.remove),
    hasWrittenDownMnemonic: intl.formatMessage(messages.hasWrittenDownMnemonic),
  }
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    contentContainer: {
      ...padding['x-l'],
    },
    descriptionContainer: {
      backgroundColor: color.gray.min,
    },
    description: {
      ...typography['body-1-l-regular'],
    },

    walletNameLabel: {
      ...typography['body-1-l-medium'],
    },
    walletName: {
      ...typography['body-1-l-regular'],
    },
    actions: {
      ...padding['l'],
    },
    keyboardAvoider: {
      flex: 1,
    },
    removeButton: {
      backgroundColor: color.magenta[500],
    },
  })
  return styles
}
