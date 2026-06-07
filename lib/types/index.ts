import type { Timestamp } from 'firebase/firestore'

export type CategorySlug =
  | 'telecom'
  | 'utility'
  | 'insurance'
  | 'subscription'
  | 'rental'
  | 'tax'
  | 'penalty'
  | 'vehicle'
  | 'housing'
  | 'finance'
  | 'business'
  | 'other'

export type PaymentCycle =
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannual'
  | 'yearly'
  | 'once'

export interface Attachment {
  id: string
  name: string
  url: string
  type: 'contract' | 'receipt' | 'invoice' | 'certificate' | 'other'
  uploadedAt: Timestamp
}

export interface ResponsibilityItem {
  id: string
  userId: string
  name: string
  description?: string
  category: CategorySlug
  subcategory?: string
  tags?: string[]
  amount: number
  originalAmount?: number
  discountAmount?: number
  discountReason?: string
  cycle: PaymentCycle
  dayOfMonth?: number
  nextPaymentDate?: Timestamp
  paymentCardId?: string
  paymentMethod?: string
  paymentAccount?: string
  isAutoPayment: boolean
  contractStartDate?: Timestamp
  contractEndDate?: Timestamp
  autoRenews: boolean
  renewalNoticeDays?: number
  trialEndDate?: Timestamp
  minimumContractMonths?: number
  provider: string
  providerUrl?: string
  providerPhone?: string
  accountNumber?: string
  owner?: string
  ownerType?: 'self' | 'spouse' | 'parent' | 'child' | 'business'
  attachments?: Attachment[]
  aiParsed: boolean
  aiConfidence?: number
  rawInput?: string
  status: 'active' | 'expiring' | 'expired' | 'cancelled' | 'paused'
  isArchived: boolean
  memo?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CardBenefit {
  id: string
  description: string
  conditionType: 'min_spend' | 'category_spend' | 'merchant'
  conditionAmount?: number
  conditionCategory?: CategorySlug
  discountAmount?: number
  discountRate?: number
  discountCap?: number
  applicableCategories?: CategorySlug[]
  applicableProviders?: string[]
  isActive: boolean
}

export interface CreditCard {
  id: string
  userId: string
  name: string
  issuer: string
  cardType: 'credit' | 'debit' | 'prepaid'
  last4Digits?: string
  color?: string
  network?: 'visa' | 'mastercard' | 'amex' | 'local'
  benefits: CardBenefit[]
  monthlySpend?: number
  isActive: boolean
  isPrimary: boolean
  memo?: string
  createdAt: Timestamp
}

export interface NotificationRecord {
  id: string
  itemId: string
  type: 'expiry' | 'renewal' | 'payment' | 'trial_end' | 'benefit_threshold'
  message: string
  daysUntil: number
  isRead: boolean
  sentAt: Timestamp
}

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  settings: {
    notifyDaysBefore: number[]
    currency: 'KRW'
    timezone: 'Asia/Seoul'
    defaultPaymentCardId?: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ParseResponse {
  items: Partial<ResponsibilityItem>[]
  confidence: number
  missingFields: string[][]
  followUpQuestions: string[]
}

export interface CategoryMeta {
  label: string
  icon: string
  color: string
  textColor: string
  subcategories: string[]
  providers: string[]
}
