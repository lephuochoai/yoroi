import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import QRCode from 'react-native-qrcode-svg'

import {Spacer, Text} from '../../../../components'
import {YoroiLogoIllustration} from '../../illustrations/YoroiLogo'

type ShareProps = {
  content: string
}

export const CaptureShareQRCodeCard = ({content}: ShareProps) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.touchableCard}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={colors.backgroundGradientCard}
      />

      <Spacer height={16} />

      <YoroiLogoIllustration height={37} width={35} />

      <View style={styles.addressContainer}>
        <View style={styles.qrCode}>
          <QRCode value={content} size={158} color={colors.black} />
        </View>

        <Spacer height={16} />

        <Text style={[styles.content, {color: colors.transparent}]}>{content}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const screenWidth = useWindowDimensions().width
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    qrCode: {
      backgroundColor: color.gray_cmin,
      padding: 10,
      borderRadius: 8,
    },
    addressContainer: {
      alignItems: 'center',
    },
    touchableCard: {
      borderRadius: 10,
      width: screenWidth - 34,
      alignItems: 'center',
      maxHeight: 308,
      flex: 1,
      minHeight: 394,
      alignSelf: 'center',
      overflow: 'hidden',
      paddingVertical: 15,
      gap: 32,
      justifyContent: 'center',
    },
    content: {
      textAlign: 'center',
      maxWidth: 300,
      ...atoms.body_1_lg_regular,
    },
  })

  const colors = {
    black: color.gray_cmax,
    transparent: 'transparent',
    backgroundGradientCard: color.bg_gradient_1,
  }

  return {styles, colors} as const
}
