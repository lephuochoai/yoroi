/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation, useRoute} from '@react-navigation/native'
import {isNonNullable} from '@yoroi/common'
import {useExplorers} from '@yoroi/explorers'
import {useTheme} from '@yoroi/theme'
import {BigNumber} from 'bignumber.js'
import {fromPairs} from 'lodash'
import React, {useEffect, useState} from 'react'
import {defineMessages, IntlShape, useIntl} from 'react-intl'
import {LayoutAnimation, Linking, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Banner, Boundary, Button, CopyButton, FadeIn, Icon, Text} from '../../../components'
import AddressModal from '../../../features/Receive/common/AddressModal/AddressModal'
import {usePrivacyMode} from '../../../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages from '../../../kernel/i18n/global-messages'
import {isEmptyString} from '../../../kernel/utils'
import {MultiToken} from '../../../yoroi-wallets/cardano/MultiToken'
import {CardanoTypes, YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useTipStatus, useTransactionInfos} from '../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../yoroi-wallets/types'
import {asQuantity} from '../../../yoroi-wallets/utils'
import {formatDateAndTime, formatTokenWithSymbol} from '../../../yoroi-wallets/utils/format'
import {AssetList} from './AssetList'
import {useAssetListStyles} from './AssetListTransaction.style'

export const TxDetails = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const intl = useIntl()
  const {id} = useRoute().params as Params
  const {wallet} = useSelectedWallet()
  const explorers = useExplorers(wallet.networkManager.network)
  const internalAddressIndex = fromPairs(wallet.internalAddresses.map((addr, i) => [addr, i]))
  const externalAddressIndex = fromPairs(wallet.externalAddresses.map((addr, i) => [addr, i]))
  const [expandedInItemId, setExpandedInItemId] = useState<null | ItemId>(null)
  const [expandedOutItemId, setExpandedOutItemId] = useState<null | ItemId>(null)
  const [addressDetail, setAddressDetail] = React.useState<null | string>(null)
  const transactions = useTransactionInfos(wallet)
  const transaction = transactions[id]
  const memo = !isEmptyString(transaction.memo) ? transaction.memo : '-'

  useTitle(isNonNullable(transaction.submittedAt) ? formatDateAndTime(transaction.submittedAt, intl) : '')

  const {fromFiltered, toFiltered, cntOmittedTo} = getShownAddresses(
    intl,
    transaction,
    internalAddressIndex,
    externalAddressIndex,
  )
  const txFee = transaction.fee != null ? MultiToken.fromArray(transaction.fee).getDefault() : null
  const amountAsMT = MultiToken.fromArray(transaction.amount)
  const amount = amountAsMT.getDefault()

  const toggleExpandIn = (itemId: ItemId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedInItemId(expandedInItemId !== itemId ? itemId : null)
  }

  const toggleExpandOut = (itemId: ItemId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedOutItemId(expandedOutItemId !== itemId ? itemId : null)
  }

  return (
    <FadeIn style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Banner label={strings[transaction.direction]}>
          <Boundary>
            <AdaAmount amount={amount} />

            {txFee && <Fee amount={txFee} />}
          </Boundary>
        </Banner>

        <Label>{strings.memo}</Label>

        <Text secondary monospace>
          {memo}
        </Text>

        <View style={styles.borderTop}>
          <Label>{strings.fromAddresses}</Label>
        </View>

        {fromFiltered.map((item) => (
          <View key={item.id}>
            <AddressEntry {...item} showModalForAddress={setAddressDetail} />

            {item.assets.length > 0 && (
              <TouchableOpacity
                style={styles.assetsExpandable}
                activeOpacity={0.5}
                onPress={() => toggleExpandIn(item.id)}
              >
                <Text style={styles.assetsTitle}>{` -${item.assets.length} ${strings.assetsLabel} `}</Text>

                <Icon.Chevron
                  direction={expandedInItemId === item.id ? 'up' : 'down'}
                  color={colors.iconColor}
                  size={23}
                />
              </TouchableOpacity>
            )}

            <ExpandableAssetList expanded={expandedInItemId === item.id} assets={item.assets} />
          </View>
        ))}

        <View style={styles.borderTop}>
          <Label>{strings.toAddresses}</Label>
        </View>

        {toFiltered.map((item) => (
          <View key={item.id}>
            <AddressEntry {...item} showModalForAddress={setAddressDetail} />

            {item.assets.length > 0 && (
              <TouchableOpacity
                style={styles.assetsExpandable}
                activeOpacity={0.5}
                onPress={() => toggleExpandOut(item.id)}
              >
                <Text style={styles.assetsTitle}>{` +${item.assets.length} ${strings.assetsLabel} `}</Text>

                <Icon.Chevron
                  direction={expandedOutItemId === item.id ? 'up' : 'down'}
                  color={colors.iconColor}
                  size={23}
                />
              </TouchableOpacity>
            )}

            <ExpandableAssetList expanded={expandedOutItemId === item.id} assets={item.assets} />
          </View>
        ))}

        {cntOmittedTo > 0 && <Text>{strings.omittedCount(cntOmittedTo)}</Text>}

        <View style={styles.borderTop}>
          <Label>{strings.txAssuranceLevel}</Label>
        </View>

        <Boundary loading={{size: 'small'}}>
          <Confirmations transaction={transaction} wallet={wallet} />
        </Boundary>

        <Label>{strings.transactionId}</Label>

        <View style={styles.dataContainer}>
          <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
            {transaction.id}
          </Text>

          <CopyButton value={transaction.id} />
        </View>
      </ScrollView>

      <Actions>
        <Button
          onPress={() => Linking.openURL(explorers.cardanoscan.tx(transaction.id))}
          title={strings.openInExplorer}
          shelleyTheme
        />
      </Actions>

      {!isEmptyString(addressDetail) && (
        <AddressModal visible onRequestClose={() => setAddressDetail(null)} address={addressDetail} />
      )}
    </FadeIn>
  )
}

const Confirmations = ({transaction, wallet}: {transaction: TransactionInfo; wallet: YoroiWallet}) => {
  const strings = useStrings()
  const tipStatus = useTipStatus({
    wallet,
    options: {
      refetchInterval: 5000,
    },
  })

  return (
    <Text secondary>
      {strings.confirmations(transaction.blockNumber === 0 ? 0 : tipStatus.bestBlock.height - transaction.blockNumber)}
    </Text>
  )
}

const Label = ({children}: {children: string}) => {
  const {styles} = useStyles()

  return <Text style={styles.label}>{children}</Text>
}

const AdaAmount = ({amount}: {amount: BigNumber}) => {
  const {wallet} = useSelectedWallet()
  const {styles} = useStyles()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const amountStyle = amount.gte(0) ? styles.positiveAmount : styles.negativeAmount

  if (isPrivacyActive) {
    return <Text style={amountStyle}>{privacyPlaceholder}</Text>
  }

  return <Text style={amountStyle}>{formatTokenWithSymbol(asQuantity(amount), wallet.primaryToken)}</Text>
}

const Fee = ({amount}: {amount: BigNumber}) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  const text = `${strings.fee} ${formatTokenWithSymbol(asQuantity(amount), wallet.primaryToken)}`
  return <Text small>{text}</Text>
}

const ExpandableAssetList: React.VFC<{
  expanded: boolean
  assets: CardanoTypes.TokenEntry[]
}> = ({expanded, assets}) => {
  const assetListStyle = useAssetListStyles()
  return (
    <View style={{borderWidth: 1, borderColor: 'transparent'}}>
      {expanded && <AssetList styles={assetListStyle} assets={assets} />}
    </View>
  )
}

type AddressEntryProps = {
  address: string
  path: string
  isHighlighted: boolean
  showModalForAddress: (text: string) => void
}
const AddressEntry = ({address, path, isHighlighted, showModalForAddress}: AddressEntryProps) => {
  const text = `(${path}) ${address}`
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={() => showModalForAddress(address)}>
      <Text secondary bold={isHighlighted}>
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[{padding: 16}, style]} {...props} />

const getShownAddresses = (
  intl: IntlShape,
  transaction: TransactionInfo,
  internalAddressIndex: Record<string, number>,
  externalAddressIndex: Record<string, number>,
) => {
  const isMyReceive = (address: string) => externalAddressIndex[address] != null
  const isMyChange = (address: string) => internalAddressIndex[address] != null
  const isMyAddress = (address: string) => isMyReceive(address) || isMyChange(address)

  const getPath = (address: string) => {
    if (isMyReceive(address)) {
      return intl.formatMessage(messages.addressPrefixReceive, {
        idx: externalAddressIndex[address],
      })
    } else if (isMyChange(address)) {
      return intl.formatMessage(messages.addressPrefixChange, {
        idx: internalAddressIndex[address],
      })
    } else {
      return intl.formatMessage(messages.addressPrefixNotMine)
    }
  }

  const {isHighlightedFrom, isHighlightedTo, filterTo} = {
    SENT: {
      isHighlightedFrom: (_address: string) => false,
      isHighlightedTo: (address: string) => !isMyAddress(address),
      filterTo: null,
    },
    RECEIVED: {
      isHighlightedFrom: (_address: string) => false,
      isHighlightedTo: (address: string) => isMyAddress(address),
      filterTo: (address: string) => isMyAddress(address),
    },
    SELF: {
      isHighlightedFrom: (_address: string) => false,
      isHighlightedTo: (address: string) => !isMyChange(address),
      filterTo: null,
    },
    MULTI: {
      isHighlightedFrom: (address: string) => isMyAddress(address),
      isHighlightedTo: (address: string) => isMyAddress(address),
      filterTo: null,
    },
  }[transaction.direction] as any

  // TODO(ppershing): decide on importance based on Tx direction
  const fromAddresses = transaction.inputs.map(({address, assets}, index) => ({
    id: index,
    address,
    assets,
    path: getPath(address),
    isHighlighted: isHighlightedFrom(address),
  }))

  const toAddresses = transaction.outputs.map(({address, assets}, index) => ({
    id: index,
    address,
    assets,
    path: getPath(address),
    isHighlighted: isHighlightedTo(address),
  }))
  const toFiltered = toAddresses.filter(({address}) => (filterTo != null ? filterTo(address) : true))
  const cntOmittedTo = toAddresses.length - toFiltered.length

  return {
    fromFiltered: fromAddresses,
    toFiltered,
    cntOmittedTo,
  }
}

export type Params = {
  id: string
}

type ItemId = number

const useStrings = () => {
  const intl = useIntl()

  return {
    fee: intl.formatMessage(messages.fee),
    fromAddresses: intl.formatMessage(messages.fromAddresses),
    toAddresses: intl.formatMessage(messages.toAddresses),
    memo: intl.formatMessage(messages.memo),
    transactionId: intl.formatMessage(messages.transactionId),
    txAssuranceLevel: intl.formatMessage(messages.txAssuranceLevel),
    confirmations: (cnt: number) => intl.formatMessage(messages.confirmations, {cnt}),
    omittedCount: (cnt: number) => intl.formatMessage(messages.omittedCount, {cnt}),
    openInExplorer: intl.formatMessage(messages.openInExplorer),
    SENT: intl.formatMessage(txTypeMessages.SENT),
    RECEIVED: intl.formatMessage(txTypeMessages.RECEIVED),
    SELF: intl.formatMessage(txTypeMessages.SELF),
    MULTI: intl.formatMessage(txTypeMessages.MULTI),
    assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
  }
}

const txTypeMessages = defineMessages({
  SENT: {
    id: 'components.txhistory.txdetails.txTypeSent',
    defaultMessage: '!!!Sent funds',
  },
  RECEIVED: {
    id: 'components.txhistory.txdetails.txTypeReceived',
    defaultMessage: '!!!Received funds',
  },
  SELF: {
    id: 'components.txhistory.txdetails.txTypeSelf',
    defaultMessage: '!!!Intrawallet transaction',
  },
  MULTI: {
    id: 'components.txhistory.txdetails.txTypeMulti',
    defaultMessage: '!!!Multi-party transaction',
  },
})

const messages = defineMessages({
  addressPrefixReceive: {
    id: 'components.txhistory.txdetails.addressPrefixReceive',
    defaultMessage: '!!!/{idx}',
  },
  addressPrefixChange: {
    id: 'components.txhistory.txdetails.addressPrefixChange',
    defaultMessage: '!!!/change',
  },
  addressPrefixNotMine: {
    id: 'components.txhistory.txdetails.addressPrefixNotMine',
    defaultMessage: '!!!not mine',
  },
  fee: {
    id: 'components.txhistory.txdetails.fee',
    defaultMessage: '!!!Fee: ',
  },
  fromAddresses: {
    id: 'components.txhistory.txdetails.fromAddresses',
    defaultMessage: '!!!From Addresses',
  },
  toAddresses: {
    id: 'components.txhistory.txdetails.toAddresses',
    defaultMessage: '!!!To Addresses',
  },
  memo: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo',
  },
  transactionId: {
    id: 'components.txhistory.txdetails.transactionId',
    defaultMessage: '!!!Transaction ID',
  },
  txAssuranceLevel: {
    id: 'components.txhistory.txdetails.txAssuranceLevel',
    defaultMessage: '!!!Transaction assurance level',
  },
  confirmations: {
    id: 'components.txhistory.txdetails.confirmations',
    defaultMessage: '!!!{cnt} {cnt, plural, one {CONFIRMATION} other {CONFIRMATIONS}}',
  },
  omittedCount: {
    id: 'components.txhistory.txdetails.omittedCount',
    defaultMessage: '!!!+ {cnt} omitted {cnt, plural, one {address} other {addresses}}',
  },
  openInExplorer: {
    id: 'global.openInExplorer',
    defaultMessage: '!!!Open in explorer',
  },
})

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    contentContainer: {
      ...atoms.px_lg,
    },
    positiveAmount: {
      color: color.primary_c600,
      fontWeight: '500',
    },
    negativeAmount: {
      color: color.sys_magenta_c500,
      fontWeight: '500',
    },
    label: {
      ...atoms.pt_lg,
      marginBottom: 8,
    },
    assetsExpandable: {
      ...atoms.pt_md,
      ...atoms.pb_xl,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignContent: 'center',
    },
    assetsTitle: {
      ...atoms.body_2_md_regular,
      color: color.gray_c900,
    },
    borderTop: {
      borderTopWidth: 1,
      borderColor: 'rgba(173, 174, 182, 0.3)',
    },
    dataContainer: {
      flexDirection: 'row',
      paddingRight: 70,
      marginBottom: 20,
    },
  })
  const colors = {
    iconColor: color.gray_c500,
  }
  return {styles, colors}
}

const useTitle = (text: string) => {
  const navigation = useNavigation()

  useEffect(() => navigation.setOptions({title: text}))
}
