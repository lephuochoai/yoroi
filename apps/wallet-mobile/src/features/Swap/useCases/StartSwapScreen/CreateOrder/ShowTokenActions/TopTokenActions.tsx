import {useSwap, useSwapPoolsByPair} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../../../components'
import {LoadingOverlay} from '../../../../../../components/LoadingOverlay'
import {COLORS} from '../../../../../../theme'
import {ButtonGroup} from '../../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'

export const TopTokenActions = () => {
  const strings = useStrings()
  const orderTypeLabels = [strings.marketButton, strings.limitButton]

  const {createOrder, orderTypeChanged} = useSwap()

  const {isBuyTouched, isSellTouched} = useSwapTouched()
  const isDisabled = !isBuyTouched || !isSellTouched || createOrder.selectedPool === undefined

  const orderTypeIndex = createOrder.type === 'market' ? 0 : 1
  const handleSelectOrderType = (index: number) => {
    orderTypeChanged(index === 0 ? 'market' : 'limit')
  }

  const {refetch, isLoading} = useSwapPoolsByPair({
    tokenA: createOrder.amounts.sell.tokenId ?? '',
    tokenB: createOrder.amounts.buy.tokenId ?? '',
  })

  const handleSync = () => {
    refetch()
  }

  return (
    <View style={styles.buttonsGroup}>
      <ButtonGroup
        labels={orderTypeLabels}
        onSelect={(index) => handleSelectOrderType(index)}
        selected={orderTypeIndex}
      />

      <TouchableOpacity onPress={handleSync} disabled={isDisabled}>
        <Icon.Refresh size={24} color={isDisabled ? COLORS.DISABLED : ''} />
      </TouchableOpacity>

      <LoadingOverlay loading={isLoading} />
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsGroup: {
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
