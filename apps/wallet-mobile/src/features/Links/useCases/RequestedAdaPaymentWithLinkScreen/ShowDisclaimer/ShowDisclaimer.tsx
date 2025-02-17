import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

type ShowDisclaimerProps = {
  title: string
  children: React.ReactNode
}
export const ShowDisclaimer = ({title, children}: ShowDisclaimerProps) => {
  const {color} = useTheme()
  const styles = useStyles()

  return (
    <LinearGradient style={styles.gradient} start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={color.bg_gradient_1}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        {children}
      </View>
    </LinearGradient>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    gradient: {
      opacity: 1,
      borderRadius: 8,
    },
    title: {
      ...atoms.body_1_lg_regular,
      color: color.gray_cmax,
      fontWeight: '500',
    },
  })
  return styles
}
