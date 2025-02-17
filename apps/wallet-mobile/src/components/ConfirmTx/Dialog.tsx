import {HW} from '@yoroi/types'
import React from 'react'
import {useIntl} from 'react-intl'

import {ErrorView, PleaseWaitView} from '../../components'
import globalMessages, {ledgerMessages, txLabels} from '../../kernel/i18n/global-messages'
import {LedgerConnect, LedgerTransportSwitchView} from '../../legacy/HW'
import {Modal} from '../legacy/Modal/Modal'

type ErrorData = {
  errorMessage: string
  errorLogs?: string
}

export enum Step {
  Closed,
  ChooseTransport,
  LedgerConnect,
  Error,
  Submitting,
  Signing,
  WaitingHwResponse,
}

type BaseDialogProps = {
  onRequestClose: () => void
  errorData: ErrorData
}

type DialogWithLedgerProps = BaseDialogProps & {
  process: 'withLedger'
  step: Step
  onChooseTransport: (bool: boolean) => void
  onConnectBLE: (id: string) => void
  onConnectUSB: (obj: HW.DeviceObj) => void
  useUSB?: boolean
}

type DialogSimpleProps = BaseDialogProps & {
  process: 'withoutLedger'
  step: Step.Closed | Step.Submitting | Step.Error
}

export const Dialog = (props: DialogSimpleProps | DialogWithLedgerProps) => {
  if (props.process === 'withLedger') {
    return <DialogWithLedger {...props} />
  } else {
    return <DialogSimple {...props} />
  }
}

const DialogWithLedger = ({
  step,
  onRequestClose,
  onChooseTransport,
  onConnectBLE,
  onConnectUSB,
  useUSB,
  errorData,
}: DialogWithLedgerProps) => {
  const strings = useStrings()

  const getBody = () => {
    switch (step) {
      case Step.Closed:
        return null
      case Step.ChooseTransport:
        return (
          <LedgerTransportSwitchView
            onSelectUSB={() => onChooseTransport(true)}
            onSelectBLE={() => onChooseTransport(false)}
          />
        )
      case Step.LedgerConnect:
        return <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
      case Step.WaitingHwResponse:
        return <PleaseWaitView title={strings.continueOnLedger} spinnerText={strings.followSteps} />
      case Step.Signing:
        return <PleaseWaitView title={strings.signingTx} spinnerText={strings.pleaseWait} />
      case Step.Submitting:
        return <PleaseWaitView title={strings.submittingTx} spinnerText={strings.pleaseWait} />
      case Step.Error:
        return (
          <ErrorView errorMessage={errorData.errorMessage} errorLogs={errorData.errorLogs} onDismiss={onRequestClose} />
        )
      default:
        return null
    }
  }

  return (
    <Modal
      visible={step !== Step.Closed}
      onRequestClose={onRequestClose}
      showCloseIcon={step !== Step.Submitting && step !== Step.Signing}
    >
      {getBody()}
    </Modal>
  )
}

export const DialogSimple = ({step, onRequestClose, errorData}: DialogSimpleProps) => {
  const strings = useStrings()

  const getBody = () => {
    switch (step) {
      case Step.Closed:
        return null
      case Step.Submitting:
        return <PleaseWaitView title={strings.submittingTx} spinnerText={strings.pleaseWait} />
      case Step.Error:
        return (
          <ErrorView errorMessage={errorData.errorMessage} errorLogs={errorData.errorLogs} onDismiss={onRequestClose} />
        )
      default:
        return null
    }
  }

  return (
    <Modal visible={step !== Step.Closed} onRequestClose={onRequestClose} showCloseIcon={step !== Step.Submitting}>
      {getBody()}
    </Modal>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    followSteps: intl.formatMessage(ledgerMessages.followSteps),
    continueOnLedger: intl.formatMessage(ledgerMessages.continueOnLedger),
    submittingTx: intl.formatMessage(txLabels.submittingTx),
    signingTx: intl.formatMessage(txLabels.signingTx),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
  }
}
