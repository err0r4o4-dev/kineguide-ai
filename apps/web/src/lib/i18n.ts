import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { getLanguagePreference } from './languagePreference'

const th = {
  common: {
    language: 'English',
    languageSelector: 'เลือกภาษา',
    languageThai: 'ไทย',
    languageEnglish: 'English',
    loading: 'กำลังโหลด…',
    error: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
    retry: 'ลองอีกครั้ง',
    systemLoadingTitle: 'กำลังเตรียม KineGuide AI',
    systemLoadingBody: 'กำลังโหลดข้อมูลและเตรียมพื้นที่ใช้งานของคุณ',
    loadingProgress: 'ความคืบหน้าการเตรียมระบบ',
    loadingConnect: 'เชื่อมต่อข้อมูล',
    loadingPrepare: 'เตรียมระบบติดตามท่าทาง',
    loadingReady: 'พร้อมใช้งาน',
    loadingWait: 'กรุณารอสักครู่ ระบบจะพร้อมใช้งานในไม่ช้า',
    dataErrorTitle: 'ไม่สามารถโหลดข้อมูลได้',
    dataErrorBody:
      'เกิดข้อผิดพลาดระหว่างเตรียมข้อมูล\nกรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง',
    skip: 'ข้ามไปยังเนื้อหาหลัก',
    continue: 'ดำเนินการต่อ',
    back: 'ย้อนกลับ',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    close: 'ปิด',
    delete: 'ลบ',
    brandSubtitle: 'ระบบติดตามท่าทาง',
    onDevice: 'ทำงานในอุปกรณ์',
    active: 'ใช้งานอยู่',
    inactive: 'ไม่ใช้งาน',
    yes: 'ใช่',
    no: 'ไม่ใช่',
    privacy: 'ความเป็นส่วนตัว',
    retention: 'ระยะเวลาจัดเก็บ',
    safety: 'ความปลอดภัย',
    emergency: 'เหตุฉุกเฉิน',
    noDiagnosis:
      'ระบบนี้เป็นเครื่องมือสนับสนุนและให้ความรู้ ไม่วินิจฉัยโรคหรือทดแทนบุคลากรทางการแพทย์',
    pendingReview:
      'เนื้อหาสาธิตนี้ยังรอการทบทวนจากผู้เชี่ยวชาญ จึงไม่มีคำแนะนำทางคลินิกหรือคะแนนความถูกต้อง'
  },
  pwa: {
    updateTitle: 'มี KineGuide AI รุ่นใหม่',
    updateBody:
      'อัปเดตเพื่อให้เมนูและหน้าจอเป็นรุ่นล่าสุด โดยสถานะการเข้าสู่ระบบจะยังคงอยู่',
    updateNow: 'อัปเดตตอนนี้',
    updating: 'กำลังอัปเดต…',
    updateFailed: 'อัปเดตไม่สำเร็จ กรุณาลองอีกครั้ง',
    retryUpdate: 'ลองอัปเดตอีกครั้ง',
    offlineTitle: 'พร้อมใช้งานแบบออฟไลน์',
    offlineBody: 'ไฟล์ที่จำเป็นถูกเตรียมไว้ในอุปกรณ์นี้แล้ว',
    dismiss: 'ปิดข้อความ'
  },
  nav: {
    public: 'เมนูเว็บไซต์',
    main: 'เมนูหลัก',
    menu: 'เปิดเมนู',
    closeMenu: 'ปิดเมนู',
    home: 'หน้าแรก',
    chat: 'ผู้ช่วย AI',
    monitor: 'ตรวจท่าทาง',
    history: 'ประวัติ',
    analytics: 'สถิติ',
    profile: 'โปรไฟล์',
    settings: 'ตั้งค่า',
    help: 'ช่วยเหลือ',
    getStarted: 'เริ่มต้นใช้งาน'
  },
  account: {
    menu: 'เมนูบัญชี',
    menuWithUnread: 'เมนูบัญชี มีการแจ้งเตือนที่ยังไม่ได้อ่าน {{count}} รายการ',
    notificationMenuLabel: 'การแจ้งเตือน {{count}} รายการยังไม่ได้อ่าน',
    account: 'บัญชี',
    system: 'ระบบ',
    settingsPrivacy: 'ตั้งค่าและความเป็นส่วนตัว',
    logoutTitle: 'ออกจากระบบ',
    logoutConfirm: 'ต้องการออกจากระบบหรือไม่?'
  },
  notifications: {
    title: 'การแจ้งเตือน',
    subtitle: 'ติดตามการแจ้งเตือนและกิจกรรมสำคัญของคุณ',
    filters: 'ตัวกรองการแจ้งเตือน',
    list: 'รายการแจ้งเตือน',
    markAllRead: 'อ่านทั้งหมดแล้ว',
    markOneRead: 'ทำเครื่องหมาย {{title}} ว่าอ่านแล้ว',
    unreadStatus: 'มีการแจ้งเตือนที่ยังไม่ได้อ่าน {{count}} รายการ',
    last30Days: '30 วันที่ผ่านมา',
    empty: 'ยังไม่มีการแจ้งเตือนจริง',
    emptyBody:
      'ยังไม่ได้เชื่อมบริการจัดเก็บการแจ้งเตือน ระบบจะไม่สร้างเหตุการณ์ตัวอย่างแทนข้อมูลจริง',
    summary: 'สรุปการแจ้งเตือน',
    preferences: 'การตั้งค่าการแจ้งเตือน',
    manageSettings: 'จัดการการตั้งค่าทั้งหมด',
    preferencesBody: 'การตั้งค่านี้มีผลเฉพาะระหว่างการใช้งานรอบปัจจุบัน',
    startActivity: 'ดูกิจกรรม',
    openMessage: 'เปิดข้อความ',
    checkSettings: 'ตรวจสอบการตั้งค่า',
    filter: {
      all: 'ทั้งหมด',
      unread: 'ยังไม่ได้อ่าน',
      activity: 'กิจกรรม',
      system: 'ระบบ'
    },
    group: {
      today: 'วันนี้',
      yesterday: 'เมื่อวาน',
      earlier: 'ก่อนหน้านี้'
    },
    preference: {
      activityReminder: 'เตือนเมื่อนั่งต่อเนื่องนานเกินไป',
      progressSummary: 'สรุปความสม่ำเสมอ',
      systemUpdates: 'การแจ้งเตือนจากระบบ'
    },
    times: {
      today0900: '09:00',
      today0815: '08:15',
      today0740: '07:40',
      yesterday1830: 'เมื่อวาน 18:30',
      yesterday1020: 'เมื่อวาน 10:20',
      earlier: '25 ส.ค. 2569'
    },
    items: {
      planTitle: 'ข้อเสนอแนะในการปรับท่าทาง',
      planBody: 'คุณมีข้อเสนอแนะให้ปรับท่าทางเพื่อความสบาย',
      streakTitle: 'คุณใช้งานต่อเนื่องครบ 4 วัน',
      streakBody: 'ดูสรุปความสม่ำเสมอจากกิจกรรมที่คุณบันทึกไว้',
      assistantTitle: 'KineGuide AI มีข้อความใหม่',
      assistantBody: 'สรุปข้อมูลล่าสุดของคุณพร้อมให้ตรวจสอบแล้ว',
      savedTitle: 'บันทึกเซสชันเรียบร้อย',
      savedBody: 'ระบบบันทึกสรุปการตรวจท่าทางแล้ว',
      cameraTitle: 'ตรวจสอบสิทธิ์การใช้กล้อง',
      cameraBody: 'อนุญาตให้ใช้กล้องก่อนเริ่มตรวจท่าทาง',
      privacyTitle: 'อัปเดตการตั้งค่าความเป็นส่วนตัว',
      privacyBody: 'ระบบบันทึกการเปลี่ยนแปลงการตั้งค่าของคุณเรียบร้อยแล้ว'
    }
  },
  landing: {
    features: 'คุณสมบัติ',
    navigation: {
      label: 'ส่วนต่าง ๆ ของหน้าแรก',
      home: 'หน้าแรก',
      privacy: 'ความเป็นส่วนตัว',
      how: 'วิธีใช้งาน',
      capabilities: 'ความสามารถ'
    },
    eyebrow: 'Real-Time Posture Monitoring',
    title:
      'ปรับท่าทางการใช้งานหน้าจออย่างมั่นใจ ด้วยผู้ช่วยที่ให้ความสำคัญกับความเป็นส่วน⁠ตัวของคุณ',
    titleAccent: 'ความเป็นส่วน⁠ตัวของคุณ',
    titleRest:
      'ปรับท่าทางการใช้งานหน้าจออย่างมั่นใจ ด้วยผู้ช่วยที่ให้ความสำคัญกับ',
    subtitle:
      'ทดลองกล้องในอุปกรณ์ ติดตามท่าทางการนั่งและยืนแบบเรียลไทม์ และแจ้งเตือนเมื่อนั่งต่อเนื่องเป็นเวลานาน โดยไม่อัปโหลดรูปหรือวิดีโอของคุณ',
    start: 'เริ่มตรวจท่าทาง',
    learn: 'ดูวิธีการทำงาน',
    heroNote:
      'คุณจะเห็นคำอธิบายและเลือกความยินยอมก่อนระบบขอสิทธิ์ใช้กล้องหรือจัดเก็บข้อมูล',
    previewTitle: 'กล้องทำงานในอุปกรณ์',
    cameraPermissionNote:
      'กล้องจะเริ่มหลังจากคุณเลือกเริ่มใช้งานและให้สิทธิ์เท่านั้น',
    previewLocal: 'ภาพอยู่ในหน่วยความจำของเบราว์เซอร์',
    previewControl: 'หยุดกล้องเมื่อออกจากหน้า',
    highlightsTitle: 'ออกแบบให้ชัดเจน ตั้งแต่ก่อนเริ่มใช้งาน',
    highlightsBody:
      'รู้ว่ากล้องทำงานเมื่อใด ข้อมูลใดถูกจัดเก็บ และผลลัพธ์แต่ละส่วนหมายถึงอะไร',
    featureAction: 'ดูรายละเอียด {{feature}}',
    cameraTitle: 'กล้องทำงานในอุปกรณ์',
    cameraBody:
      'ภาพจากกล้องอยู่ในหน่วยความจำของเบราว์เซอร์และไม่ถูกส่งไปยังเซิร์ฟเวอร์',
    consentTitle: 'ควบคุมข้อมูลของคุณ',
    consentBody: 'อ่าน ให้ ถอน และตรวจสอบความยินยอมได้จากหน้าตั้งค่าของคุณ',
    progressTitle: 'ติดตามท่าทางแบบไม่กล่าวอ้างทางคลินิก',
    progressBody:
      'ดูเวลา จำนวนการแจ้งเตือน และระยะเวลาการนั่ง โดยไม่วินิจฉัยโรค',
    howEyebrow: 'เริ่มต้นอย่างโปร่งใส',
    howTitle: 'เริ่มต้นใช้งานได้ใน 3 ขั้นตอน',
    howBody:
      'ทุกขั้นบอกวัตถุประสงค์ ขอบเขต และข้อมูลที่เกี่ยวข้องก่อนให้คุณตัดสินใจ',
    accountStepTitle: 'สร้างบัญชีหรือเข้าสู่ระบบ',
    accountStepBody:
      'ใช้บัญชีของคุณเพื่อเข้าถึงพื้นที่ส่วนตัวและจัดการข้อมูลที่บันทึกไว้',
    consentStepTitle: 'อ่านและเลือกความยินยอม',
    consentStepBody:
      'ตรวจสอบการใช้กล้อง การจัดเก็บสรุปเซสชัน และ AI chat แยกตามวัตถุประสงค์',
    exploreStepTitle: 'เริ่มตรวจท่าทาง',
    exploreStepBody: 'เปิดใช้งานกล้องเพื่อติดตามท่าทางและการจัดสรรเวลาหน้าจอ',
    capabilitiesEyebrow: 'ขอบเขตของต้นแบบ',
    capabilitiesTitle: 'สิ่งที่คุณทำได้ใน KineGuide AI',
    capabilitiesBody:
      'เครื่องมือสำหรับตรวจสอบและแจ้งเตือนตามหลักสรีรศาสตร์ ไม่ใช่แผนการรักษาเฉพาะบุคคล',
    movementTitle: 'ติดตามท่าทางแบบเรียลไทม์',
    movementBody:
      'วิเคราะห์ท่านั่ง ท่ายืนผ่านกล้องในเบราว์เซอร์โดยไม่ประเมินโรค',
    aiTitle: 'พูดคุยกับผู้ช่วย AI ภายใต้ข้อจำกัด',
    aiBody:
      'ใช้เพื่อข้อมูลสนับสนุนทั่วไป คำตอบอาจไม่สมบูรณ์และไม่ใช้แทนคำแนะนำจากแพทย์',
    demoChoiceTitle: 'ติดตามประวัติศาสตร์การใช้งานหน้าจอ',
    demoChoiceBody: 'ดูระยะเวลาการใช้งาน การนั่ง การยืน และความถี่การหยุดพัก',
    summaryTitle: 'สรุปการใช้งานหน้าจอ',
    summaryBody: 'ดูสถิติเกี่ยวกับท่าทางการทำงานตามที่คุณยินยอมให้จัดเก็บ',
    privacyTitle: 'ข้อมูลของคุณ คุณเป็นผู้ควบคุม',
    privacyBody:
      'ระบบลดข้อมูลตั้งแต่ต้น แยกความยินยอมตามวัตถุประสงค์ และให้คุณกลับมาจัดการข้อมูลได้',
    localPrivacyTitle: 'ภาพกล้องไม่ออกจากอุปกรณ์',
    localPrivacyBody:
      'รูป วิดีโอ และเฟรมกล้องถูกประมวลผลชั่วคราวในเบราว์เซอร์และไม่ถูกอัปโหลด',
    consentPrivacyTitle: 'เลือกและถอนความยินยอมได้',
    consentPrivacyBody:
      'ฟีเจอร์ที่ต้องใช้ข้อมูลจะเริ่มหลังคุณยอมรับ และหยุดเมื่อถอนความยินยอม',
    storagePrivacyTitle: 'จัดเก็บเท่าที่จำเป็น',
    storagePrivacyBody:
      'บัญชีเก็บเฉพาะข้อมูลแบบมีโครงสร้างและสรุปกิจกรรมตามนโยบายที่แสดงในหน้าตั้งค่า',
    safetyTitle: 'ใช้งานอย่างปลอดภัย',
    safetyStop:
      'หยุดใช้งานทันทีหากรู้สึกเจ็บ ไม่มั่นคง หรือกังวล และติดต่อบุคลากรทางการแพทย์ที่มีคุณสมบัติเหมาะสม',
    safetyEmergency:
      'หากเป็นเหตุฉุกเฉิน ให้ติดต่อบริการฉุกเฉินในพื้นที่ ระบบนี้ไม่มีคำแนะนำฉุกเฉิน',
    finalTitle: 'พร้อมสำรวจระบบในขอบเขตที่ชัดเจน',
    finalBody:
      'เริ่มจากการสร้างบัญชี อ่านรายละเอียดความยินยอม แล้วเริ่มติดตามท่าทาง',
    finalAction: 'สร้างบัญชีเพื่อเริ่มต้น',
    footerNav: 'ข้อมูลส่วนท้ายเว็บไซต์',
    footerHow: 'ขั้นตอนการใช้งาน',
    footerCopyright: '© 2026 KineGuide AI. All rights reserved.',
    footerPrivacyNote: 'ความเป็นส่วนตัวของคุณ คือสิ่งสำคัญที่สุดของเรา',
    footer:
      'โครงการต้นแบบเพื่อการศึกษา ไม่ใช่อุปกรณ์การแพทย์และไม่มีการรับรองด้านกฎระเบียบ'
  },
  auth: {
    welcome: 'ยินดีต้อนรับ',
    subtitle: 'เข้าสู่ระบบเพื่อดำเนินการต่อ',
    signIn: 'เข้าสู่ระบบ',
    signOut: 'ออกจากระบบ',
    register: 'สมัครสมาชิก',
    noAccount: 'ยังไม่มีบัญชี?',
    hasAccount: 'มีบัญชีแล้ว?',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    displayName: 'ชื่อที่ใช้แสดง',
    passwordHint: 'อย่างน้อย 12 ตัวอักษร',
    invalid: 'ไม่สามารถเข้าสู่ระบบได้ โปรดตรวจสอบข้อมูล',
    createFailed: 'ไม่สามารถสร้างบัญชีได้',
    or: 'หรือ',
    google: 'เข้าสู่ระบบด้วย Google',
    facebook: 'เข้าสู่ระบบด้วย Facebook',
    socialLoading: 'กำลังเชื่อมต่อบัญชี {{provider}}',
    socialFailed: 'ไม่สามารถเข้าสู่ระบบด้วยบัญชีภายนอกได้ กรุณาลองอีกครั้ง',
    socialCancelled: 'ยกเลิกการเข้าสู่ระบบแล้ว',
    socialEmailRequired:
      'บัญชีนี้ไม่ได้ให้อีเมลที่จำเป็น กรุณาใช้วิธีเข้าสู่ระบบอื่น',
    linkRequired:
      'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านแล้วเชื่อมบัญชีจากหน้าตั้งค่า',
    callbackTitle: 'กำลังตรวจสอบการเข้าสู่ระบบ',
    backToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
    secure: 'Refresh token เก็บใน HttpOnly cookie และไม่ถูกอ่านโดย JavaScript'
  },
  consent: {
    title: 'การอนุญาตใช้กล้องและข้อมูล',
    intro: 'โปรดอ่านและเลือกด้วยตนเองก่อนที่เบราว์เซอร์จะขอสิทธิ์กล้อง',
    cameraTitle: 'ประมวลผลกล้องในอุปกรณ์',
    cameraBody:
      'ใช้ภาพชั่วคราวในเบราว์เซอร์เท่านั้น ไม่มีการอัปโหลดหรือบันทึกวิดีโอ',
    storageTitle: 'เก็บ session summary',
    storageBody:
      'เก็บสถิติระยะเวลาท่านั่งท่ายืนและการแจ้งเตือนเป็นเวลาไม่เกิน 365 วัน',
    researchTitle: 'อนุญาตใช้ข้อมูลแบบไม่ระบุตัวตนเพื่อการวิจัย (ทางเลือก)',
    required: 'ยอมรับการประมวลผลกล้องและการเก็บ session summary',
    aiChat: 'ยอมรับการใช้ AI chat และการเก็บประวัติ',
    aiChatBody:
      'ข้อความแชตอาจมีข้อมูลสุขภาพและจะเก็บจนกว่าคุณจะลบบทสนทนาหรือลบบัญชี',
    research: 'ยอมรับการใช้เพื่อการวิจัย',
    accept: 'ยอมรับและดำเนินการต่อ',
    privacy: 'คุณสามารถถอน consent และลบบัญชีได้เสมอ',
    failed: 'ไม่สามารถบันทึก consent ได้'
  },
  chat: {
    title: 'ผู้ช่วย KineGuide AI',
    subtitle:
      'พิมพ์สนทนาต่อเนื่องโดยใช้ประวัติในบัญชีนี้ ข้อความจะเก็บจนกว่าคุณจะลบบทสนทนาหรือลบบัญชี',
    boundary:
      'KineGuide AI ให้ข้อมูลเพื่อการศึกษาเท่านั้น ไม่วินิจฉัยโรค ไม่กำหนดการรักษา และไม่ใช้แทนแพทย์หรือนักกายภาพบำบัด',
    educationalFlow: 'ข้อมูลสาธิต',
    conversations: 'รายการบทสนทนา',
    conversation: 'บทสนทนา',
    new: 'เริ่มบทสนทนาใหม่',
    empty: 'ยังไม่มีบทสนทนา เริ่มห้องใหม่เมื่อคุณพร้อม',
    startPrompt: 'ลองถาม เช่น “ช่วยสรุปท่านั่งของฉันสัปดาห์นี้หน่อย”',
    messageLabel: 'ข้อความถึง KineGuide AI',
    placeholder: 'ลองพิมพ์: ฉันควรปรับท่านั่งอย่างไรให้ดีขึ้น',
    composerHint: 'กด Enter เพื่อส่ง หรือ Shift และ Enter เพื่อขึ้นบรรทัดใหม่',
    messageRequired: 'กรุณาพิมพ์ข้อความไม่เกิน 4,000 ตัวอักษร',
    send: 'ส่งข้อความ',
    responding: 'KineGuide AI กำลังตอบ…',
    sendFailed:
      'บริการ AI ไม่พร้อมใช้งานในขณะนี้ ข้อความยังไม่ถูกบันทึก กรุณาลองใหม่',
    consentRequired: 'ต้องอนุญาตการเก็บประวัติ AI chat ก่อนเริ่มสนทนา',
    manageConsent: 'จัดการ consent',
    delete: 'ลบบทสนทนา {{title}}',
    deleteTitle: 'ลบบทสนทนา',
    deleteConfirm: 'ลบบทสนทนานี้และข้อความทั้งหมดอย่างถาวรหรือไม่?',
    deleted: 'ลบบทสนทนาแล้ว',
    deleteFailed: 'ไม่สามารถลบบทสนทนาได้ กรุณาลองใหม่',
    you: 'คุณ: ',
    ai: 'KineGuide AI: '
  },
  dashboard: {
    updated: 'อัปเดตล่าสุด {{date}}',
    hello: 'สวัสดี {{name}}',
    ready: 'พร้อมสำหรับติดตามท่าทางวันนี้หรือยัง?',
    aiTitle: 'ผู้ช่วยสนทนา KineGuide AI',
    aiStructured: 'คำถามแบบมีโครงสร้าง',
    aiBody: 'วิเคราะห์และอธิบายสถิติการใช้งานหน้าจอของคุณ',
    aiBoundary: 'ผู้ช่วยนี้ไม่วินิจฉัย และไม่สร้างคำแนะนำทางการแพทย์',
    aiStart: 'เริ่มคุยกับ AI',
    recommended: 'แนะนำให้ติดตามท่าทางเมื่อนั่งหน้าจอนานๆ',
    today: 'การติดตามวันนี้',
    todayName: 'เซสชันติดตามท่าทาง',
    todayIllustrationAlt: 'ภาพประกอบเซสชันติดตามท่าทาง',
    exploreTitle: 'เริ่มติดตามท่าทาง',
    exploreBody:
      'เปิดกล้องเพื่อติดตามท่าทางการนั่งหรือยืนแบบเรียลไทม์ และรับการแจ้งเตือนให้หยุดพัก',
    viewDetails: 'ดูรายละเอียด',
    completed: 'เซสชันเสร็จสิ้น',
    start: 'เริ่มตรวจท่าทาง',
    sessions: 'session',
    streak: 'วันที่ต่อเนื่อง',
    time: 'เวลาติดตามรวม',
    activitySummary: 'สรุปการใช้งาน',
    recent: 'ประวัติล่าสุด',
    viewAll: 'ดูประวัติทั้งหมด',
    noRecent: 'ยังไม่มีเซสชันที่บันทึก',
    weekly: 'กิจกรรมรายสัปดาห์',
    range: 'ช่วงเวลาของกราฟ',
    rangeDays: '{{count}} วัน',
    chartSummary: 'เซสชัน {{count}} รายการในช่วง {{range}} วัน',
    manual: 'สถิติเหล่านี้เป็นข้อมูลการใช้งาน ไม่ใช่ผลการวินิจฉัย'
  },
  monitor: {
    title: 'เริ่มตรวจท่าทาง',
    setupTitle: 'ตั้งค่ากล้อง',
    setupSubtitle:
      'จัดตำแหน่งอุปกรณ์ในพื้นที่มั่นคงให้เห็นศีรษะ ไหล่ และลำตัวส่วนบนชัดเจน',
    start: 'เริ่ม Live Monitoring',
    continue: 'เริ่มเซสชันเชิงเทคนิค',
    readiness: 'ความพร้อมของระบบ',
    secure: 'ภาพประมวลผลบนอุปกรณ์ของคุณเท่านั้น',
    permission: 'สิทธิ์กล้อง',
    visibility: 'การตรวจจับจุดอ้างอิง',
    model: 'Pose model',
    modelPending: 'จะโหลดเมื่อเริ่มเซสชัน',
    notChecked: 'จะตรวจเมื่อเริ่มเซสชัน',
    granted: 'อนุญาตแล้ว',
    waiting: 'รออนุญาต',
    denied: 'ถูกปฏิเสธ',
    unsupported: 'เบราว์เซอร์ไม่รองรับ',
    instructions: 'เริ่มเซสชันเพื่อดูสถานะการตรวจจับจุดอ้างอิงเชิงเทคนิค',
    startSessionFailed: 'ไม่สามารถเริ่มเซสชันได้ โปรดลองอีกครั้ง'
  },
  calibration: {
    title: 'การปรับเทียบยังไม่พร้อมใช้งาน',
    subtitle: 'ต้นแบบนี้ยังไม่มี Baseline ที่ผ่านการตรวจสอบสำหรับประเมินท่าทาง',
    unavailableTitle: 'ยังไม่มี Baseline ที่ผ่านการตรวจสอบ',
    unavailableBody:
      'ระบบจะยังไม่บันทึกหรือเปรียบเทียบท่าทางจนกว่าจะมีขั้นตอนปรับเทียบและข้อมูลอ้างอิงที่ตรวจสอบได้',
    noBaselineClaim:
      'หน้านี้ไม่สร้างผลการปรับเทียบจำลอง และไม่ถือว่าท่าปัจจุบันเป็นค่ามาตรฐานของผู้ใช้',
    returnToSetup: 'กลับไปตั้งค่ากล้อง',
    researchTitle: 'ความพร้อมของวิธีวัดจากงานวิจัย',
    researchIntro:
      'ต้นแบบบันทึกวิธีจากงานวิจัยสำหรับการเคลื่อนไหวหัวไหล่จากมุมกล้องด้านหน้า แต่ยังไม่เปิดใช้การเปรียบเทียบกับผู้ใช้',
    researchLandmarks:
      'ใช้ MediaPipe {{count}} จุดอ้างอิงแบบสามมิติในแต่ละเฟรม',
    researchComparison:
      'เปรียบเทียบลำดับด้วย Cosine similarity และ Dynamic Time Warping',
    researchView: 'ขอบเขตที่บันทึกไว้ใช้มุมกล้องด้านหน้า',
    researchBlocked: 'ยังไม่มีลำดับอ้างอิงจากนักกายภาพที่อนุมัติ',
    researchBlockedBody:
      'ระบบจึงไม่เริ่มการเปรียบเทียบ ไม่สร้างคะแนน และไม่ตัดสินว่าการเคลื่อนไหวถูกหรือผิด',
    researchBoundary:
      'วิธีนี้เป็นเครื่องมือวัดเพื่อการวิจัย ไม่ใช่หลักฐานว่าการเคลื่อนไหวปลอดภัยหรือถูกต้องทางคลินิก และหน้านี้ไม่เปิดกล้องหรือเก็บข้อมูลจุดอ้างอิง',
    researchSource: 'เปิดบทความงานวิจัยต้นฉบับ'
  },
  session: {
    live: 'Live Posture Monitoring',
    technicalOnly: 'เซสชันเชิงเทคนิค ไม่ใช่การประเมินทางคลินิก',
    timer: 'ระยะเวลา',
    pause: 'พักการตรวจจับ',
    resume: 'ตรวจจับต่อ',
    finish: 'จบเซสชัน',
    stop: 'หยุด',
    poseTitle: 'ข้อมูลท่าทาง',
    poseIdle: 'ยังไม่ได้เปิดกล้อง',
    poseLoading: 'กำลังโหลดโมเดล...',
    poseReady: 'มองเห็นจุดอ้างอิงชัดเจน',
    poseAdjust: 'โปรดปรับกล้องให้เห็นจุดอ้างอิงที่จำเป็น',
    poseMissing: 'ไม่พบผู้ใช้งาน',
    poseMultiple: 'พบหลายคน โปรดอยู่คนเดียวในเฟรม',
    poseUnsupported: 'กิจกรรมนี้ยังไม่รองรับการตรวจจับจุดอ้างอิง',
    poseUnavailable: 'ไม่สามารถใช้การตรวจจับจุดอ้างอิงได้ในขณะนี้',
    poseError: 'การตรวจจับจุดอ้างอิงขัดข้อง',
    posePaused: 'หยุดการตรวจจับชั่วคราว',
    cameraRequesting: 'กำลังขอสิทธิ์ใช้งานกล้อง',
    cameraDenied: 'ไม่ได้รับสิทธิ์ใช้งานกล้อง',
    cameraUnsupported: 'เบราว์เซอร์นี้ไม่รองรับกล้อง',
    cameraError: 'ไม่สามารถเปิดกล้องได้',
    startCamera: 'เปิดกล้อง',
    startCameraBody:
      'กดเปิดกล้องเมื่อต้องการเริ่มประมวลผลจุดอ้างอิงบนอุปกรณ์นี้',
    poseVisualLabel: 'ภาพกล้องพร้อมโครงร่างจุดอ้างอิงเชิงเทคนิค',
    posePrivacy: 'เฟรมทำงานในอุปกรณ์ ไม่บันทึกหรือส่งไปเซิร์ฟเวอร์',
    summary: 'สรุปเซสชัน',
    completed: 'บันทึกเซสชัน',
    elapsed: 'เวลาติดตามทั้งหมด',
    summaryUnavailableTitle: 'ไม่มีผลวิเคราะห์ท่าทางสำหรับเซสชันนี้',
    summaryUnavailableBody:
      'ระบบบันทึกเฉพาะระยะเวลาของเซสชัน และยังไม่แสดงผลท่าทางจนกว่าจะมีวิธีวัดที่ตรวจสอบได้และผ่านการทบทวน',
    backHome: 'กลับหน้าหลัก',
    viewHistory: 'ดูสถิติ',
    saveFailed: 'บันทึกเซสชันไม่สำเร็จ',
    currentActivity: 'สถานะปัจจุบัน',
    technicalSession: 'เซสชันตรวจจับจุดอ้างอิง',
    technicalSessionBody:
      'ระบบตรวจเฉพาะการมองเห็นจุดอ้างอิง และยังไม่ประเมินความถูกต้องของท่าทาง',
    technicalStatus: 'สถานะการตรวจจับ',
    technicalStatusBody:
      'สถานะนี้สะท้อนคุณภาพการตรวจจับของกล้อง ไม่ใช่ผลว่าท่าทางดีหรือไม่ดี',
    baselineTitle: 'Baseline',
    baselineUnavailable: 'ยังไม่มี Baseline สำหรับเปรียบเทียบ',
    baselineUnavailableBody:
      'ระบบจะไม่สร้างคะแนนเปรียบเทียบจนกว่าจะมีขั้นตอนปรับเทียบและข้อมูลอ้างอิงที่ตรวจสอบได้',
    missingSessionTitle: 'ไม่พบเซสชันสำหรับเริ่มตรวจจับ',
    missingSessionBody: 'โปรดเริ่มเซสชันจากหน้าตั้งค่ากล้องก่อนเปิดหน้าตรวจจับ',
    returnToSetup: 'กลับไปตั้งค่ากล้อง',
    activitySitting: 'นั่ง',
    activityStanding: 'ยืน',
    activityTransitioning: 'กำลังเปลี่ยนท่า',
    activityUnknown: 'ไม่ระบุ',
    stateGood: 'อยู่ในเกณฑ์ดี',
    stateNeedsAdjust: 'ควรปรับท่าทาง',
    stateLowConfidence: 'ความมั่นใจต่ำ',
    stateUnable: 'ไม่สามารถประเมินได้',
    goodAlignmentDuration: 'ระยะเวลาท่าทางดี',
    needsAdjustmentDuration: 'ระยะเวลาควรปรับท่า',
    alertCount: 'จำนวนการแจ้งเตือน',
    breakCount: 'จำนวนการหยุดพัก',
    longestSitting: 'ช่วงเวลานั่งนานที่สุด',
    headAlignment: 'ศีรษะ: ปกติ',
    shoulderAlignment: 'ไหล่: สมดุล',
    torsoAlignment: 'ลำตัว: มั่นคง',
    baselineComparison: 'เปรียบเทียบจากค่า Baseline'
  },
  history: {
    title: 'ประวัติเซสชัน',
    subtitle: 'เฉพาะ session summary ที่คุณอนุญาตให้จัดเก็บ',
    search: 'ค้นหาประวัติ',
    empty: 'ยังไม่มีประวัติ',
    completed: 'เสร็จสิ้น',
    stopped: 'หยุดก่อนเสร็จ',
    pagination: 'หน้าประวัติ',
    previousPage: 'หน้าก่อนหน้า',
    nextPage: 'หน้าถัดไป',
    pageStatus: 'หน้า {{page}} จาก {{total}}'
  },
  progress: {
    title: 'สถิติท่าทาง',
    subtitle: 'แผนภูมินี้แสดงระยะเวลาและสัดส่วนท่าทางเท่านั้น ไม่วินิจฉัยโรค',
    sessions: 'จำนวนเซสชัน',
    time: 'เวลารวม',
    streak: 'ทำต่อเนื่อง',
    chart: 'สถิติล่าสุด'
  },
  profile: {
    title: 'โปรไฟล์',
    subtitle: 'จัดการการตั้งค่าของคุณ',
    loading: 'กำลังโหลด…',
    edit: 'แก้ไข',
    notifications: 'การแจ้งเตือน',
    name: 'ชื่อ',
    email: 'อีเมล',
    joined: 'สร้างบัญชีเมื่อ',
    accountProtected: 'บัญชีที่ลงชื่อเข้าใช้แล้ว',
    retention: 'เก็บข้อมูลถึง {{date}}',
    privacySettings: 'ตั้งค่าและความเป็นส่วนตัว'
  },
  settings: {
    title: 'ตั้งค่าและความเป็นส่วนตัว',
    language: 'ภาษาและการแสดงผล',
    languageBody:
      'เลือกภาษาที่ต้องการใช้ใน KineGuide AI การตั้งค่านี้ไม่เปลี่ยนข้อมูลหรือ consent ของคุณ',
    consent: 'จัดการ consent',
    revoke: 'ถอน consent',
    delete: 'ลบบัญชีและข้อมูลทั้งหมด',
    deleteConfirm:
      'ยืนยันว่าต้องการลบบัญชีและข้อมูลที่เกี่ยวข้องอย่างถาวรหรือไม่?',
    deleted: 'ลบบัญชีแล้ว',
    deleteFailed: 'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่',
    retention:
      'session summary และข้อมูลบัญชีที่เกี่ยวข้องตั้ง retention ไว้ 365 วัน และสามารถลบก่อนกำหนดด้วยการลบบัญชี',
    revokeDone: 'ถอน consent แล้ว',
    consentBody:
      'ตรวจสอบสถานะ consent ที่ใช้กับกล้อง การเก็บ session summary และ AI chat',
    consentActive: 'มี consent ที่ใช้งานอยู่ เวอร์ชัน {{version}}',
    noActiveConsent: 'ไม่มี consent ที่ใช้งานอยู่',
    revokeConfirm:
      'ถอน consent ที่ใช้งานอยู่หรือไม่? ฟังก์ชันที่ต้องใช้ consent จะหยุดจนกว่าคุณจะให้ consent ใหม่ ข้อมูลเดิมยังคงอยู่ตามนโยบาย retention และลบได้ด้วยการลบบัญชี',
    revokeConfirmAction: 'ยืนยันการถอน',
    revokeFailed: 'ไม่สามารถถอน consent ได้ กรุณาลองอีกครั้ง',
    connectedAccounts: 'บัญชีที่เชื่อมต่อ',
    connectedAccountsBody:
      'เชื่อม Google หรือ Facebook เพื่อใช้เป็นวิธีเข้าสู่ระบบ โดยระบบไม่เก็บ token ของผู้ให้บริการ',
    connect: 'เชื่อม {{provider}}',
    disconnect: 'ยกเลิกการเชื่อม {{provider}}',
    connected: 'เชื่อมแล้ว',
    connectDone: 'เชื่อมบัญชี {{provider}} แล้ว',
    disconnectDone: 'ยกเลิกการเชื่อมบัญชีแล้ว',
    identityFailed: 'ไม่สามารถเปลี่ยนบัญชีที่เชื่อมต่อได้',
    lastLoginMethod: 'ต้องมีวิธีเข้าสู่ระบบอื่นก่อนยกเลิกการเชื่อมบัญชีนี้',
    cameraPrefs: 'การตั้งค่ากล้อง',
    breakPrefs: 'การแจ้งเตือนหยุดพัก'
  },
  help: {
    title: 'ช่วยเหลือ',
    camera:
      'หากกล้องไม่ทำงาน ให้ตรวจสิทธิ์ของเว็บไซต์ ปิดแอปอื่นที่ใช้กล้อง แล้วลองอีกครั้ง',
    safety:
      'หากรู้สึกเจ็บ ไม่มั่นคง หรือกังวล ให้หยุดทันที ระบบนี้ไม่ให้คำแนะนำฉุกเฉิน',
    contact: 'สำหรับเหตุฉุกเฉิน ให้ติดต่อบริการฉุกเฉินในพื้นที่ของคุณ'
  },
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

const en: typeof th = {
  common: {
    language: 'ไทย',
    languageSelector: 'Choose language',
    languageThai: 'ไทย',
    languageEnglish: 'English',
    loading: 'Loading…',
    error: 'Something went wrong. Please try again.',
    retry: 'Try again',
    systemLoadingTitle: 'Preparing KineGuide AI',
    systemLoadingBody: 'Loading your data and preparing your workspace',
    loadingProgress: 'System preparation progress',
    loadingConnect: 'Connect data',
    loadingPrepare: 'Prepare posture monitoring',
    loadingReady: 'Ready to use',
    loadingWait: 'Please wait. The system will be ready shortly.',
    dataErrorTitle: 'Unable to load data',
    dataErrorBody:
      'Something went wrong while preparing your data.\nCheck your connection and try again.',
    skip: 'Skip to main content',
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    brandSubtitle: 'Posture Monitoring',
    onDevice: 'On-device',
    active: 'Active',
    inactive: 'Inactive',
    yes: 'Yes',
    no: 'No',
    privacy: 'Privacy',
    retention: 'Retention',
    safety: 'Safety',
    emergency: 'Emergency',
    noDiagnosis:
      'This support and educational tool does not diagnose or replace a healthcare professional.',
    pendingReview:
      'This demo is pending professional review, so it does not provide clinical guidance or correctness scores.'
  },
  pwa: {
    updateTitle: 'A new KineGuide AI version is available',
    updateBody:
      'Update to load the latest menus and screens. Your signed-in session will remain available.',
    updateNow: 'Update now',
    updating: 'Updating…',
    updateFailed: 'The update failed. Please try again.',
    retryUpdate: 'Try the update again',
    offlineTitle: 'Ready for offline use',
    offlineBody: 'Required application files are now available on this device.',
    dismiss: 'Dismiss message'
  },
  nav: {
    public: 'Website navigation',
    main: 'Main navigation',
    menu: 'Open menu',
    closeMenu: 'Close menu',
    home: 'Home',
    chat: 'AI assistant',
    monitor: 'Monitor Posture',
    history: 'History',
    analytics: 'Analytics',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    getStarted: 'Get started'
  },
  account: {
    menu: 'Account menu',
    menuWithUnread: 'Account menu, {{count}} unread notifications',
    notificationMenuLabel: 'Notifications, {{count}} unread',
    account: 'Account',
    system: 'System',
    settingsPrivacy: 'Settings and privacy',
    logoutTitle: 'Sign out',
    logoutConfirm: 'Do you want to sign out?'
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Keep track of your notifications and important activity',
    filters: 'Notification filters',
    list: 'Notification list',
    markAllRead: 'Mark all as read',
    markOneRead: 'Mark {{title}} as read',
    unreadStatus: '{{count}} unread notifications',
    last30Days: 'Past 30 days',
    empty: 'No real notifications yet',
    emptyBody:
      'Notification storage is not connected. The system will not invent sample events in place of real data.',
    summary: 'Notification summary',
    preferences: 'Notification preferences',
    manageSettings: 'Manage all settings',
    preferencesBody: 'These preferences apply only to the current app session.',
    startActivity: 'View activity',
    openMessage: 'Open message',
    checkSettings: 'Check settings',
    filter: {
      all: 'All',
      unread: 'Unread',
      activity: 'Activity',
      system: 'System'
    },
    group: {
      today: 'Today',
      yesterday: 'Yesterday',
      earlier: 'Earlier'
    },
    preference: {
      activityReminder: 'Prolonged sitting reminder',
      progressSummary: 'Consistency summary',
      systemUpdates: 'System notifications'
    },
    times: {
      today0900: '09:00',
      today0815: '08:15',
      today0740: '07:40',
      yesterday1830: 'Yesterday 18:30',
      yesterday1020: 'Yesterday 10:20',
      earlier: '25 Aug 2026'
    },
    items: {
      planTitle: 'Posture adjustment suggestion',
      planBody:
        'You have a suggestion to adjust your posture for better comfort.',
      streakTitle: 'You have used the system 4 days in a row',
      streakBody: 'Review consistency based on the activity you recorded.',
      assistantTitle: 'KineGuide AI has a new message',
      assistantBody: 'Your latest information summary is ready to review.',
      savedTitle: 'Session recorded',
      savedBody: 'Your posture monitoring session summary was saved.',
      cameraTitle: 'Check camera permission',
      cameraBody: 'Allow camera access before starting monitoring.',
      privacyTitle: 'Privacy settings updated',
      privacyBody: 'Your settings change has been recorded.'
    }
  },
  landing: {
    features: 'Features',
    navigation: {
      label: 'Landing page sections',
      home: 'Home',
      privacy: 'Privacy',
      how: 'How it works',
      capabilities: 'Capabilities'
    },
    eyebrow: 'Real-Time Posture Monitoring',
    title: 'Monitor your posture confidently with privacy-first support',
    titleAccent: 'privacy-first support',
    titleRest: 'Monitor your posture confidently with',
    subtitle:
      'Try an on-device camera flow, track real-time sitting and standing posture, and get break reminders without uploading photos or video.',
    start: 'Start Monitoring',
    learn: 'How it works',
    heroNote:
      'You will see an explanation and choose consent before the system requests camera access or stores data.',
    previewTitle: 'On-device camera',
    cameraPermissionNote:
      'The camera starts only after you choose to begin and grant permission.',
    previewLocal: 'Frames stay in browser memory',
    previewControl: 'The camera stops when you leave',
    highlightsTitle: 'Clarity before you begin',
    highlightsBody:
      'Know when the camera runs, what data is stored, and what each result means.',
    featureAction: 'View details for {{feature}}',
    cameraTitle: 'On-device camera',
    cameraBody:
      'Camera frames stay in browser memory and are never sent to the server.',
    consentTitle: 'Control your data',
    consentBody: 'Read, give, withdraw, and review consent from your settings.',
    progressTitle: 'Non-clinical posture tracking',
    progressBody:
      'Review duration, break counts, and posture stats without medical diagnosis.',
    howEyebrow: 'A transparent start',
    howTitle: 'Get started in 3 steps',
    howBody:
      'Each step explains its purpose, boundaries, and related data before you decide.',
    accountStepTitle: 'Create an account or sign in',
    accountStepBody:
      'Use your account to enter a private workspace and manage the information you save.',
    consentStepTitle: 'Read and choose consent',
    consentStepBody:
      'Review camera use, session-summary storage, and AI chat as separate purposes.',
    exploreStepTitle: 'Start monitoring',
    exploreStepBody:
      'Activate your camera to track your posture and screen time.',
    capabilitiesEyebrow: 'Prototype boundaries',
    capabilitiesTitle: 'What you can do in KineGuide AI',
    capabilitiesBody:
      'Tools for ergonomic awareness and monitoring—not a personalized treatment plan.',
    movementTitle: 'Real-time posture monitoring',
    movementBody:
      'Analyze sitting and standing posture via the browser camera without medical assessment.',
    aiTitle: 'Talk with a bounded AI assistant',
    aiBody:
      'Use it for general support information. Answers may be incomplete and do not replace qualified advice.',
    demoChoiceTitle: 'Track your screen time history',
    demoChoiceBody:
      'View total monitoring time, sitting vs standing duration, and break frequency.',
    summaryTitle: 'Review monitoring sessions',
    summaryBody:
      'See stats about your working posture history based on your consent.',
    privacyTitle: 'Your data stays under your control',
    privacyBody:
      'The system minimizes data from the start, separates consent by purpose, and lets you return to manage saved information.',
    localPrivacyTitle: 'Camera images stay on your device',
    localPrivacyBody:
      'Photos, video, and camera frames are processed temporarily in the browser and are not uploaded.',
    consentPrivacyTitle: 'Choose and withdraw consent',
    consentPrivacyBody:
      'Data-dependent features start after you consent and stop when consent is withdrawn.',
    storagePrivacyTitle: 'Store only what is necessary',
    storagePrivacyBody:
      'Your account stores only structured information and activity summaries under the policy shown in settings.',
    safetyTitle: 'Use the system safely',
    safetyStop:
      'Stop immediately if you feel pain, unstable, or concerned, and contact a qualified healthcare professional.',
    safetyEmergency:
      'For an emergency, contact your local emergency service. This system does not provide emergency guidance.',
    finalTitle: 'Ready to explore with clear boundaries?',
    finalBody:
      'Create an account, review consent details, and start monitoring your posture.',
    finalAction: 'Create an account to begin',
    footerNav: 'Website footer information',
    footerHow: 'Getting started',
    footerCopyright: '© 2026 KineGuide AI. All rights reserved.',
    footerPrivacyNote: 'Your privacy is our highest priority',
    footer:
      'Educational prototype only. It is not a medical device and has no regulatory certification.'
  },
  auth: {
    welcome: 'Welcome',
    subtitle: 'Sign in to continue',
    signIn: 'Sign in',
    signOut: 'Sign out',
    register: 'Create account',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    email: 'Email',
    password: 'Password',
    displayName: 'Display name',
    passwordHint: 'At least 12 characters',
    invalid: 'Unable to sign in. Check your information.',
    createFailed: 'Unable to create the account.',
    or: 'OR',
    google: 'Sign in with Google',
    facebook: 'Sign in with Facebook',
    socialLoading: 'Connecting {{provider}} account',
    socialFailed: 'Unable to sign in with the external account. Try again.',
    socialCancelled: 'Social sign-in was cancelled.',
    socialEmailRequired:
      'This account did not provide the required email. Use another sign-in method.',
    linkRequired:
      'An account already uses this email. Sign in with your password and connect the account from settings.',
    callbackTitle: 'Checking your sign-in',
    backToLogin: 'Back to sign in',
    secure:
      'The refresh token is stored in an HttpOnly cookie and cannot be read by JavaScript.'
  },
  consent: {
    title: 'Camera and data consent',
    intro: 'Read and choose before the browser asks for camera access.',
    cameraTitle: 'On-device camera processing',
    cameraBody:
      'Frames are temporary in the browser and no video is uploaded or recorded.',
    storageTitle: 'Store session summaries',
    storageBody:
      'Store duration, alerts, and sitting/standing states for up to 365 days.',
    researchTitle: 'Allow de-identified research use (optional)',
    required: 'Allow camera processing and session-summary storage',
    aiChat: 'Allow AI chat and conversation-history storage',
    aiChatBody:
      'Chat may contain health information and remains stored until you delete the conversation or your account.',
    research: 'Allow research use',
    accept: 'Accept and continue',
    privacy: 'You may withdraw consent and delete your account at any time.',
    failed: 'Unable to save consent.'
  },
  chat: {
    title: 'KineGuide AI assistant',
    subtitle:
      'Continue a typed conversation using history from this account. Messages remain stored until you delete the conversation or your account.',
    boundary:
      'KineGuide AI provides educational information only. It does not diagnose, prescribe treatment, or replace a physician or physiotherapist.',
    educationalFlow: 'Demo data',
    conversations: 'Conversation list',
    conversation: 'Conversation',
    new: 'Start a new conversation',
    empty: 'No conversations yet. Start one when you are ready.',
    startPrompt: 'Try asking, “Can you summarize my sitting time this week?”',
    messageLabel: 'Message to KineGuide AI',
    placeholder: 'Try: How can I improve my sitting posture?',
    composerHint: 'Press Enter to send, or Shift and Enter for a new line.',
    messageRequired: 'Enter a message of no more than 4,000 characters.',
    send: 'Send message',
    responding: 'KineGuide AI is responding…',
    sendFailed:
      'AI is currently unavailable. Your message was not stored. Please try again.',
    consentRequired:
      'Allow AI-chat history storage before starting a conversation.',
    manageConsent: 'Manage consent',
    delete: 'Delete conversation {{title}}',
    deleteTitle: 'Delete conversation',
    deleteConfirm: 'Permanently delete this conversation and all messages?',
    deleted: 'Conversation deleted',
    deleteFailed: 'Unable to delete the conversation. Please try again.',
    you: 'You: ',
    ai: 'KineGuide AI: '
  },
  dashboard: {
    updated: 'Last updated {{date}}',
    hello: 'Hello {{name}}',
    ready: 'Ready to monitor your posture today?',
    aiTitle: 'KineGuide AI conversation assistant',
    aiStructured: 'Structured questions',
    aiBody: 'Analyze and understand your screen time and posture statistics.',
    aiBoundary:
      'This assistant does not diagnose or generate medical treatment guidance.',
    aiStart: 'Start AI chat',
    recommended: 'Recommended when sitting for long periods',
    today: 'Today’s monitoring',
    todayName: 'Posture Monitoring Session',
    todayIllustrationAlt: 'Posture monitoring session illustration',
    exploreTitle: 'Start Monitoring',
    exploreBody:
      'Turn on your camera to track your sitting and standing posture in real-time, and get reminders to take breaks.',
    viewDetails: 'View details',
    completed: 'Completed sessions',
    start: 'Start Monitoring',
    sessions: 'sessions',
    streak: 'day streak',
    time: 'total time',
    activitySummary: 'Usage summary',
    recent: 'Recent history',
    viewAll: 'View all history',
    noRecent: 'No recorded sessions yet',
    weekly: 'Weekly activity',
    range: 'Chart range',
    rangeDays: '{{count}} days',
    chartSummary: '{{count}} recorded sessions in the past {{range}} days',
    manual: 'These stats are usage data, not medical outcomes.'
  },
  monitor: {
    title: 'Start Monitoring',
    setupTitle: 'Camera Setup',
    setupSubtitle:
      'Place your device securely so your head, shoulders, and upper torso are visible.',
    start: 'Start Live Monitoring',
    continue: 'Start technical session',
    readiness: 'System readiness',
    secure: 'Camera data stays on-device',
    permission: 'Camera permission',
    visibility: 'Landmark detection',
    model: 'Pose model',
    modelPending: 'Loads after the session starts',
    notChecked: 'Checked after the session starts',
    granted: 'Granted',
    waiting: 'Waiting',
    denied: 'Denied',
    unsupported: 'Browser unsupported',
    instructions:
      'Start a session to view technical landmark-detection status.',
    startSessionFailed: 'The session could not be started. Please try again.'
  },
  calibration: {
    title: 'Calibration is not available yet',
    subtitle:
      'This prototype does not yet have a validated baseline for posture assessment.',
    unavailableTitle: 'No validated baseline is available',
    unavailableBody:
      'The system will not capture or compare posture until a verifiable calibration process and approved reference data are available.',
    noBaselineClaim:
      'This page does not simulate calibration or treat the current pose as the user’s baseline.',
    returnToSetup: 'Return to camera setup',
    researchTitle: 'Research measurement readiness',
    researchIntro:
      'The prototype records the cited method for front-view shoulder movement, but comparison is not enabled for users.',
    researchLandmarks:
      'Use {{count}} three-dimensional MediaPipe landmarks in each frame',
    researchComparison:
      'Compare sequences with cosine similarity and Dynamic Time Warping',
    researchView: 'The documented study scope uses a front camera view',
    researchBlocked: 'No approved physiotherapist reference sequence exists',
    researchBlockedBody:
      'The system therefore does not start comparison, produce a score, or label movement as correct or incorrect.',
    researchBoundary:
      'This is a research measurement method, not proof that movement is safe or clinically correct. This page does not start the camera or retain landmark data.',
    researchSource: 'Open the original research article'
  },
  session: {
    live: 'Live Posture Monitoring',
    technicalOnly: 'Technical session, not a clinical assessment',
    timer: 'Duration',
    pause: 'Pause',
    resume: 'Resume',
    finish: 'Finish Session',
    stop: 'Stop',
    poseTitle: 'Posture Data',
    poseIdle: 'Camera is not started',
    poseLoading: 'Loading model...',
    poseReady: 'Landmarks clearly visible',
    poseAdjust: 'Adjust the camera so the required landmarks are visible',
    poseMissing: 'No user detected',
    poseMultiple: 'Multiple people detected. Please be alone in frame.',
    poseUnsupported:
      'Landmark detection is not supported for this activity yet',
    poseUnavailable: 'Landmark detection is currently unavailable',
    poseError: 'Landmark detection failed',
    posePaused: 'Landmark detection is paused',
    cameraRequesting: 'Requesting camera permission',
    cameraDenied: 'Camera permission was not granted',
    cameraUnsupported: 'This browser does not support camera access',
    cameraError: 'The camera could not be started',
    startCamera: 'Start camera',
    startCameraBody:
      'Start the camera when you are ready to process technical landmarks on this device.',
    poseVisualLabel: 'Camera view with a technical landmark overlay',
    posePrivacy: 'Frames process on-device. No data is sent to the server.',
    summary: 'Session Summary',
    completed: 'Session saved',
    elapsed: 'Total duration',
    summaryUnavailableTitle:
      'No posture analysis is available for this session',
    summaryUnavailableBody:
      'Only the session duration was recorded. Posture results remain unavailable until a verifiable, reviewed measurement method exists.',
    backHome: 'Back to Dashboard',
    viewHistory: 'View Analytics',
    saveFailed: 'Failed to save session',
    currentActivity: 'Current Activity',
    technicalSession: 'Technical landmark session',
    technicalSessionBody:
      'The system checks landmark visibility only and does not assess whether posture is correct.',
    technicalStatus: 'Detection status',
    technicalStatusBody:
      'This status describes camera detection quality, not whether posture is good or bad.',
    baselineTitle: 'Baseline',
    baselineUnavailable: 'No baseline is available for comparison',
    baselineUnavailableBody:
      'The system will not generate comparison scores until a verifiable calibration process and approved reference data are available.',
    missingSessionTitle: 'No session is available to start detection',
    missingSessionBody:
      'Start a session from camera setup before opening live detection.',
    returnToSetup: 'Return to camera setup',
    activitySitting: 'Sitting',
    activityStanding: 'Standing',
    activityTransitioning: 'Transitioning',
    activityUnknown: 'Unknown',
    stateGood: 'Good Alignment',
    stateNeedsAdjust: 'Needs Adjustment',
    stateLowConfidence: 'Low Confidence',
    stateUnable: 'Unable to Assess',
    goodAlignmentDuration: 'Good Alignment Time',
    needsAdjustmentDuration: 'Needs Adjustment Time',
    alertCount: 'Alert Count',
    breakCount: 'Break Count',
    longestSitting: 'Longest Sitting Period',
    headAlignment: 'Head: Normal',
    shoulderAlignment: 'Shoulders: Balanced',
    torsoAlignment: 'Torso: Stable',
    baselineComparison: 'Comparison vs Baseline'
  },
  history: {
    title: 'Session history',
    subtitle: 'Only session summaries you consented to store',
    search: 'Search history',
    empty: 'No history yet',
    completed: 'Completed',
    stopped: 'Stopped early',
    pagination: 'History pagination',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    pageStatus: 'Page {{page}} of {{total}}'
  },
  progress: {
    title: 'Posture Analytics',
    subtitle: 'This chart shows time and posture ratios only, not a diagnosis.',
    sessions: 'Total sessions',
    time: 'Total time',
    streak: 'Streak',
    chart: 'Recent stats'
  },
  profile: {
    title: 'Profile',
    subtitle: 'Manage your settings',
    loading: 'Loading…',
    edit: 'Edit',
    notifications: 'Notifications',
    name: 'Display name',
    email: 'Email',
    joined: 'Joined',
    accountProtected: 'Signed-in account',
    retention: 'Stored until {{date}}',
    privacySettings: 'Settings and privacy'
  },
  settings: {
    title: 'Settings and privacy',
    language: 'Language and display',
    languageBody:
      'Choose the language used in KineGuide AI. This setting does not change your data or consent.',
    consent: 'Manage consent',
    revoke: 'Withdraw consent',
    delete: 'Delete account and all data',
    deleteConfirm: 'Permanently delete the account and all associated data?',
    deleted: 'Account deleted',
    deleteFailed: 'Unable to delete the account. Please try again.',
    retention:
      'Session summaries and related account records have a 365-day retention target and can be removed earlier by deleting the account.',
    revokeDone: 'Consent withdrawn',
    consentBody:
      'Review the consent used for camera processing, session-summary storage, and AI chat.',
    consentActive: 'Active consent version {{version}}',
    noActiveConsent: 'No active consent',
    revokeConfirm:
      'Withdraw the active consent? Features that require consent will stop until you consent again. Existing data remains subject to the retention policy and can be removed by deleting the account.',
    revokeConfirmAction: 'Confirm withdrawal',
    revokeFailed: 'Unable to withdraw consent. Please try again.',
    connectedAccounts: 'Connected accounts',
    connectedAccountsBody:
      'Connect Google or Facebook as a sign-in method. Provider tokens are not stored.',
    connect: 'Connect {{provider}}',
    disconnect: 'Disconnect {{provider}}',
    connected: 'Connected',
    connectDone: '{{provider}} account connected',
    disconnectDone: 'Account disconnected',
    identityFailed: 'Unable to change the connected account.',
    lastLoginMethod:
      'Add another sign-in method before disconnecting this account.',
    cameraPrefs: 'Camera Preferences',
    breakPrefs: 'Break Reminders'
  },
  help: {
    title: 'Help',
    camera:
      'If the camera fails, check site permission, close other camera apps, and retry.',
    safety:
      'Stop immediately if you feel pain, unstable, or concerned. This system does not provide emergency guidance.',
    contact: 'For emergencies, contact your local emergency service.'
  },
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

void i18n
  .use(initReactI18next)
  .init({
    resources: { th: { translation: th }, en: { translation: en } },
    lng: getLanguagePreference() ?? 'th',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })
  .then(() => {
    document.documentElement.lang = i18n.resolvedLanguage === 'en' ? 'en' : 'th'
  })

export default i18n
