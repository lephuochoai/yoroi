import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Dimensions, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../kernel/navigation'
import {BuyBannerIllustration} from '../../illustrations/BuyBannerIllustration'
import {useStrings} from '../useStrings'

const DIMENSIONS = Dimensions.get('window')

export const BuyBannerBig = () => {
  const strings = useStrings()
  const {track} = useMetrics()
  const {styles, colors} = useStyles()

  const bannerWidth = DIMENSIONS.width - 16 * 2
  const bannerHeight = (bannerWidth * 174) / 512

  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const handleExchange = () => {
    track.walletPageBuyBannerClicked()
    navigation.navigate('exchange-create-order')
  }

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.gradient} start={{x: 1, y: 1}} end={{x: 1, y: 1}} colors={colors.gradientColor}>
        <BuyBannerIllustration width={bannerWidth} height={bannerHeight} />

        <Space />

        <Text style={styles.label}>{strings.getFirstCrypto}</Text>

        <Space height="xs" />

        <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

        <Space />

        <Button
          testID="rampOnOffButton"
          mainTheme
          title={strings.buyCrypto.toLocaleUpperCase()}
          onPress={handleExchange}
          style={styles.spaceButton}
          textStyles={styles.spaceButtonText}
        />
      </LinearGradient>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.pb_md,
      backgroundColor: color.gray_cmin,
      flex: 1,
    },
    gradient: {
      ...atoms.pb_xl,
      opacity: 1,
      borderRadius: 8,
      flexDirection: 'column',
      alignItems: 'center',
    },
    spaceButtonText: {
      ...atoms.p_0,
    },
    label: {
      ...atoms.heading_3_medium,
      color: color.gray_cmax,
      textAlign: 'center',
    },
    text: {
      ...atoms.body_1_lg_regular,
      ...atoms.px_2xl,
      color: color.gray_cmax,
      textAlign: 'center',
    },
    spaceButton: {
      ...atoms.px_lg,
    },
  })
  const colors = {
    gradientColor: color.bg_gradient_2,
  }
  return {styles, colors} as const
}
