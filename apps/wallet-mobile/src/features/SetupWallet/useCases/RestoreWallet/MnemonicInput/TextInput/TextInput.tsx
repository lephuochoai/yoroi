import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TextInput as RNTextInput, TextInputProps as RNTextInputProps, View, ViewStyle} from 'react-native'
import {HelperText as HelperTextRNP, TextInput as RNPTextInput} from 'react-native-paper'

import {isEmptyString} from '../../../../../../kernel/utils'

export type TextInputProps = RNTextInputProps &
  Omit<React.ComponentProps<typeof RNPTextInput>, 'theme'> & {
    containerStyle?: ViewStyle
    renderComponentStyle?: ViewStyle
    helper?: React.ReactNode
    errorText?: string
    disabled?: boolean
    errorOnMount?: boolean
    errorDelay?: number
    noHelper?: boolean
    dense?: boolean
    faded?: boolean
    showErrorOnBlur?: boolean
    selectTextOnAutoFocus?: boolean
    isValidPhrase: boolean
  }

const useDebounced = (callback: VoidFunction, value: unknown, delay = 1000) => {
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return () => {
        return
      }
    }

    const handler = setTimeout(() => callback(), delay)

    return () => clearTimeout(handler)
  }, [callback, delay, value])
}

export const TextInput = React.forwardRef((props: TextInputProps, ref: React.ForwardedRef<RNTextInput>) => {
  const {
    value,
    containerStyle,
    renderComponentStyle,
    helper,
    errorText,
    errorOnMount,
    errorDelay,
    noHelper,
    textAlign,
    faded,
    showErrorOnBlur,
    autoComplete = 'off',
    onFocus,
    onBlur,
    onChangeText,
    onChange,
    autoFocus,
    selectTextOnAutoFocus,
    isValidPhrase = false,
    cursorColor,
    selectionColor,
    ...restProps
  } = props

  const [errorTextEnabled, setErrorTextEnabled] = React.useState(errorOnMount)
  const [isValidWord, setIsValidWord] = React.useState(false)
  const {colors} = useStyles()
  const {isDark} = useTheme()

  useDebounced(
    React.useCallback(() => setErrorTextEnabled(true), []),
    value,
    errorDelay,
  )
  const showError = errorTextEnabled && !isEmptyString(errorText)
  const showHelperComponent = helper != null && !isString(helper)

  const helperToShow = showError ? (
    <HelperText type="error" visible>
      {errorText}
    </HelperText>
  ) : showHelperComponent ? (
    helper
  ) : (
    <HelperText type="info" visible>
      {helper}
    </HelperText>
  )

  React.useEffect(() => {
    if (value === '') setIsValidWord(false)
  }, [value])

  return (
    <View style={containerStyle}>
      {isValidWord && isEmptyString(errorText) && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 8,
              top: 6,
              backgroundColor: isValidPhrase ? colors.positiveGreen : colors.positiveGray,
            },
          ]}
        />
      )}

      <RNPTextInput
        ref={ref}
        style={{textAlign}}
        value={value}
        onChange={(e) => {
          setErrorTextEnabled(false)
          setIsValidWord(false)

          onChange?.(e)
        }}
        onChangeText={(e) => {
          setErrorTextEnabled(false)
          setIsValidWord(false)

          onChangeText?.(e)
        }}
        autoCorrect={false}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoFocus={selectTextOnAutoFocus || autoFocus}
        onFocus={(event) => {
          // selectTextOnFocus + autoFocus doesn't work as expected
          // also there is a bug on ios for selectTextOnFocus: https://github.com/facebook/react-native/issues/30585
          // note: selectTextOnFocus is not equal to selectTextOnAutoFocus
          if (selectTextOnAutoFocus) event.currentTarget.setSelection(0, value?.length)

          if (onFocus) onFocus(event)
        }}
        theme={{
          roundness: 8,
          colors: {
            background: colors.none,
            placeholder: faded
              ? colors.focusInput
              : isValidWord && isEmptyString(errorText)
              ? colors.none
              : colors.input,
            primary: faded ? colors.input : colors.focusInput,
            error: colors.textError,
          },
        }}
        mode="outlined"
        error={errorTextEnabled && !isEmptyString(errorText)}
        render={({style, ...inputProps}) => (
          <InputContainer>
            <RNTextInput
              {...inputProps}
              cursorColor={cursorColor}
              selectionColor={selectionColor}
              style={[
                style,
                renderComponentStyle,
                {color: isDark && isValidPhrase && isValidWord ? colors.successText : colors.text, flex: 1},
              ]}
            />
          </InputContainer>
        )}
        onBlur={(e) => {
          if (!isEmptyString(errorText)) {
            if (showErrorOnBlur && !errorTextEnabled) setErrorTextEnabled(true)
            setIsValidWord(false)
          } else if (value === '') {
            setIsValidWord(false)
            setErrorTextEnabled(false)
          } else {
            setIsValidWord(true)
          }

          onBlur?.(e)
        }}
        {...restProps}
      />

      {!noHelper && helperToShow}
    </View>
  )
})

export const HelperText = ({
  children,
  type = 'info',
  faded = false,
  visible = true,
  ...props
}: {
  children: React.ReactNode
  type?: 'info' | 'error'
  faded?: boolean
  visible?: boolean
}) => {
  const {colors} = useStyles()

  return (
    <HelperTextRNP
      theme={{
        roundness: 8,
        colors: {
          background: colors.background,
          placeholder: faded ? colors.focusInput : colors.input,
          primary: faded ? colors.focusInput : colors.black,
          error: colors.textError,
          text: colors.infoGray,
        },
      }}
      type={type}
      visible={visible}
      {...props}
    >
      {children}
    </HelperTextRNP>
  )
}

const InputContainer = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()

  return <View style={styles.inputContainer}>{children}</View>
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      flex: 1,
      overflow: 'hidden',
    },
  })

  const colors = {
    background: color.gray_cmin,
    focusInput: color.primary_c500,
    input: color.primary_c300,
    actionGray: color.gray_c500,
    black: color.gray_cmax,
    text: color.primary_c600,
    textError: color.sys_magenta_c500,
    infoGray: color.gray_c700,
    positiveGreen: color.secondary_c300,
    positiveGray: color.primary_c100,
    none: 'transparent',
    successText: color.black_static,
  }

  return {styles, colors}
}
