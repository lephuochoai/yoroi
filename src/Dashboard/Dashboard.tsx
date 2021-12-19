/* eslint-disable @typescript-eslint/no-explicit-any */

import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {IntlShape, useIntl} from 'react-intl'
import {ActivityIndicator, Platform, RefreshControl, ScrollView, View} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog} from '../../legacy/actions'
import type {RawUtxo, RemotePoolMetaSuccess} from '../../legacy/api/types'
import AccountAutoRefresher from '../../legacy/components/Delegation/AccountAutoRefresher'
import {
  DelegatedStakepoolInfo,
  EpochProgress,
  NotDelegatedInfo,
  UserSummary,
} from '../../legacy/components/Delegation/dashboard'
import DelegationNavigationButtons from '../../legacy/components/Delegation/DelegationNavigationButtons'
import FlawedWalletScreen from '../../legacy/components/Delegation/FlawedWalletScreen'
import styles from '../../legacy/components/Delegation/styles/DelegationSummary.style'
import type {WithdrawalDialogSteps} from '../../legacy/components/Delegation/types'
import {WITHDRAWAL_DIALOG_STEPS} from '../../legacy/components/Delegation/types'
import WithdrawalDialog from '../../legacy/components/Delegation/WithdrawalDialog'
import UtxoAutoRefresher from '../../legacy/components/Send/UtxoAutoRefresher'
import {Banner, OfflineBanner, StatusBar} from '../../legacy/components/UiKit'
import {CONFIG, getCardanoBaseConfig} from '../../legacy/config/config'
import {getCardanoNetworkConfigById} from '../../legacy/config/networks'
import {WrongPassword} from '../../legacy/crypto/errors'
import {ISignRequest} from '../../legacy/crypto/ISignRequest'
import KeyStore from '../../legacy/crypto/KeyStore'
import {MultiToken} from '../../legacy/crypto/MultiToken'
import {HaskellShelleyTxSignRequest} from '../../legacy/crypto/shelley/HaskellShelleyTxSignRequest'
import type {DeviceId, DeviceObj, HWDeviceInfo} from '../../legacy/crypto/shelley/ledgerUtils'
import walletManager, {SystemAuthDisabled} from '../../legacy/crypto/walletManager'
import globalMessages, {errorMessages} from '../../legacy/i18n/global-messages'
import LocalizableError from '../../legacy/i18n/LocalizableError'
import {
  CATALYST_ROUTES,
  DELEGATION_ROUTES,
  SEND_ROUTES,
  WALLET_ROOT_ROUTES,
  WALLET_ROUTES,
} from '../../legacy/RoutesList'
import {
  accountBalanceSelector,
  defaultNetworkAssetSelector,
  easyConfirmationSelector,
  hwDeviceInfoSelector,
  isDelegatingSelector,
  isFetchingAccountStateSelector,
  isFetchingPoolInfoSelector,
  isFetchingUtxosSelector,
  isFlawedWalletSelector,
  isHWSelector,
  isOnlineSelector,
  isReadOnlySelector,
  lastAccountStateFetchErrorSelector,
  poolInfoSelector,
  poolOperatorSelector,
  serverStatusSelector,
  totalDelegatedSelector,
  utxoBalanceSelector,
  utxosSelector,
  walletMetaSelector,
} from '../../legacy/selectors'
import type {ServerStatusCache, WalletMeta} from '../../legacy/state'
import type {DefaultAsset} from '../../legacy/types/HistoryTransaction'
import type {Navigation} from '../../legacy/types/navigation'
import {
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeToSlot,
  genToRelativeSlotNumber,
} from '../../legacy/utils/timeUtils'
import {VotingBanner} from '../Catalyst/VotingBanner'

type Props = {
  intl: IntlShape
  navigation: Navigation
  isOnline: boolean
  utxoBalance: BigNumber | null
  utxos: Array<RawUtxo> | null
  accountBalance: BigNumber | null
  isDelegating: boolean
  isFetchingAccountState: boolean
  fetchUTXOs: () => any
  isFetchingUtxos: boolean
  poolOperator: string
  fetchPoolInfo: () => any
  isFetchingPoolInfo: boolean
  fetchAccountState: () => void
  poolInfo: RemotePoolMetaSuccess | null
  totalDelegated: BigNumber | null
  lastAccountStateSyncError: any
  checkForFlawedWallets: () => any
  setLedgerDeviceId: (deviceID: DeviceId) => Promise<void>
  setLedgerDeviceObj: (deviceObj: DeviceObj) => Promise<void>
  isFlawedWallet: boolean
  isHW: boolean
  isReadOnly: boolean
  isEasyConfirmationEnabled: boolean
  hwDeviceInfo: HWDeviceInfo
  submitTransaction: (request: ISignRequest, text: string) => Promise<void>
  submitSignedTx: (text: string) => Promise<void>
  defaultAsset: DefaultAsset
  serverStatus: ServerStatusCache
  walletMeta: Omit<WalletMeta, 'id'>
}

type DashboardState = {
  currentTime: Date
  withdrawalDialogStep: WithdrawalDialogSteps
  useUSB: boolean
  signTxRequest: HaskellShelleyTxSignRequest | null
  withdrawals: Array<{
    address: string
    amount: MultiToken
  }> | null
  deregistrations: Array<{
    rewardAddress: string
    refund: MultiToken
  }> | null
  balance: BigNumber
  finalBalance: BigNumber
  fees: BigNumber
  error: {
    errorMessage: string | null
    errorLogs?: string | null
  }
}

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
export class DashboardLegacy extends React.Component<Props, DashboardState> {
  state = {
    currentTime: new Date(),
    withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
    useUSB: false,
    signTxRequest: null,
    withdrawals: null,
    deregistrations: null,
    balance: new BigNumber(0),
    finalBalance: new BigNumber(0),
    fees: new BigNumber(0),
    error: {
      errorMessage: null,
      errorLogs: null,
    },
  }

  _firstFocus = true

  _shouldDeregister = false

  _intervalId: void | any = undefined

  _unsubscribe: void | (() => void) = undefined

  componentDidMount() {
    this._intervalId = setInterval(
      () =>
        this.setState({
          currentTime: new Date(),
        }),
      1000,
    )
    this.props.checkForFlawedWallets()
    this._unsubscribe = this.props.navigation.addListener('focus', () => this.handleDidFocus())
  }

  async componentDidUpdate(prevProps) {
    // data from the server is obtained in this order:
    //   - fetchAccountState: account state provides pool list, this is done
    //     inside AccountAutoRefresher component
    //   - fetchPoolInfo: only after getting account state (and pool id), we
    //     fetch detailed pool info

    // update pool info only when pool list gets updated
    if (prevProps.poolOperator !== this.props.poolOperator && this.props.poolOperator != null) {
      await this.props.fetchPoolInfo()
    }
  }

  componentWillUnmount() {
    if (this._intervalId != null) clearInterval(this._intervalId)
    if (this._unsubscribe != null) this._unsubscribe()
  }

  navigateToStakingCenter: () => void = () => {
    const {navigation} = this.props
    navigation.navigate(DELEGATION_ROUTES.STAKING_CENTER)
  }

  handleDidFocus: () => void = () => {
    if (this._firstFocus) {
      this._firstFocus = false
      // skip first focus to avoid
      // didMount -> fetchPoolInfo -> done -> didFocus -> fetchPoolInfo
      // blinking
      return
    }
    this.props.checkForFlawedWallets()
  }

  /* withdrawal logic */

  openWithdrawalDialog: () => void = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WARNING,
    })

  onKeepOrDeregisterKey: (Object, boolean) => Promise<void> = async (event, shouldDeregister) => {
    this._shouldDeregister = shouldDeregister
    if (this.props.isHW && Platform.OS === 'android' && CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT) {
      // toggle ledger transport switch modal
      this.setState({
        withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CHOOSE_TRANSPORT,
      })
    } else {
      await this.createWithdrawalTx()
    }
  }

  /* create withdrawal tx and move to confirm */
  createWithdrawalTx: () => Promise<void> = async () => {
    const {intl, utxos, defaultAsset, serverStatus} = this.props
    try {
      if (utxos == null) throw new Error('cannot get utxos') // should never happen
      this.setState({withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING})
      const signTxRequest = await walletManager.createWithdrawalTx(
        utxos,
        this._shouldDeregister,
        serverStatus.serverTime,
      )
      if (signTxRequest instanceof HaskellShelleyTxSignRequest) {
        const withdrawals = await signTxRequest.withdrawals()
        const deregistrations = await signTxRequest.keyDeregistrations()
        const balance = withdrawals.reduce(
          (sum, curr) => (curr.amount == null ? sum : sum.joinAddCopy(curr.amount)),
          new MultiToken([], {
            defaultNetworkId: defaultAsset.networkId,
            defaultIdentifier: defaultAsset.identifier,
          }),
        )
        const fees = await signTxRequest.fee()
        const finalBalance = balance
          .joinAddMutable(
            deregistrations.reduce(
              (sum, curr) => (curr.refund == null ? sum : sum.joinAddCopy(curr.refund)),
              new MultiToken([], {
                defaultNetworkId: defaultAsset.networkId,
                defaultIdentifier: defaultAsset.identifier,
              }),
            ),
          )
          .joinSubtractMutable(fees)
        this.setState({
          signTxRequest,
          withdrawals,
          deregistrations,
          balance: balance.getDefault(),
          finalBalance: finalBalance.getDefault(),
          fees: fees.getDefault(),
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CONFIRM,
        })
      } else {
        throw new Error('unexpected withdrawal tx type')
      }
    } catch (e) {
      if (e instanceof LocalizableError) {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
          error: {
            errorMessage: intl.formatMessage({
              id: (e as any).id,
              defaultMessage: (e as any).defaultMessage,
            }),
          },
        })
      } else {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
          error: {
            errorMessage: intl.formatMessage(errorMessages.generalError.message, {message: (e as any).message}),
          },
        })
      }
    }
  }

  openLedgerConnect: () => void = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.LEDGER_CONNECT,
    })

  onChooseTransport: (Object, boolean) => Promise<void> = async (event, useUSB) => {
    const {hwDeviceInfo} = this.props
    this.setState({useUSB})
    if (
      (useUSB && hwDeviceInfo.hwFeatures.deviceObj == null) ||
      (!useUSB && hwDeviceInfo.hwFeatures.deviceId == null)
    ) {
      this.openLedgerConnect()
    } else {
      await this.createWithdrawalTx()
    }
  }

  onConnectUSB: (DeviceObj) => Promise<void> = async (deviceObj) => {
    await this.props.setLedgerDeviceObj(deviceObj)
    await this.createWithdrawalTx()
  }

  onConnectBLE: (DeviceId) => Promise<void> = async (deviceId) => {
    await this.props.setLedgerDeviceId(deviceId)
    await this.createWithdrawalTx()
  }

  // TODO: this code has been copy-pasted from the tx confirmation page.
  // Ideally, all this logic should be moved away and perhaps written as a
  // redux action that can be reused in all components with tx signing and sending
  onConfirm: (x: Record<string, unknown>, y: string | void) => Promise<void> = async (_event, password) => {
    const {signTxRequest, useUSB} = this.state
    const {intl, navigation, isHW, isEasyConfirmationEnabled, submitTransaction, submitSignedTx} = this.props
    if (signTxRequest == null) throw new Error('no tx data')

    const submitTx = async (tx: string | ISignRequest, decryptedKey?: string) => {
      if (decryptedKey == null && typeof tx === 'string') {
        await submitSignedTx(tx)
      } else if (decryptedKey != null && !(typeof tx === 'string' || tx instanceof String)) {
        await submitTransaction(tx, decryptedKey)
      }
      navigation.navigate(WALLET_ROUTES.TX_HISTORY)
    }

    try {
      if (isHW) {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING_HW_RESPONSE,
        })
        if (signTxRequest == null) throw new Error('no tx data')
        const signedTx = await walletManager.signTxWithLedger(signTxRequest, useUSB)
        this.setState({withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING})
        await submitTx(Buffer.from(signedTx.encodedTx).toString('base64'))
        this.closeWithdrawalDialog()
        return
      }

      if (isEasyConfirmationEnabled) {
        try {
          await walletManager.ensureKeysValidity()
          navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
            keyId: walletManager._id,
            onSuccess: async (decryptedKey) => {
              navigation.navigate(DELEGATION_ROUTES.STAKING_DASHBOARD)

              await submitTx(signTxRequest, decryptedKey)
            },
            onFail: () => navigation.goBack(),
          })
        } catch (e) {
          if (e instanceof SystemAuthDisabled) {
            this.closeWithdrawalDialog()
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)

            return
          } else {
            throw e
          }
        }
        return
      }

      try {
        this.setState({withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.WAITING})
        const decryptedData = await KeyStore.getData(walletManager._id, 'MASTER_PASSWORD', '', password, intl)

        await submitTx(signTxRequest, decryptedData)
        this.closeWithdrawalDialog()
      } catch (e) {
        if (e instanceof WrongPassword) {
          this.setState({
            withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
            error: {
              errorMessage: intl.formatMessage(errorMessages.incorrectPassword.message),
              errorLogs: null,
            },
          })
        } else {
          throw e
        }
      }
    } catch (e) {
      if (e instanceof LocalizableError) {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
          error: {
            errorMessage: intl.formatMessage(
              {id: (e as any).id, defaultMessage: (e as any).defaultMessage},
              (e as any).values,
            ),
            errorLogs: (e as any).values.response || null,
          },
        })
      } else {
        this.setState({
          withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.ERROR,
          error: {
            errorMessage: intl.formatMessage(errorMessages.generalTxError.message),
            errorLogs: (e as any).message || null,
          },
        })
      }
    }
  }

  closeWithdrawalDialog: () => void = () =>
    this.setState({
      withdrawalDialogStep: WITHDRAWAL_DIALOG_STEPS.CLOSED,
    })

  render() {
    const {
      isOnline,
      utxoBalance,
      isDelegating,
      accountBalance,
      poolOperator,
      poolInfo,
      totalDelegated,
      fetchAccountState,
      isFetchingAccountState,
      lastAccountStateSyncError,
      fetchUTXOs,
      isFetchingUtxos,
      isFlawedWallet,
      navigation,
      walletMeta,
    } = this.props

    const config = getCardanoBaseConfig(getCardanoNetworkConfigById(walletMeta.networkId, walletMeta.provider))

    const toRelativeSlotNumberFn = genToRelativeSlotNumber(config)
    const timeToSlotFn = genTimeToSlot(config)

    const currentAbsoluteSlot = timeToSlotFn({
      time: this.state.currentTime,
    })

    const currentRelativeTime = toRelativeSlotNumberFn(
      timeToSlotFn({
        time: new Date(),
      }).slot,
    )
    const epochLength = genCurrentEpochLength(config)()
    const slotLength = genCurrentSlotLength(config)()

    const secondsLeftInEpoch = (epochLength - currentRelativeTime.slot) * slotLength
    const timeLeftInEpoch = new Date(1000 * secondsLeftInEpoch - currentAbsoluteSlot.msIntoSlot)

    const leftPadDate: (number) => string = (num) => {
      if (num < 10) return `0${num}`
      return num.toString()
    }

    if (isFlawedWallet === true) {
      return (
        <FlawedWalletScreen
          disableButtons={false}
          onPress={() => navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)}
        />
      )
    }

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar type="dark" />

        <UtxoAutoRefresher />
        <AccountAutoRefresher />

        <View style={[styles.container]}>
          <OfflineBanner />
          {isOnline && lastAccountStateSyncError && (
            <SyncErrorBanner showRefresh={!(isFetchingAccountState || isFetchingUtxos)} />
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                onRefresh={() => {
                  fetchUTXOs()
                  fetchAccountState()
                }}
                refreshing={false}
              />
            }
          >
            {!isDelegating && <NotDelegatedInfo />}

            <View style={styles.row}>
              <EpochProgress
                percentage={Math.floor((100 * currentRelativeTime.slot) / epochLength)}
                currentEpoch={currentRelativeTime.epoch}
                endTime={{
                  d: leftPadDate(Math.floor(secondsLeftInEpoch / (3600 * 24))),
                  h: leftPadDate(timeLeftInEpoch.getUTCHours()),
                  m: leftPadDate(timeLeftInEpoch.getUTCMinutes()),
                  s: leftPadDate(timeLeftInEpoch.getUTCSeconds()),
                }}
              />
            </View>
            {
              // TODO(v-almonacid): prefer computing balance from tx cache
              // instead of utxo set
            }

            <View style={styles.row}>
              <UserSummary
                totalAdaSum={utxoBalance}
                totalRewards={accountBalance}
                totalDelegated={totalDelegated}
                onWithdraw={this.openWithdrawalDialog}
                disableWithdraw={this.props.isReadOnly}
              />
            </View>

            <VotingBanner
              onPress={() => {
                navigation.navigate(CATALYST_ROUTES.ROOT)
              }}
            />

            {poolInfo != null && !!poolOperator ? (
              <View style={styles.row}>
                <DelegatedStakepoolInfo
                  poolTicker={poolInfo.info?.ticker}
                  poolName={poolInfo.info?.name}
                  poolHash={poolOperator != null ? poolOperator : ''}
                  poolURL={poolInfo.info?.homepage}
                />
              </View>
            ) : isDelegating ? (
              <View style={styles.activityIndicator}>
                <ActivityIndicator size={'large'} color={'black'} />
              </View>
            ) : null}
          </ScrollView>

          <DelegationNavigationButtons onPress={this.navigateToStakingCenter} disabled={this.props.isReadOnly} />
        </View>

        <WithdrawalDialog
          step={this.state.withdrawalDialogStep}
          onKeepKey={(event) => this.onKeepOrDeregisterKey(event, false)}
          onDeregisterKey={(event) => this.onKeepOrDeregisterKey(event, true)}
          onChooseTransport={this.onChooseTransport}
          useUSB={this.state.useUSB}
          onConnectBLE={this.onConnectBLE}
          onConnectUSB={this.onConnectUSB}
          withdrawals={this.state.withdrawals}
          deregistrations={this.state.deregistrations}
          balance={this.state.balance}
          finalBalance={this.state.finalBalance}
          fees={this.state.fees}
          onConfirm={this.onConfirm}
          onRequestClose={this.closeWithdrawalDialog}
          error={this.state.error}
        />
      </SafeAreaView>
    )
  }
}

export const Dashboard = (ownProps: Record<string, unknown>) => {
  const intl = useIntl()
  const navigation = useNavigation()
  const utxoBalance = useSelector(utxoBalanceSelector)
  const utxos = useSelector(utxosSelector)
  const isFetchingUtxos = useSelector(isFetchingUtxosSelector)
  const accountBalance = useSelector(accountBalanceSelector)
  const isDelegating = useSelector(isDelegatingSelector)
  const isFetchingAccountState = useSelector(isFetchingAccountStateSelector)
  const lastAccountStateSyncError = useSelector(lastAccountStateFetchErrorSelector)
  const poolOperator = useSelector(poolOperatorSelector)
  const poolInfo = useSelector(poolInfoSelector)
  const isFetchingPoolInfo = useSelector(isFetchingPoolInfoSelector)
  const totalDelegated = useSelector(totalDelegatedSelector)
  const isOnline = useSelector(isOnlineSelector)
  const isFlawedWallet = useSelector(isFlawedWalletSelector)
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const isHW = useSelector(isHWSelector)
  const isReadOnly = useSelector(isReadOnlySelector)
  const hwDeviceInfo = useSelector(hwDeviceInfoSelector)
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const serverStatus = useSelector(serverStatusSelector)
  const walletMeta = useSelector(walletMetaSelector)

  const dispatch = useDispatch()

  const fetchPoolInfo = () => dispatch(fetchPoolInfo())
  const fetchAccountState = () => dispatch(fetchAccountState())
  const fetchUTXOs = () => dispatch(fetchUTXOs())
  const checkForFlawedWallets = () => dispatch(checkForFlawedWallets())
  const setLedgerDeviceId = () => dispatch(setLedgerDeviceId())
  const setLedgerDeviceObj = () => dispatch(setLedgerDeviceObj())
  const submitTransaction = () => dispatch(submitTransaction())
  const submitSignedTx = () => dispatch(submitSignedTx())

  const props: Props = {
    intl,
    navigation,
    utxoBalance,
    utxos,
    isFetchingUtxos,
    accountBalance,
    isDelegating,
    isFetchingAccountState,
    lastAccountStateSyncError,
    poolOperator,
    poolInfo,
    isFetchingPoolInfo,
    totalDelegated,
    isOnline,
    isFlawedWallet,
    isEasyConfirmationEnabled,
    isHW,
    isReadOnly,
    hwDeviceInfo,
    defaultAsset,
    serverStatus,
    walletMeta,
    fetchPoolInfo,
    fetchAccountState,
    fetchUTXOs,
    checkForFlawedWallets,
    setLedgerDeviceId,
    setLedgerDeviceObj,
    submitTransaction,
    submitSignedTx,
    ...ownProps,
  }

  return <DashboardLegacy {...props} />
}

const SyncErrorBanner = ({showRefresh}: Record<string, unknown> /* TODO: type */) => {
  const intl = useIntl()

  return (
    <Banner
      error
      text={
        showRefresh
          ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
          : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
      }
    />
  )
}
