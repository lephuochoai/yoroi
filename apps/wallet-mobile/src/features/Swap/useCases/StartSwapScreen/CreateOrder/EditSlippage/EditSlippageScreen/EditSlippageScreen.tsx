import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import React, {useEffect, useRef, useState} from 'react'
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView} from '../../../../../../../components'
import {useLanguage} from '../../../../../../../kernel/i18n'
import {NumberLocale} from '../../../../../../../kernel/i18n/languages'
import {useMetrics} from '../../../../../../../kernel/metrics/metricsManager'
import {Quantities} from '../../../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../../../common/navigation'
import {useStrings} from '../../../../../common/strings'

type ManualChoice = {
  label: 'Manual'
  value: string
}

type GivenChoice = {
  label: '0%' | '0.1%' | '0.5%' | '1%' | '2%' | '3%'
  value: number
}

type Choice = ManualChoice | GivenChoice

type ChoiceKind = Choice['label']

const CHOICES: Readonly<Choice[]> = [
  {label: '0%', value: 0},
  {label: '0.1%', value: 0.1},
  {label: '0.5%', value: 0.5},
  {label: '1%', value: 1},
  {label: '2%', value: 2},
  {label: '3%', value: 3},
  {label: 'Manual', value: ''},
] as const

const MAX_DECIMALS = 1

export const EditSlippageScreen = () => {
  const {numberLocale} = useLanguage()
  const styles = useStyles()

  const {slippageChanged, orderData} = useSwap()
  const defaultSelectedChoice = getChoiceBySlippage(orderData.slippage, numberLocale)
  const defaultInputValue =
    defaultSelectedChoice.label === 'Manual' ? new BigNumber(orderData.slippage).toFormat(numberLocale) : ''

  const [selectedChoiceLabel, setSelectedChoiceLabel] = useState<ChoiceKind>(defaultSelectedChoice.label)
  const [inputValue, setInputValue] = useState(defaultInputValue)

  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput | null>(null)
  const navigate = useNavigateTo()
  const strings = useStrings()
  const {track} = useMetrics()

  const selectedChoice = getChoiceByLabel(selectedChoiceLabel)
  const isSelectedChoiceManual = selectedChoiceLabel === 'Manual'

  const handleChoicePress = (kind: ChoiceKind) => {
    setSelectedChoiceLabel(kind)
  }

  const handleInputChange = (text: string) => {
    const [value] = Quantities.parseFromText(text, MAX_DECIMALS, numberLocale)
    setInputValue(value)
  }

  const onSubmit = () => {
    const slippage = selectedChoice.label === 'Manual' ? parseNumber(inputValue, numberLocale) : selectedChoice.value
    track.swapSlippageChanged({slippage_tolerance: slippage})
    slippageChanged(slippage)
    navigate.startSwap()
  }

  useEffect(() => {
    if (isSelectedChoiceManual && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSelectedChoiceManual])

  const isInputEnabled = isSelectedChoiceManual
  const hasError = isSelectedChoiceManual && !validateSlippage(inputValue, numberLocale)
  const isButtonDisabled = hasError || (isSelectedChoiceManual && inputValue.length === 0)

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} keyboardVerticalOffset={102}>
        <ScrollView bounces={false} style={styles.flex}>
          <Text style={styles.description}>{strings.slippageInfo}</Text>

          <View style={styles.choicesContainer}>
            {CHOICES.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.choiceButton, selectedChoiceLabel === choice.label && styles.selectedChoiceButton]}
                onPress={() => handleChoicePress(choice.label)}
              >
                <Text style={[styles.choiceLabel, selectedChoiceLabel === choice.label && styles.selectedChoiceLabel]}>
                  {choice.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={[
              styles.inputContainer,
              !isInputEnabled && styles.disabledInputContainer,
              hasError && styles.errorInput,
              isInputEnabled && !hasError && isFocused && styles.inputFocused,
            ]}
          >
            <Text style={[styles.label, hasError && styles.errorText]}>{strings.slippageTolerance}</Text>

            <TextInput
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              ref={inputRef}
              value={isInputEnabled ? inputValue : new BigNumber(selectedChoice.value).toFormat(numberLocale)}
              onChangeText={handleInputChange}
              editable={isInputEnabled}
              key={isInputEnabled ? 'enabled' : 'disabled'}
              selectTextOnFocus={isInputEnabled}
              autoFocus={isInputEnabled}
              style={styles.input}
              keyboardType="numeric"
              selectionColor="#242838"
            />

            <Text style={styles.percentLabel}>%</Text>
          </View>

          {isSelectedChoiceManual && !hasError && (
            <Text style={[styles.textInfo, styles.bottomText]}>{strings.enterSlippage}</Text>
          )}

          {isSelectedChoiceManual && hasError && (
            <Text style={[styles.bottomText, styles.errorText]}>{strings.slippageToleranceError}</Text>
          )}
        </ScrollView>

        <Button
          testID="applyButton"
          shelleyTheme
          title={strings.apply}
          disabled={isButtonDisabled}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
      ...atoms.p_lg,
    },
    textInfo: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c600,
    },
    description: {
      ...atoms.py_lg,
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    bottomText: {
      color: color.gray_c700,
      ...atoms.body_3_sm_regular,
      ...atoms.pt_lg,
    },
    choicesContainer: {
      flexDirection: 'row',
      ...atoms.pb_xl,
      flexWrap: 'wrap',
    },
    choiceButton: {
      ...atoms.p_sm,
    },
    selectedChoiceButton: {
      backgroundColor: color.gray_c200,
      borderRadius: 8,
    },
    choiceLabel: {
      ...atoms.body_1_lg_medium,
      color: color.gray_cmax,
    },
    selectedChoiceLabel: {
      color: color.gray_cmax,
    },
    inputContainer: {
      borderRadius: 6,
      borderWidth: 1,
      borderColor: color.gray_c300,
      ...atoms.p_lg,
      position: 'relative',
    },
    label: {
      position: 'absolute',
      top: -7,
      left: 10,
      backgroundColor: color.gray_cmin,
      ...atoms.py_xs,
      ...atoms.body_3_sm_regular,
      color: color.sys_magenta_c500,
    },

    disabledInputContainer: {
      backgroundColor: color.gray_c50,
    },
    errorText: {
      color: color.sys_magenta_c500,
      ...atoms.body_3_sm_regular,
    },
    errorInput: {
      borderColor: color.sys_magenta_c500,
    },
    input: {
      ...atoms.p_0,
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    inputFocused: {
      borderColor: color.gray_c900,
      borderWidth: 2,
    },
    percentLabel: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
      ...atoms.p_lg,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  })

  return styles
}

const validateSlippage = (text: string, format: NumberLocale) => {
  const slippage = parseNumber(text, format)
  return !isNaN(slippage) && slippage >= 0 && slippage <= 75
}

const parseNumber = (text: string, format: NumberLocale) => {
  const [, quantity] = Quantities.parseFromText(text, MAX_DECIMALS, format)
  return Number(Quantities.denominated(quantity, MAX_DECIMALS))
}

const getChoiceBySlippage = (slippage: number, format: NumberLocale): Choice => {
  return (
    CHOICES.find((choice) => choice.value === slippage) ?? {
      label: 'Manual',
      value: new BigNumber(slippage).toFormat(format),
    }
  )
}

const getChoiceByLabel = (label: ChoiceKind): Choice => {
  return CHOICES.find((choice) => choice.label === label) ?? {label: 'Manual', value: ''}
}
