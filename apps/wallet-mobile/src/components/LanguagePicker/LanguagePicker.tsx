import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import {useSearch, useSearchOnNavBar} from '../../features/Search/SearchContext'
import {useLanguage} from '../../kernel/i18n'
import {Icon} from '../Icon'
import {Text} from '../Text'
import {LanguagePickerWarning} from './LanguagePickerWarning'

const INCLUDED_LANGUAGE_CODES = ['en-US', 'ja-JP']

export const LanguagePicker = () => {
  const {styles, colors} = useStyles()
  const language = useLanguage()
  const {languageCode, selectLanguageCode, supportedLanguages} = language
  const strings = useStrings()

  useSearchOnNavBar({
    title: strings.languagePickerTitle,
    placeholder: strings.languagePickerSearch,
  })

  const {search} = useSearch()
  const filteredLanguages = supportedLanguages.filter(
    (lang) => lang.code.includes(search) || lang.label.includes(search),
  )

  return (
    <View style={styles.languagePicker}>
      <FlatList
        data={filteredLanguages}
        contentContainerStyle={styles.languageList}
        renderItem={({item: {label, code}}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => selectLanguageCode(code)}
            testID={`languageSelect_${code}`}
          >
            <Text style={styles.itemText}>{label}</Text>

            {languageCode === code && <Icon.Check size={24} color={colors.icon} />}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <HR />}
        keyExtractor={(item) => item.code}
      />

      <LanguagePickerWarning enabled={!INCLUDED_LANGUAGE_CODES.includes(languageCode)} key={languageCode} />
    </View>
  )
}

const HR = (props: ViewProps) => {
  const {styles} = useStyles()
  return <View {...props} style={styles.hr} />
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    languagePicker: {
      flex: 1,
      alignItems: 'stretch',
    },
    languageList: {
      alignItems: 'stretch',
      ...atoms.p_lg,
    },
    hr: {
      height: 1,
      backgroundColor: color.gray_c200,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...atoms.py_lg,
    },
    itemText: {
      ...atoms.body_1_lg_medium,
      color: color.gray_c900,
    },
  })
  const colors = {
    icon: color.primary_c600,
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    languagePickerTitle: intl.formatMessage(messages.languagePickerTitle),
    languagePickerSearch: intl.formatMessage(messages.languagePickerSearch),
  }
}

const messages = defineMessages({
  languagePickerTitle: {
    id: 'global.title',
    defaultMessage: '!!!Language',
  },
  languagePickerSearch: {
    id: 'global.search',
    defaultMessage: '!!!Search',
  },
})
