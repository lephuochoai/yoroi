import {join} from 'path'

export const DEFAULT_TIMEOUT = 5000
export const DEFAULT_INTERVAL = 200
export const VALID_PIN = '123456'
export const WALLET_NAME = 'Testnet Wallet'
export const WALLET_NAME_RESTORED = `Restored ${WALLET_NAME}`
export const SPENDING_PASSWORD = '1234567890'
export const APP_ID = 'com.emurgo.nightly'
export const APP_ID_PARENT = 'com.emurgo.*'
export const APP_PATH = join(process.cwd(), '/tests/app/Yoroi-Nightly.apk')
export const RESTORED_WALLET = [
    'ritual',
    'nerve',
    'sweet',
    'social',
    'level',
    'pioneer',
    'cream',
    'artwork',
    'material',
    'three',
    'thumb',
    'melody',
    'zoo',
    'fence',
    'east'
]
export const RESTORED_WALLET_CHECKSUM = 'CONL-2085'