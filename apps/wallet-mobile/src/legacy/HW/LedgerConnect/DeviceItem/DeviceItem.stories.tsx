import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {Device} from '../../../../yoroi-wallets/types'
import {DeviceItem} from './DeviceItem'

const device: Device = {
  id: 123,
  name: 'Device Name',
}

const doTheThing = () => new Promise((resolve) => setTimeout(resolve, 1000))

const onSelect = async (device: Device) => {
  action('onSelect start')(device)
  await doTheThing()
  action('onSelect end')(device)
}

storiesOf('Device Item Button', module)
  .add('default', () => <DeviceItem onSelect={onSelect} device={device} />)
  .add('disabled', () => <DeviceItem device={device} onSelect={onSelect} disabled />)
