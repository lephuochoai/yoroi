/* eslint-disable react/jsx-newline */
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TouchableHighlight, View, ViewProps} from 'react-native'

import {Backspace} from './Icon/Backspace'
import {Text} from './Text'

export const BACKSPACE = 'BACKSPACE'

export const NumericKeyboard = ({onKeyDown}: {onKeyDown: (key: string) => void}) => {
  const {styles} = useStyles()
  return (
    <View style={styles.keyboard}>
      <Row>
        <Key value="1" onPress={onKeyDown} />
        <Key value="2" onPress={onKeyDown} />
        <Key value="3" onPress={onKeyDown} />
      </Row>

      <Row>
        <Key value="4" onPress={onKeyDown} />
        <Key value="5" onPress={onKeyDown} />
        <Key value="6" onPress={onKeyDown} />
      </Row>

      <Row>
        <Key value="7" onPress={onKeyDown} />
        <Key value="8" onPress={onKeyDown} />
        <Key value="9" onPress={onKeyDown} />
      </Row>

      <Row>
        <EmptyKey />
        <Key value="0" onPress={onKeyDown} />
        <BackspaceKey onPress={onKeyDown} />
      </Row>
    </View>
  )
}

type KeyboardKeyProps = {
  value: string
  onPress: (value: string) => void
}
const Key = ({value, onPress}: KeyboardKeyProps) => {
  const {styles} = useStyles()
  const isEmpty = value === ''
  const isDigit = !isEmpty

  return (
    <TouchableHighlight
      style={[styles.keyboardKey, !isDigit && styles.keyboardKeyDisabled]}
      onPress={() => onPress(value)}
      underlayColor="#bbbbbb"
      disabled={isEmpty}
      testID={`pinKey${value}`}
    >
      <Text style={styles.keyboardKeyText}>{value}</Text>
    </TouchableHighlight>
  )
}

const EmptyKey = () => {
  const {styles} = useStyles()
  return <View style={[styles.keyboardKey, styles.keyboardKeyDisabled]} testID="pinKeyEmpty" />
}

const BackspaceKey = ({onPress}: {onPress: (value: string) => void}) => {
  const {styles, color} = useStyles()
  return (
    <TouchableHighlight
      style={[styles.keyboardKey, styles.keyboardKeyDisabled]}
      onPress={() => onPress('BACKSPACE')}
      underlayColor="#bbbbbb"
      testID="pinKeyBACKSPACE"
    >
      <Backspace color={color.gray_cmax} />
    </TouchableHighlight>
  )
}

const Row = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.keyboardRow} />
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    keyboard: {
      height: 250,
      backgroundColor: color.gray_cmin,
    },
    keyboardRow: {
      flex: 1,
      flexDirection: 'row',
    },
    keyboardKey: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopWidth: 2 * StyleSheet.hairlineWidth,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: color.gray_c400,
    },
    keyboardKeyDisabled: {
      backgroundColor: color.gray_c100,
    },
    keyboardKeyText: {
      fontSize: 30,
      lineHeight: 35,
      textAlign: 'center',
    },
  })

  return {styles, color}
}
