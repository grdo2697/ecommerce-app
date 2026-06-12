/**
 * تنسيق العملة العراقية
 * 1 دولار = 1,300 دينار عراقي (تقريباً - عدّل الرقم حسب السعر الحالي)
 */

export const IQD_RATE = 1300

export const formatIQD = (usdAmount) => {
  const iqd = Math.round(parseFloat(usdAmount || 0) * IQD_RATE)
  return iqd.toLocaleString('ar-IQ') + ' د.ع'
}

export const validateIraqiPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  return /^(07[3-9]\d{8}|9647[3-9]\d{8})$/.test(cleaned)
}
