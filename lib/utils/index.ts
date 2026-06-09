import type { ResponsibilityItem } from '@/lib/types'

const CURRENCY_SYMBOLS: Record<string, string> = {
  KRW: '원', USD: '$', EUR: '€', JPY: '¥', GBP: '£', CNY: '¥',
}
const CURRENCY_LOCALES: Record<string, string> = {
  KRW: 'ko-KR', USD: 'en-US', EUR: 'de-DE', JPY: 'ja-JP', GBP: 'en-GB', CNY: 'zh-CN',
}

export function fmtMoney(n: number, currency?: string): string {
  const cur = currency ?? 'KRW'
  const abs = Math.abs(n)
  const locale = CURRENCY_LOCALES[cur] ?? 'ko-KR'
  const formatted = abs.toLocaleString(locale)
  const sym = CURRENCY_SYMBOLS[cur] ?? '원'
  const str = cur === 'KRW' ? `${formatted}원` : `${sym}${formatted}`
  return n < 0 ? `-${str}` : str
}

export function fmtDate(ts: any): string {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

export function toMonthlyAmount(item: ResponsibilityItem): number {
  const m: Record<string, number> = {
    monthly: 1, bimonthly: 0.5, quarterly: 1 / 3,
    semiannual: 1 / 6, yearly: 1 / 12, once: 1,
  }
  return Math.round(item.amount * (m[item.cycle] ?? 1))
}

export function toYearlyAmount(item: ResponsibilityItem): number {
  const m: Record<string, number> = {
    monthly: 12, bimonthly: 6, quarterly: 4,
    semiannual: 2, yearly: 1, once: 1,
  }
  return Math.round(item.amount * (m[item.cycle] ?? 1))
}

export function getDaysUntilPayment(item: ResponsibilityItem): number {
  const today = new Date()
  const day = item.dayOfMonth ?? 1
  let target = new Date(today.getFullYear(), today.getMonth(), day)
  if (target <= today) target = new Date(today.getFullYear(), today.getMonth() + 1, day)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDaysUntilExpiry(item: ResponsibilityItem): number | null {
  if (!item.contractEndDate) return null
  const d = item.contractEndDate as any
  const date = d.toDate ? d.toDate() : new Date(d)
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export type ExpiryStatus = 'none' | 'expired' | 'critical' | 'warning' | 'notice' | 'safe'

export function getExpiryStatus(days: number | null): ExpiryStatus {
  if (days === null) return 'none'
  if (days < 0) return 'expired'
  if (days <= 7) return 'critical'
  if (days <= 30) return 'warning'
  if (days <= 90) return 'notice'
  return 'safe'
}
