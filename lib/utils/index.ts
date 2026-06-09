import type { ResponsibilityItem } from '@/lib/types'

export function fmtMoney(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
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
