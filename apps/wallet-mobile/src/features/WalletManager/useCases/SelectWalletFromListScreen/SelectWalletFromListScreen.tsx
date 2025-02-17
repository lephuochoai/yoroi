import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button'
import {ScrollView, useScrollView} from '../../../../components/ScrollView/ScrollView'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useLinksRequestWallet} from '../../../Links/common/useLinksRequestWallet'
import {useWalletMetas} from '../../common/hooks/useWalletMetas'
import {useStrings} from '../../common/useStrings'
import {useWalletManager} from '../../context/WalletManagerProvider'
import {SupportIllustration} from '../../illustrations/SupportIllustration'
import {AggregatedBalance} from './AggregatedBalance'
import {WalletListItem} from './WalletListItem'

export const SelectWalletFromList = () => {
  useLinksRequestWallet()
  const {styles, colors} = useStyles()
  const {walletManager} = useWalletManager()
  const {navigateToTxHistory} = useWalletNavigation()
  const walletMetas = useWalletMetas()
  const {track} = useMetrics()
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()
  const [showLine, setShowLine] = React.useState(false)

  useFocusEffect(
    React.useCallback(() => {
      track.allWalletsPageViewed()
    }, [track]),
  )

  const handleOnSelect = React.useCallback(
    (walletMeta: Wallet.Meta) => {
      walletManager.setSelectedWalletId(walletMeta.id)
      navigateToTxHistory()
    },
    [walletManager, navigateToTxHistory],
  )

  const data = React.useMemo(
    () =>
      walletMetas?.map((walletMeta) => (
        <React.Fragment key={walletMeta.id}>
          <WalletListItem walletMeta={walletMeta} onPress={handleOnSelect} />

          <Space height="lg" />
        </React.Fragment>
      )),
    [handleOnSelect, walletMetas],
  )

  return (
    <SafeAreaView style={styles.safeAreaView} edges={['left', 'right', 'bottom']}>
      <AggregatedBalance />

      <ScrollView
        ref={scrollViewRef}
        style={styles.list}
        onScrollBarChange={setIsScrollBarShown}
        onScrollBeginDrag={() => setShowLine(true)}
        onScrollEndDrag={() => setShowLine(false)}
        bounces={false}
      >
        {data}

        <Space height="lg" />
      </ScrollView>

      <View
        style={[
          styles.actions,
          (showLine || isScrollBarShown) && {borderTopWidth: 1, borderTopColor: colors.lightGray},
        ]}
      >
        <Space height="lg" />

        <SupportTicketLink />

        <Space height="lg" />

        <AddWalletButton />

        <Space height="md" />

        <OnlyDevButton />
      </View>
    </SafeAreaView>
  )
}

const linkToSupportOpenTicket = 'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'

const SupportTicketLink = () => {
  const onPress = () => Linking.openURL(linkToSupportOpenTicket)
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={styles.link} onPress={onPress}>
      <SupportIllustration />

      <Space width="sm" />

      <Text style={styles.linkText}>{strings.supportTicketLink.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const AddWalletButton = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {reset: resetSetupWalletState} = useSetupWallet()
  const {resetToWalletSetup} = useWalletNavigation()

  return (
    <Button
      onPress={() => {
        resetSetupWalletState()
        resetToWalletSetup()
      }}
      title={strings.addWalletButton}
      style={styles.topButton}
    />
  )
}

const OnlyDevButton = () => {
  const navigation = useNavigation()
  const {styles} = useStyles()

  if (!__DEV__) return null

  return (
    <Button
      testID="btnDevOptions"
      onPress={() => navigation.navigate('developer')}
      title="Dev options"
      style={styles.button}
    />
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    topButton: {
      backgroundColor: color.primary_c500,
    },
    button: {
      backgroundColor: color.primary_c500,
    },
    linkText: {
      color: color.primary_c500,
    },
    link: {
      ...atoms.button_2_md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      ...atoms.p_lg,
    },
    actions: {
      ...atoms.px_lg,
    },
  })

  const colors = {
    gray: color.gray_c600,
    lightGray: color.gray_c200,
  }

  return {styles, colors} as const
}
