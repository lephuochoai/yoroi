import {OrderType} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

type ButtonActionGroupProps = {
  onSelect: (orderType: OrderType) => void
  selected: OrderType
  labels: ReadonlyArray<{label: string; value: OrderType}>
  disabled?: boolean
}

export const ButtonActionGroup = ({labels, onSelect, selected, disabled}: ButtonActionGroupProps) => {
  const handleOnPress = (orderType: OrderType) => onSelect(orderType)
  const styles = useStyles()

  return (
    <View style={styles.container}>
      {labels.map((labelItem) => (
        <View key={labelItem.value} style={styles.buttonWrapper}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => handleOnPress(labelItem.value)}
            style={[styles.button, labelItem.value === selected && styles.selected]}
          >
            <Text style={styles.label}>{labelItem.label}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    buttonWrapper: {
      paddingRight: 8,
    },
    button: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: 8,
    },
    selected: {
      backgroundColor: color.gray_c200,
    },
    label: {
      color: color.gray_cmax,
      ...atoms.body_1_lg_medium,
    },
  })
  return styles
}
