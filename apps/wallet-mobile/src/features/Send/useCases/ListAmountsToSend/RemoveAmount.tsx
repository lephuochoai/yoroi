import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '../../../../components'

export type RemoveAmountButtonProps = {
  onPress(): void
}

export const RemoveAmountButton = ({onPress}: RemoveAmountButtonProps) => {
  const {colors} = useStyles()
  return (
    <TouchableOpacity onPress={onPress} testID="removeAmountButton">
      <Icon.Delete size={26} color={colors.black} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const colors = {
    black: color.black_static,
  }
  return {colors}
}
