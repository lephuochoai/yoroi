import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

interface ButtonGroupProps {
  labels: string[]
  onSelect: (index: number) => void
  selected: number
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({labels, onSelect, selected}) => {
  const handleOnPress = (index: number) => onSelect(index)

  const styles = useStyles()

  return (
    <View style={styles.container}>
      {labels.map((buttonLabel, index) => (
        <View key={buttonLabel} style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => handleOnPress(index)}
            style={[styles.button, index === selected && styles.selected]}
          >
            <Text style={styles.label}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
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
