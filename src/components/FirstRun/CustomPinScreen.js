// @flow

import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withProps} from 'recompose'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import PinRegistrationForm from '../Common/PinRegistrationForm'
import {encryptAndStoreCustomPin, signin} from '../../actions'
import {isAuthenticatedSelector} from '../../selectors'
import {StatusBar} from '../UiKit'

import styles from './styles/CustomPinScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  pinInputTitle: {
    id: 'components.firstrun.custompinscreen.pinInputTitle',
    defaultMessage: '!!!Enter the PIN',
  },
  pinInputSubtitle: {
    id: 'components.firstrun.custompinscreen.pinInputSubtitle',
    defaultMessage: '!!!Choose new PIN for quick access to wallet.',
  },
  pinConfirmationTitle: {
    id: 'components.firstrun.custompinscreen.pinConfirmationTitle',
    defaultMessage: '!!!Repeat PIN',
  },
})

const CustomPinScreen = ({handlePinEntered, intl, navigation}: {intl: IntlShape} & Object /* TODO: type */) => (
  <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container} testID="customPinContainer">
    <StatusBar type="dark" />

    <PinRegistrationForm
      onPinEntered={handlePinEntered}
      labels={{
        PinInput: {
          title: intl.formatMessage(messages.pinInputTitle),
          subtitle: intl.formatMessage(messages.pinInputSubtitle),
        },
        PinConfirmationInput: {
          title: intl.formatMessage(messages.pinConfirmationTitle),
        },
      }}
      navigation={navigation}
    />
  </SafeAreaView>
)

type ExternalProps = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        isAuth: isAuthenticatedSelector(state),
      }),
      {
        encryptAndStoreCustomPin,
        signin,
      },
    ),
    withProps(({route}) => ({
      onSuccess: route.params?.onSuccess,
    })),
    withHandlers({
      handlePinEntered:
        ({onSuccess, encryptAndStoreCustomPin, isAuth, signin}) =>
        async (pin) => {
          await encryptAndStoreCustomPin(pin)
          if (!isAuth) signin() // because in first run user is not authenticated
          if (onSuccess !== undefined) onSuccess()
        },
    }),
  )(CustomPinScreen): ComponentType<ExternalProps>),
)
