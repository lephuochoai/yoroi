import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Icon, Spacer, useModal} from '../../../../../components'
import {LabelCategoryDApp} from '../../../common/LabelCategoryDApp'
import {LabelConnected} from '../../../common/LabelConnected'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {IDAppItem} from '../DAppMock'

type Props = {
  dApp: IDAppItem
  connected: boolean
}
export const DAppItem = ({dApp, connected}: Props) => {
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {openModal, closeModal} = useModal()
  const insets = useSafeAreaInsets()
  const dialogHeight = 294 + insets.bottom

  const [isPressed, setIsPressed] = React.useState(false)

  const handlePressing = (isPressIn: boolean) => {
    setIsPressed(isPressIn)
  }

  const handleOpenDApp = () => {
    closeModal()
    navigateTo.browserView()
  }
  const handleDisconnectDApp = () => {
    closeModal()
  }

  const handlePress = () => {
    openModal(
      'DApp actions',
      <View>
        <View style={styles.dAppInfo}>
          <Image
            source={dApp.logo}
            style={{
              width: 48,
              height: 48,
            }}
          />

          <Text style={styles.dAppName}>{dApp.name}</Text>
        </View>

        <Spacer height={16} />

        <View>
          <DAppAction onPress={handleOpenDApp} icon={<Icon.DApp />} title="Open DApp" />

          <DAppAction onPress={handleDisconnectDApp} icon={<Icon.DApp />} title="Disconnect wallet from DApp" />
        </View>
      </View>,
      dialogHeight,
    )
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={() => handlePressing(true)}
      onPressOut={() => handlePressing(false)}
      onPress={handlePress}
    >
      <View style={styles.dAppItemContainer}>
        <View>
          <Image source={{uri: Image.resolveAssetSource(dApp.logo).uri}} style={styles.dAppLogo} />
        </View>

        <View style={styles.flexFull}>
          <Text style={styles.nameText}>{dApp.name}</Text>

          {dApp?.description !== undefined && (
            <Text style={[styles.descriptionText, isPressed && styles.descriptionTextActive]}>{dApp.description}</Text>
          )}

          <Spacer height={8} />

          <View style={styles.labelBox}>
            {connected && <LabelConnected />}

            {dApp.category !== undefined && <LabelCategoryDApp category={dApp.category} />}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

type DAppActionProps = {
  icon: React.ReactNode
  title: string
  onPress: () => void
}
const DAppAction = ({icon: IconAction, title, onPress}: DAppActionProps) => {
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={styles.touchDAppAction} onPress={onPress}>
      {IconAction}

      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme

  const styles = StyleSheet.create({
    dAppItemContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    nameText: {
      color: color.gray[900],
      fontWeight: '500',
      ...typography['body-1-l-medium'],
    },
    descriptionText: {
      color: color.gray[600],
      ...typography['body-3-s-regular'],
    },
    descriptionTextActive: {
      color: color.gray['max'],
    },
    flexFull: {
      flex: 1,
    },
    labelBox: {
      flexDirection: 'row',
      gap: 8,
    },
    dAppLogo: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
    dAppName: {
      ...typography['body-1-l-medium'],
      color: color.gray['900'],
    },
    dAppInfo: {
      alignItems: 'center',
      gap: 8,
    },
    touchDAppAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      ...padding['y-m'],
    },
    actionTitle: {
      ...typography['body-1-l-medium'],
      color: color.gray['900'],
    },
  })

  return {styles} as const
}
