import {
  PortfolioTokenApplication,
  PortfolioTokenId,
  PortfolioTokenNature,
  PortfolioTokenStatus,
  PortfolioTokenType,
} from './token'

type CommonTokenInfo = {
  decimals: number
  ticker: string // Shorthand as token e.g., ADA

  name: string
  symbol: string // Shorthand as monetary i.e., Ω

  status: PortfolioTokenStatus // Backend meta
  application: PortfolioTokenApplication // Backend meta (based on policyId)

  tag: string
  reference: string // output
  fingerprint: string
  description: string

  website: string // Full link with protocol

  originalImage: string // Base link
  icon: string // base64 - 32x32
  mediaType: string
}

type PrimaryTokenInfo = {
  id: '.'
  nature: PortfolioTokenNature.Primary
  type: PortfolioTokenType.FT
}

type SecondaryTokenInfo = {
  id: PortfolioTokenId
  nature: PortfolioTokenNature.Secondary
  type: PortfolioTokenType
}

export type PortfolioTokenInfo = CommonTokenInfo &
  (PrimaryTokenInfo | SecondaryTokenInfo)
