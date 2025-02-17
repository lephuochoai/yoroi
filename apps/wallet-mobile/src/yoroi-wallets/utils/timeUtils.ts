export type ToAbsoluteSlotNumberRequest = {
  epoch: number
  slot: number
}
export type ToAbsoluteSlotNumberResponse = number

export type ToRelativeSlotNumberRequest = ToAbsoluteSlotNumberResponse
export type ToRelativeSlotNumberResponse = ToAbsoluteSlotNumberRequest
export type ToRelativeSlotNumberFunc = (request: ToRelativeSlotNumberRequest) => ToRelativeSlotNumberResponse
export function genToRelativeSlotNumber(
  config: Array<{
    StartAt?: number
    SlotsPerEpoch?: number
  }>,
): ToRelativeSlotNumberFunc {
  return (absoluteSlot: ToRelativeSlotNumberRequest) => {
    let SlotsPerEpoch = config[0].SlotsPerEpoch
    let epochCount = 0
    let slotsLeft = absoluteSlot

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start =
        config[i].StartAt ??
        (() => {
          throw new Error('genToRelativeSlotNumber missing start')
        })()
      const end =
        config[i + 1].StartAt ??
        (() => {
          throw new Error('genToRelativeSlotNumber end')
        })()
      const numEpochs = end - start

      if (SlotsPerEpoch == null) {
        throw new Error('genToRelativeSlotNumber params')
      }

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break
      }

      slotsLeft -= SlotsPerEpoch * numEpochs
      epochCount += numEpochs

      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch
    }

    if (SlotsPerEpoch == null) {
      throw new Error('genToAbsoluteSlotNumber:: missing params')
    }

    // find how many slots in the epochs since the last update
    epochCount += Math.floor(slotsLeft / SlotsPerEpoch)

    return {
      epoch: epochCount,
      slot: slotsLeft % SlotsPerEpoch,
    }
  }
}

export type TimeToAbsoluteSlotRequest = {
  time: number
}
export type TimeToAbsoluteSlotResponse = {
  slot: number
  msIntoSlot: number
}
export type TimeToAbsoluteSlotFunc = (request: TimeToAbsoluteSlotRequest) => TimeToAbsoluteSlotResponse

export function genTimeToSlot(
  config: Array<{
    StartAt?: number
    GenesisDate?: string
    SlotsPerEpoch?: number
    SlotDuration?: number
  }>,
): TimeToAbsoluteSlotFunc {
  return (request: TimeToAbsoluteSlotRequest) => {
    const {GenesisDate} = config[0]
    if (GenesisDate == null) {
      throw new Error('genTimeToSlot missing genesis params')
    }
    let SlotDuration = config[0].SlotDuration
    let SlotsPerEpoch = config[0].SlotsPerEpoch
    let timeLeftToTip = request.time - Number.parseInt(GenesisDate, 10)
    let slotCount = 0

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start =
        config[i].StartAt ??
        (() => {
          throw new Error('genTimeToSlot missing start')
        })()
      const end =
        config[i + 1].StartAt ??
        (() => {
          throw new Error('genTimeToSlot missing end')
        })()
      const numEpochs = end - start
      if (SlotDuration == null || SlotsPerEpoch == null) {
        throw new Error('genTimeToSlot missing params')
      }

      // queried time is before the next protocol parameter choice
      if (timeLeftToTip < SlotsPerEpoch * SlotDuration * 1000 * numEpochs) {
        break
      }
      slotCount += SlotsPerEpoch * numEpochs
      timeLeftToTip -= SlotsPerEpoch * SlotDuration * 1000 * numEpochs

      SlotDuration = config[i + 1].SlotDuration ?? SlotDuration
      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch
    }

    if (SlotDuration == null || SlotsPerEpoch == null) {
      throw new Error('genTimeToSlot missing params')
    }

    // find how many slots since the last update
    const secondsSinceLastUpdate = timeLeftToTip / 1000
    slotCount += Math.floor(secondsSinceLastUpdate / SlotDuration)

    const msIntoSlot = timeLeftToTip % 1000
    const secondsIntoSlot = secondsSinceLastUpdate % SlotDuration
    return {
      slot: slotCount,
      msIntoSlot: 1000 * secondsIntoSlot + msIntoSlot,
    }
  }
}

export type CurrentEpochLengthRequest = void

/** slots per epoch */
export type CurrentEpochLengthResponse = number
export type CurrentEpochLengthFunc = (request: CurrentEpochLengthRequest) => CurrentEpochLengthResponse
export function genCurrentEpochLength(
  config: Array<{
    SlotsPerEpoch?: number
  }>,
): CurrentEpochLengthFunc {
  return (_request: CurrentEpochLengthRequest) => {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {})
    return finalConfig.SlotsPerEpoch as number
  }
}

export type CurrentSlotLengthRequest = void
export type CurrentSlotLengthResponse = number
export type CurrentSlotLengthFunc = (request: CurrentSlotLengthRequest) => CurrentSlotLengthResponse
export function genCurrentSlotLength(
  config: Array<{
    SlotDuration?: number
  }>,
): CurrentSlotLengthFunc {
  return (_request: CurrentSlotLengthRequest) => {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {})
    return finalConfig.SlotDuration as number
  }
}

export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const ms_in_sec = 1000,
  sec_in_day = 86400,
  sec_in_hour = 3600,
  sec_in_min = 60

export const formatTimeSpan = (ms: number) => {
  if (ms < 0) return ''

  let seconds = Math.round(Math.abs(ms) / ms_in_sec)
  const days = Math.floor(seconds / sec_in_day)
  seconds = Math.floor(seconds % sec_in_day)
  const hours = Math.floor(seconds / sec_in_hour)
  seconds = Math.floor(seconds % sec_in_hour)
  const minutes = Math.floor(seconds / sec_in_min)
  const [dd, hh, mm] = [days, hours, minutes].map((item) => (item < 10 ? '0' + item : item.toString()))
  return `${dd}d : ${hh}h : ${mm}m`
}
