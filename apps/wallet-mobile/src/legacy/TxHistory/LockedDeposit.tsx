import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Spacer, Text} from '../../components'
import {usePortfolioPrimaryBreakdown} from '../../features/Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages from '../../kernel/i18n/global-messages'

export const LockedDeposit = ({ignorePrivacy = false}: {ignorePrivacy?: boolean}) => {
  const {wallet} = useSelectedWallet()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {lockedAsStorageCost} = usePortfolioPrimaryBreakdown({wallet})

  const amount = React.useMemo(
    () =>
      !isPrivacyActive || !ignorePrivacy
        ? amountFormatter({template: '{{value}} {{ticker}}'})({
            quantity: lockedAsStorageCost,
            info: wallet.portfolioPrimaryTokenInfo,
          })
        : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})({
            quantity: 0n,
            info: wallet.portfolioPrimaryTokenInfo,
          }),
    [ignorePrivacy, isPrivacyActive, lockedAsStorageCost, privacyPlaceholder, wallet.portfolioPrimaryTokenInfo],
  )

  return <FormattedAmount amount={amount} />
}

const FormattedAmount = ({amount}: {amount: string}) => {
  const styles = useStyles()
  return (
    <Row>
      <Label />

      <Spacer width={4} />

      <Text style={styles.label}>{amount}</Text>
    </Row>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles()
  return <View style={styles.root}>{children}</View>
}

const Label = () => {
  const strings = useStrings()
  const styles = useStyles()

  return <Text style={styles.label}>{strings.lockedDeposit}:</Text>
}

const useStrings = () => {
  const intl = useIntl()

  return {
    lockedDeposit: intl.formatMessage(globalMessages.lockedDeposit),
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      color: color.gray_c600,
      ...atoms.body_2_md_regular,
    },
  })

  return styles
}
