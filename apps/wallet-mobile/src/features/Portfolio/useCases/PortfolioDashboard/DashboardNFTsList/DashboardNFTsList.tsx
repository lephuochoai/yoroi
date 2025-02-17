import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import nftPlaceholder from '../../../../../assets/img/nft-placeholder.png'
import {Icon, Spacer} from '../../../../../components'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioBalances} from '../../../common/hooks/usePortfolioBalances'
import {MediaPreview} from '../../../common/MediaPreview/MediaPreview'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'

export const DashboardNFTsList = () => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const nftsList = balances.nfts ?? []
  const hasNotNfts = nftsList.length === 0

  const handleDirectNFTsList = () => {
    navigationTo.nftsList()
  }

  return (
    <View style={styles.root}>
      <Heading countNfts={nftsList.length} onPress={handleDirectNFTsList} />

      {hasNotNfts ? (
        <View style={styles.container}>
          <Image source={nftPlaceholder} style={[styles.placeholderNft, styles.image]} />
        </View>
      ) : null}

      <FlatList
        horizontal
        data={nftsList}
        ListHeaderComponent={<Spacer width={16} />}
        ListFooterComponent={<Spacer width={16} />}
        ItemSeparatorComponent={() => <Spacer width={8} />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.info.id}
        renderItem={({item}) => (
          <View>
            <MediaPreview info={item.info} width={164} height={164} style={styles.image} />
          </View>
        )}
      />
    </View>
  )
}

type HeadingProps = {
  countNfts: number
  onPress: () => void
}
const Heading = ({countNfts, onPress}: HeadingProps) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={[styles.container, styles.actionsContainer]}>
      <Text style={styles.title}>{strings.nfts(countNfts)}</Text>

      <TouchNFTsList onPress={onPress} />
    </View>
  )
}

const TouchNFTsList = ({onPress}: TouchableOpacityProps) => {
  const {colors} = useStyles()
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon.ArrowRight color={colors.gray_800} size={24} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.px_lg,
    },
    root: {
      ...atoms.flex_col,
      ...atoms.gap_lg,
    },
    actionsContainer: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: color.gray_c900,
    },
    image: {
      ...atoms.rounded_sm,
      overlayColor: '#FFFFFF',
    },
    placeholderNft: {
      width: 164,
      height: 164,
    },
  })
  const colors = {
    gray_800: color.gray_c800,
  }

  return {styles, colors} as const
}
