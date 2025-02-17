import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {usePriceImpactRiskTheme} from '../../features/Swap/common/helpers'
import {SwapPriceImpactRisk} from '../../features/Swap/common/types'
import {isEmptyString} from '../../kernel/utils'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../yoroi-wallets/hooks'
import {Quantities} from '../../yoroi-wallets/utils'
import {Boundary, Icon, Spacer, Text, TokenIcon, TokenIconPlaceholder} from '..'

export type AmountItemProps = {
  wallet: YoroiWallet
  amount: Balance.Amount
  style?: ViewProps['style']
  isPrivacyActive?: boolean
  status?: string
  inWallet?: boolean
  variant?: 'swap'
  priceImpactRisk?: SwapPriceImpactRisk
  orderType?: Swap.OrderType
}

export const AmountItem = ({
  isPrivacyActive,
  wallet,
  style,
  amount,
  inWallet,
  variant,
  priceImpactRisk,
  orderType,
}: AmountItemProps) => {
  const {styles, colors} = useStyles()
  const {quantity, tokenId} = amount
  const tokenInfo = useTokenInfo({wallet, tokenId})

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const name = tokenInfo.ticker ?? tokenInfo.name
  const nameLabel = isEmptyString(name) ? '-' : name
  const detail = isPrimary ? tokenInfo.description : tokenInfo.fingerprint

  const formattedQuantity = Quantities.format(quantity, tokenInfo.decimals ?? 0)
  const showSwapDetails = !isPrimary && variant === 'swap'
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk ?? 'none')
  const priceImpactRiskTextColor = orderType === 'market' ? priceImpactRiskTheme.text : colors.text

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>
        <Boundary loading={{fallback: <TokenIconPlaceholder />}} error={{fallback: () => <TokenIconPlaceholder />}}>
          <TokenIcon wallet={wallet} tokenId={tokenInfo.id} variant={variant} />
        </Boundary>
      </Left>

      <Middle>
        <View style={styles.row}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
            {nameLabel}
          </Text>

          {showSwapDetails && (
            <>
              <Spacer width={4} />

              {inWallet && <Icon.Portfolio size={22} color={colors.icon} />}
            </>
          )}
        </View>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
          {detail}
        </Text>
      </Middle>

      <Right>
        {tokenInfo.kind !== 'nft' && variant !== 'swap' && (
          <View style={styles.row} testID="tokenAmountText">
            {priceImpactRisk === 'moderate' && <Icon.Info size={24} color={priceImpactRiskTextColor} />}

            {priceImpactRisk === 'high' && <Icon.Warning size={24} color={priceImpactRiskTextColor} />}

            <Text style={[styles.quantity, {color: priceImpactRiskTextColor}]}>
              {isPrivacyActive ? '**.*******' : formattedQuantity}
            </Text>
          </View>
        )}
      </Right>
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={style} {...props} />
const Middle = ({style, ...props}: ViewProps) => {
  const {styles} = useStyles()

  return <View style={[style, styles.middle]} {...props} />
}
const Right = ({style, ...props}: ViewProps) => {
  const {styles} = useStyles()

  return <View style={[style, styles.right]} {...props} />
}

export const AmountItemPlaceholder = ({style}: ViewProps) => {
  const {styles} = useStyles()
  return (
    <View style={[style, styles.placeholder]}>
      <View style={styles.placeholderElement1} />

      <View style={styles.placeholderElement2} />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    placeholder: {
      display: 'flex',
      flexDirection: 'row',
      gap: 12,
      height: 56,
    },
    placeholderElement1: {
      backgroundColor: color.gray_c200,
      borderRadius: 8,
      flexGrow: 3,
    },
    placeholderElement2: {
      backgroundColor: color.gray_c200,
      borderRadius: 8,
      flexGrow: 1,
    },
    middle: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    right: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    name: {
      color: color.gray_c900,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
    },
    detail: {
      color: color.gray_c600,
      fontSize: 12,
      lineHeight: 18,
      maxWidth: 140,
    },
    quantity: {
      color: color.gray_c900,
      ...atoms.body_1_lg_regular,
      textAlign: 'right',
      flexGrow: 1,
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  const colors = {
    text: color.gray_c900,
    icon: color.secondary_c600,
  }

  return {styles, colors}
}
