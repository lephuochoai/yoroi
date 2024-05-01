import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../metrics/metricsManager'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/contants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const AboutRecoveryPhraseScreen = () => {
  const bold = useBold()
  const {styles} = useStyles()
  const strings = useStrings()
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletLearnPhraseStepViewed()
    }, [track]),
  )

  const handleOnLearMoreButtonPress = () => {
    track.createWalletTermsPageViewed()
    Linking.openURL(YoroiZendeskLink)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View>
        <StepperProgress currentStep={1} currentStepTitle={strings.stepAboutRecoveryPhrase} totalSteps={4} />

        <Space height="lg" />

        <Text style={styles.aboutRecoveryPhraseTitle}>{strings.aboutRecoveryPhraseTitle(bold)}</Text>

        <Space height="lg" />

        <CardAboutPhrase
          showBackgroundColor
          includeSpacing
          linesOfText={[
            strings.aboutRecoveryPhraseCardFirstItem(bold),
            strings.aboutRecoveryPhraseCardSecondItem(bold),
            strings.aboutRecoveryPhraseCardThirdItem(bold),
            strings.aboutRecoveryPhraseCardFourthItem(bold),
            strings.aboutRecoveryPhraseCardFifthItem(bold),
          ]}
        />

        <Space height="lg" />

        <LearnMoreButton onPress={handleOnLearMoreButtonPress} />
      </View>

      <Button
        title={strings.next}
        style={styles.button}
        onPress={() => navigation.navigate('setup-wallet-recovery-phrase-mnemonic')}
      />
    </SafeAreaView>
  )
}

const useBold = () => {
  const {styles} = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      ...atoms.px_lg,
      justifyContent: 'space-between',
      backgroundColor: color.white_static,
    },
    aboutRecoveryPhraseTitle: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    button: {backgroundColor: color.primary_c500},
    bolder: {
      ...atoms.body_1_lg_medium,
    },
  })

  return {styles} as const
}
