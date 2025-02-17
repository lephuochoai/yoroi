import * as React from 'react'

import {useWalletManager} from '../../context/WalletManagerProvider'
import {useSelectedWallet} from './useSelectedWallet'

export const useAddressMode = () => {
  const {walletManager} = useWalletManager()
  const {
    meta: {id, addressMode},
  } = useSelectedWallet()

  return React.useMemo(() => {
    const enableMultipleMode = () => walletManager.changeWalletAddressMode(id, 'multiple')
    const enableSingleMode = () => walletManager.changeWalletAddressMode(id, 'single')

    const toggle = () => {
      if (addressMode === 'single') {
        enableMultipleMode()
      } else {
        enableSingleMode()
      }
    }

    const isSingle = addressMode === 'single'
    const isMultiple = addressMode === 'multiple'

    return {
      isMultiple,
      isSingle,
      addressMode,
      toggle,
      enableSingleMode,
      enableMultipleMode,
    }
  }, [addressMode, walletManager, id])
}
