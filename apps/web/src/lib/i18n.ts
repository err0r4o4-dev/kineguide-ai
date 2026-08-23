import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  th: {
    translation: {
      status: 'สถานะระบบ',
      subtitle: 'ภาพรวมความพร้อมของบริการสำหรับการพัฒนา',
      loading: 'กำลังตรวจสอบสถานะระบบ…',
      refresh: 'ตรวจสอบอีกครั้ง',
      language: 'English',
      healthy: 'พร้อมใช้งาน',
      unhealthy: 'ไม่พร้อมใช้งาน',
      unknown: 'ยังไม่ทราบสถานะ',
      error: 'ไม่สามารถเชื่อมต่อ Go Main API ได้',
      web: 'Web Application',
      api: 'Go Main API',
      ai: 'Python AI Service',
      database: 'PostgreSQL',
      disclaimer:
        'ระบบต้นแบบเพื่อสนับสนุนและให้ความรู้ ไม่ใช่เครื่องมือวินิจฉัยโรค',
      notFound: 'ไม่พบหน้าที่ต้องการ',
      home: 'กลับหน้าหลัก'
    }
  },
  en: {
    translation: {
      status: 'System status',
      subtitle: 'Development service readiness overview',
      loading: 'Checking system status…',
      refresh: 'Check again',
      language: 'ไทย',
      healthy: 'Available',
      unhealthy: 'Unavailable',
      unknown: 'Unknown',
      error: 'Unable to reach the Go Main API',
      web: 'Web Application',
      api: 'Go Main API',
      ai: 'Python AI Service',
      database: 'PostgreSQL',
      disclaimer:
        'A support and educational prototype; it is not a diagnostic tool.',
      notFound: 'Page not found',
      home: 'Return home'
    }
  }
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: 'th',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
