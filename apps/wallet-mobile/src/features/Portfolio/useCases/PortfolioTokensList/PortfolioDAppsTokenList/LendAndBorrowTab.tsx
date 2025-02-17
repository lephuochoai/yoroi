import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {TokenEmptyList} from '../../../common/TokenEmptyList'
import {useStrings} from '../../../common/useStrings'

export const LendAndBorrowTab = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <Spacer height={16} />

      <TokenEmptyList emptyText={strings.availableSoon} />
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
  })

  return {styles} as const
}
