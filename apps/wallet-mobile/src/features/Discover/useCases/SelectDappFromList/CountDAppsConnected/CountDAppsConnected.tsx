import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '../../../common/useStrings'

type Props = {
  total: number
}
export const CountDAppsConnected = ({total}: Props) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.countAvailableBox}>
      <Text style={styles.availableText}>{`${strings.totalDAppConnected(total)}`}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    availableText: {
      ...atoms.body_2_md_regular,
      color: color.gray_c700,
    },
    countAvailableBox: {
      ...atoms.px_lg,
    },
  })
  return {styles} as const
}
