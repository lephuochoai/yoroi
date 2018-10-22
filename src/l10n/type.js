// @flow
// eslint-disable
// WARNING: THIS FILE IS AUTOGENERATED BY update_type.sh
export type Translation = {
  global: {
    language: {
      chineseSimplified: string,
      chineseTraditional: string,
      english: string,
      japanese: string,
      korean: string,
    },
    datetime: {
      today: string,
      yesterday: string,
    },
  },
  loginScreen: {
    title: string,
  },
  languageSelectScreen: {
    selectLanguage: string,
    continue: string,
  },
  txHistoryScreen: {
    transactionType: {
      SENT: string,
      RECEIVED: string,
      SELF: string,
      MULTI: string,
    },
    assuranceLevelHeader: string,
    assuranceLevel: {
      LOW: string,
      MEDIUM: string,
      HIGH: string,
      PENDING: string,
      FAILED: string,
    },
    transactionDetails: {
      fromAddresses: string,
      toAddresses: string,
      transactionId: string,
      txAssuranceLevel: string,
      transactionHeader: {
        SENT: string,
        RECEIVED: string,
        SELF: string,
        MULTI: string,
      },
      formatConfirmations: (cnt: any) => string,
    },
  },
  SendScreen: {
    funds: string,
    scanCode: string,
    address: string,
    amount: string,
    continue: string,
  },
  ConfirmSendScreen: {
    confirm: string,
  },
  walletInitScreen: {
    createWallet: string,
    restoreWallet: string,
  },
  walletDescription: {
    line1: string,
    line2: string,
    byEmurgo: string,
  },
  createWallet: {
    title: string,
    nameLabel: string,
    passwordLabel: string,
    passwordConfirmationLabel: string,
    passwordRequirementsNote: string,
    passwordMinLength: string,
    passwordUpperChar: string,
    passwordLowerChar: string,
    passwordNumber: string,
    createButton: string,
  },
  changeWalletName: {
    walletName: string,
    changeButtonText: string,
  },
  receiveScreen: {
    title: string,
    description: {
      line1: string,
      line2: string,
      line3: string,
    },
    walletAddress: string,
    walletAddresses: string,
    hideUsedAddresses: string,
    showUsedAddresses: string,
  },
  receiveScreenModal: {
    copyLabel: string,
    copiedLabel: string,
  },
  recoveryPhraseConfirmationDialog: {
    title: string,
    keysStorageCheckbox: string,
    newDeviceRecoveryCheckbox: string,
    confirmationButton: string,
  },
  recoveryPhraseConfirmationScreen: {
    title: string,
    instructions: string,
    inputLabel: string,
    invalidPhrase: string,
    clearButton: string,
    confirmButton: string,
  },
  recoveryPhraseDialog: {
    title: string,
    paragraph1: string,
    paragraph2: string,
    nextButton: string,
  },
  recoveryPhraseScreen: {
    title: string,
    mnemonicNote: string,
    confirmationButton: string,
  },
  restoreWalletScreen: {
    title: string,
    instructions: string,
    phrase: string,
    restoreButton: string,
    errors: {
      maxLength: string,
      unknownWords: (words: any) => string,
    },
  },
  txHistoryNavigationButtons: {
    sendButton: string,
    receiveButton: string,
  },
  settings: {
    editWalletName: string,
    termsOfUse: string,
    support: string,
  },
  supportScreen: {
    faqLabel: string,
    faqText: string,
    faqPage: string,
    reportLabel: string,
    reportText: string,
    reportPage: string,
  },
  setLanguage: (lang: string) => void,
}
