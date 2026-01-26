/**
 * 日期時間工具函數
 * 後端使用 UTC 時間，前端轉換為台北時間 (UTC+8) 顯示
 */

const TAIPEI_TIMEZONE = 'Asia/Taipei'

/**
 * 將 UTC 時間字串轉換為台北時間格式
 * @param {string} utcDateString - UTC 時間字串 (ISO 8601 格式)
 * @param {object} options - 格式化選項
 * @returns {string} 格式化後的台北時間字串
 */
export function formatToTaipeiTime(utcDateString, options = {}) {
  if (!utcDateString) return ''

  const date = new Date(utcDateString)
  if (isNaN(date.getTime())) return ''

  const defaultOptions = {
    timeZone: TAIPEI_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  }

  return date.toLocaleString('zh-TW', defaultOptions)
}

/**
 * 將 UTC 時間字串轉換為台北時間的日期格式 (YYYY/MM/DD)
 * @param {string} utcDateString - UTC 時間字串
 * @returns {string} 格式化後的日期字串
 */
export function formatDateTaipei(utcDateString) {
  return formatToTaipeiTime(utcDateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 將 UTC 時間字串轉換為台北時間的日期時間格式 (YYYY/MM/DD HH:mm)
 * @param {string} utcDateString - UTC 時間字串
 * @returns {string} 格式化後的日期時間字串
 */
export function formatDateTimeTaipei(utcDateString) {
  return formatToTaipeiTime(utcDateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * 將 UTC 時間字串轉換為相對時間 (如: 3 天後、已結束)
 * @param {string} utcDateString - UTC 時間字串
 * @returns {string} 相對時間描述
 */
export function getRelativeTime(utcDateString) {
  if (!utcDateString) return ''

  const date = new Date(utcDateString)
  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return '已結束'
  if (diffDays === 0) return '今天截止'
  if (diffDays === 1) return '明天截止'
  if (diffDays <= 7) return `${diffDays} 天後截止`
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} 週後截止`
  return formatDateTaipei(utcDateString)
}

/**
 * 檢查日期是否已過期
 * @param {string} utcDateString - UTC 時間字串
 * @returns {boolean} 是否已過期
 */
export function isExpired(utcDateString) {
  if (!utcDateString) return false

  const date = new Date(utcDateString)
  if (isNaN(date.getTime())) return false

  return date.getTime() < Date.now()
}

/**
 * 檢查日期是否即將到期 (7 天內)
 * @param {string} utcDateString - UTC 時間字串
 * @returns {boolean} 是否即將到期
 */
export function isExpiringSoon(utcDateString) {
  if (!utcDateString) return false

  const date = new Date(utcDateString)
  if (isNaN(date.getTime())) return false

  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  return diffDays > 0 && diffDays <= 7
}
