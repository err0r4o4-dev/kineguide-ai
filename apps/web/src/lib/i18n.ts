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
    loadingPrepare: 'เตรียมแผนกิจกรรม',
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
    brandSubtitle: 'ผู้ช่วยกายภาพบำบัด',
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
    clinicalDemo: 'Clinical Flow สาธิต',
    plan: 'แผนกิจกรรม',
    camera: 'ฝึกด้วยกล้อง',
    exercises: 'ท่าฝึกสาธิต',
    history: 'ประวัติ',
    progress: 'บันทึกและความก้าวหน้า',
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
      activityReminder: 'เตือนกิจกรรมประจำวัน',
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
      planTitle: 'ถึงเวลากิจกรรมที่วางแผนไว้วันนี้',
      planBody: 'คุณมีกิจกรรมสาธิตที่บันทึกไว้ในแผนวันนี้',
      streakTitle: 'คุณบันทึกกิจกรรมต่อเนื่องครบ 4 วัน',
      streakBody: 'ดูสรุปความสม่ำเสมอจากกิจกรรมที่คุณบันทึกไว้',
      assistantTitle: 'KineGuide AI มีข้อความใหม่',
      assistantBody: 'สรุปข้อมูลล่าสุดของคุณพร้อมให้ตรวจสอบแล้ว',
      savedTitle: 'บันทึกกิจกรรมเรียบร้อย',
      savedBody: 'ระบบบันทึกสรุปกิจกรรมที่คุณกรอกด้วยตนเองแล้ว',
      cameraTitle: 'ตรวจสอบสิทธิ์การใช้กล้อง',
      cameraBody: 'อนุญาตให้ใช้กล้องก่อนเริ่มกิจกรรมด้วยกล้อง',
      privacyTitle: 'อัปเดตการตั้งค่าความเป็นส่วนตัว',
      privacyBody: 'ระบบบันทึกการเปลี่ยนแปลงการตั้งค่าของคุณเรียบร้อยแล้ว'
    }
  },
  landing: {
    features: 'คุณสมบัติ',
    eyebrow: 'KineGuide AI · Physiotherapy support prototype',
    title:
      'สำรวจการเคลื่อนไหวอย่างมั่นใจ ด้วยผู้ช่วยที่ให้ความสำคัญกับความเป็นส่วน\u2060ตัวของคุณ',
    subtitle:
      'ทดลองกล้องในอุปกรณ์ บันทึกกิจกรรมแบบย่อ และติดตามความสม่ำเสมอ โดยไม่อัปโหลดรูปหรือวิดีโอของคุณ',
    start: 'เริ่มใช้งาน',
    learn: 'ดูวิธีการทำงาน',
    cameraTitle: 'กล้องทำงานในอุปกรณ์',
    cameraBody:
      'ภาพจากกล้องอยู่ในหน่วยความจำของเบราว์เซอร์และไม่ถูกส่งไปยังเซิร์ฟเวอร์',
    consentTitle: 'ควบคุมข้อมูลของคุณ',
    consentBody: 'ให้ ถอน และตรวจสอบ consent ได้จากหน้าตั้งค่า',
    progressTitle: 'ติดตามกิจกรรมแบบไม่กล่าวอ้างทางคลินิก',
    progressBody: 'ดูเวลาและจำนวน session ที่คุณบันทึกด้วยตนเอง',
    privacyTitle: 'ปลอดภัยและเป็นส่วนตัว',
    privacyBody: 'จัดเก็บเฉพาะคำตอบแบบมีโครงสร้างและ session summary ที่จำเป็น',
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
    title: 'การอนุญาตใช้กล้องและข้อมูลการฝึก',
    intro: 'โปรดอ่านและเลือกด้วยตนเองก่อนที่เบราว์เซอร์จะขอสิทธิ์กล้อง',
    cameraTitle: 'ประมวลผลกล้องในอุปกรณ์',
    cameraBody:
      'ใช้ภาพชั่วคราวในเบราว์เซอร์เท่านั้น ไม่มีการอัปโหลดหรือบันทึกวิดีโอ',
    storageTitle: 'เก็บ session summary',
    storageBody:
      'เก็บชื่อการสาธิต เวลา และจำนวนครั้งที่คุณกดบันทึกเองเป็นเวลาไม่เกิน 365 วัน',
    researchTitle: 'อนุญาตใช้ข้อมูลแบบไม่ระบุตัวตนเพื่อการวิจัย (ทางเลือก)',
    required: 'ยอมรับการประมวลผลกล้องและการเก็บ session summary',
    aiChat: 'ยอมรับการใช้ AI chat และการเก็บประวัติ',
    aiChatBody:
      'ข้อความแชตอาจมีข้อมูลสุขภาพและจะเก็บจนกว่าคุณจะลบบทสนทนาหรือลบบัญชี',
    research: 'ยอมรับการใช้เพื่อการวิจัย',
    accept: 'ยอมรับและดำเนินการต่อ',
    privacy:
      'ข้อมูลอาการเป็นข้อมูลละเอียดอ่อน คุณสามารถถอน consent และลบบัญชีได้เสมอ',
    failed: 'ไม่สามารถบันทึก consent ได้'
  },
  healthProfile: {
    title: 'ตั้งค่าโปรไฟล์สุขภาพ',
    subtitle:
      'กรอกข้อมูลเพื่อจัดเก็บให้คุณทบทวนและแก้ไข ข้อมูลนี้ไม่ใช้วินิจฉัย เลือกการรักษา หรือปรับแผนกิจกรรมอัตโนมัติ',
    progress: 'ขั้นตอนการตั้งค่าโปรไฟล์สุขภาพ',
    optional: 'ไม่บังคับ — สามารถเลือกไม่ระบุได้',
    select: 'เลือกคำตอบ',
    reviewData: 'ตรวจสอบข้อมูล',
    saveProfile: 'บันทึกโปรไฟล์',
    saveFailed: 'ไม่สามารถบันทึกโปรไฟล์สุขภาพได้ กรุณาลองอีกครั้ง',
    privateFooter:
      'ข้อมูลสุขภาพจะใช้ตามความยินยอมของคุณ เก็บไม่เกิน 365 วัน และคุณสามารถแก้ไขหรือลบได้',
    steps: {
      basics: 'ข้อมูลพื้นฐาน',
      safety: 'สุขภาพและความปลอดภัย',
      goals: 'เป้าหมาย',
      review: 'ตรวจสอบ'
    },
    basics: {
      title: 'ข้อมูลพื้นฐาน',
      body: 'ข้อมูลที่คุณกรอกเองสำหรับแสดงผลและทบทวนในบัญชีนี้',
      birthDate: 'วัน เดือน ปีเกิด',
      sex: 'เพศกำเนิด',
      height: 'ส่วนสูง',
      weight: 'น้ำหนักปัจจุบัน',
      trackWeight: 'บันทึกน้ำหนักนี้ไว้ในโปรไฟล์',
      trackWeightBody: 'ระบบยังไม่สร้างประวัติน้ำหนักหรือแปลผลแนวโน้ม',
      preview: 'ตัวอย่างข้อมูลที่คำนวณ',
      age: 'อายุ',
      previewNotice:
        'ค่าที่แสดงเป็นการคำนวณทั่วไป ไม่ใช่การวินิจฉัยหรือคำแนะนำทางการแพทย์'
    },
    safety: {
      title: 'สุขภาพและความปลอดภัย',
      body: 'บันทึกคำตอบที่คุณรายงานเอง ระบบไม่ประเมินความเหมาะสมในการทำกิจกรรม',
      careAreas: 'บริเวณที่ต้องการดูแล (เลือกได้หลายข้อ)',
      recentInjury: 'มีการบาดเจ็บหรือผ่าตัดในช่วง 6 เดือนที่ผ่านมา',
      clinicianManaged: 'เคยให้ผู้เชี่ยวชาญดูแลเรื่องการเคลื่อนไหวนี้หรือไม่',
      assistiveDevice: 'ใช้อุปกรณ์ช่วยเดินหรือไม่',
      warningTitle: 'ข้อมูลอาการปัจจุบัน',
      warningBody: 'เลือกคำตอบที่ตรงกับคุณในขณะนี้',
      notEvaluated:
        'ระบบบันทึกคำตอบเท่านั้นและไม่ตัดสินว่าคุณพร้อมทำกิจกรรมหรือไม่ หากกังวลเรื่องอาการ โปรดติดต่อบุคลากรทางการแพทย์'
    },
    goals: {
      title: 'เป้าหมายและรูปแบบการใช้งาน',
      body: 'เลือกข้อมูลที่ตรงกับคุณ ข้อมูลนี้ยังไม่ถูกนำไปสร้างแผนเฉพาะบุคคล',
      yourGoals: 'เป้าหมายของคุณ',
      activityLevel: 'ระดับกิจกรรมปัจจุบัน',
      preferredTime: 'เวลาที่สะดวก',
      equipment: 'อุปกรณ์ที่มี',
      camera: 'การใช้งานกล้อง',
      notes: 'สิ่งที่ต้องการให้ระบบบันทึกไว้',
      notesPlaceholder:
        'เช่น ข้อจำกัดด้านเวลา การเข้าถึง หรือข้อมูลที่ต้องการจำไว้'
    },
    review: {
      title: 'ตรวจสอบข้อมูล',
      body: 'ตรวจสอบก่อนบันทึก คุณสามารถกลับไปแก้ไขแต่ละส่วนได้',
      edit: 'แก้ไข',
      consentTitle: 'ความยินยอมและความเป็นส่วนตัว',
      storageConsent: 'ฉันยินยอมให้จัดเก็บข้อมูลโปรไฟล์สุขภาพในบัญชีนี้',
      retention:
        'จัดเก็บไม่เกิน 365 วัน และลบก่อนกำหนดได้โดยลบโปรไฟล์หรือลบบัญชี',
      noDiagnosisConsent:
        'ฉันเข้าใจว่าข้อมูลนี้ไม่ผ่านการวินิจฉัยหรือประเมินโดยระบบ',
      noPersonalization:
        'ข้อมูลจะไม่ถูกส่งให้ AI และยังไม่ใช้เลือกหรือปรับแผนกิจกรรม',
      notifications: 'การแจ้งเตือนกิจกรรม',
      notificationsBody:
        'บันทึกความต้องการไว้ก่อน ระบบยังไม่ขอสิทธิ์เบราว์เซอร์หรือส่งการแจ้งเตือนจริง'
    },
    validation: {
      required: 'กรุณากรอกหรือเลือกคำตอบในช่องนี้',
      consent: 'กรุณายืนยันทั้งสองข้อก่อนบันทึก'
    },
    units: {
      cm: 'ซม.',
      kg: 'กก.',
      yearsValue: '{{value}} ปี'
    },
    options: {
      female: 'หญิง',
      male: 'ชาย',
      unspecified: 'ไม่ประสงค์ระบุ',
      lower_back: 'หลังส่วนล่าง',
      knee: 'เข่า',
      shoulder: 'หัวไหล่',
      general_mobility: 'การเคลื่อนไหวทั่วไป',
      prefer_not_to_say: 'ไม่ประสงค์ระบุบริเวณ',
      none: 'ไม่มี',
      cane: 'ไม้เท้า',
      walker: 'อุปกรณ์ช่วยเดิน',
      wheelchair: 'รถเข็น',
      other: 'อื่น ๆ',
      chest_pain: 'เจ็บหน้าอก',
      shortness_of_breath: 'หายใจลำบาก',
      dizziness_or_fainting: 'เวียนศีรษะหรือเป็นลม',
      weakness_or_severe_fatigue: 'อ่อนแรงหรืออ่อนล้ามาก',
      severe_pain: 'ปวดรุนแรง',
      strength: 'เพิ่มความแข็งแรง',
      balance_fall_prevention: 'ฝึกสมดุลและการป้องกันการล้ม',
      flexibility: 'เพิ่มความยืดหยุ่น',
      daily_activity: 'การเคลื่อนไหวในชีวิตประจำวัน',
      progress: 'ติดตามกิจกรรมของฉัน',
      low: 'น้อย',
      moderate: 'ปานกลาง',
      regular: 'สม่ำเสมอ',
      morning: 'เช้า',
      afternoon: 'กลางวัน',
      evening: 'เย็น',
      chair: 'เก้าอี้',
      mat: 'เสื่อ',
      resistance_band: 'ยางยืด',
      front: 'กล้องหน้า — ตั้งอุปกรณ์ไว้ด้านหน้า',
      rear: 'กล้องหลัง — ใช้เมื่ออุปกรณ์รองรับ'
    }
  },
  chat: {
    title: 'ผู้ช่วย KineGuide AI',
    subtitle:
      'พิมพ์สนทนาต่อเนื่องโดยใช้ประวัติในบัญชีนี้ ข้อความจะเก็บจนกว่าคุณจะลบบทสนทนาหรือลบบัญชี',
    boundary:
      'KineGuide AI ให้ข้อมูลเพื่อการศึกษาเท่านั้น ไม่วินิจฉัยโรค ไม่กำหนดการรักษา และไม่ใช้แทนแพทย์หรือนักกายภาพบำบัด',
    educationalFlow: 'Clinical Flow สาธิต',
    conversations: 'รายการบทสนทนา',
    conversation: 'บทสนทนา',
    new: 'เริ่มบทสนทนาใหม่',
    empty: 'ยังไม่มีบทสนทนา เริ่มห้องใหม่เมื่อคุณพร้อม',
    startPrompt: 'ลองถาม เช่น “มีท่าสาธิตอะไรให้เลือกบ้าง”',
    messageLabel: 'ข้อความถึง KineGuide AI',
    placeholder: 'ลองพิมพ์: มีท่าสาธิตอะไรแนะนำบ้าง',
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
  clinicalFlow: {
    eyebrow: 'Educational Prototype · Pending Clinical Review',
    title: 'Clinical Flow สำหรับการสาธิตระบบ',
    pendingBadge: 'รอตรวจสอบโดยผู้เชี่ยวชาญ',
    disclaimer:
      'ฟีเจอร์นี้เป็นต้นแบบเพื่อการศึกษา ข้อมูลท่าและขั้นตอนคัดกรองยังอยู่ระหว่างการตรวจสอบโดยผู้เชี่ยวชาญ และไม่ใช้แทนคำแนะนำจากแพทย์หรือนักกายภาพบำบัด',
    mockNotice:
      'ตัวเลือกทั้งหมดเป็น mock data ที่มี demo_only: true และ not_for_clinical_use: true ไม่มีความหมายด้านความเสี่ยงหรือความปลอดภัยทางการแพทย์',
    evaluate: 'ตรวจสอบ flow สาธิต',
    evaluateFailed: 'ไม่สามารถประมวลผล flow สาธิตได้ กรุณาลองใหม่',
    stoppedTitle: 'หยุดการสาธิต',
    restart: 'เริ่ม flow สาธิตใหม่',
    demoExercises: 'รายการท่าสาธิตที่ยังรอการตรวจสอบ',
    demoMovement: 'ท่าสาธิตในระบบต้นแบบ'
  },
  plan: {
    title: 'แผนกิจกรรมสาธิต 7 วัน',
    subtitle:
      'ตารางสำหรับทดลอง flow ของระบบเท่านั้น ไม่ใช่โปรแกรมกายภาพบำบัดหรือคำแนะนำการรักษา',
    pendingReview: 'รอการทบทวนทางคลินิก',
    notPersonalized: 'ไม่ได้ปรับตามอาการของคุณ',
    details: 'ดูรายละเอียด',
    start: 'เริ่มกิจกรรม',
    goalTitle: 'เป้าหมายของตารางสาธิต',
    goalBody:
      'ช่วยให้คุณสำรวจคลังท่า การตั้งค่ากล้อง และการบันทึก session โดยไม่มีการตัดสินความเหมาะสมหรือความถูกต้องของท่า',
    duration: 'ระยะเวลา',
    durationValue: '7 วัน',
    basis: 'หลักการจัดรายการ',
    basisValue: 'หมุนเวียนรายการสาธิตแบบคงที่',
    cautionTitle: 'ข้อควรทราบ',
    cautionOne: 'รายการนี้ใช้ชุดกิจกรรมสาธิตแบบคงที่ ไม่ได้ปรับตามอาการ',
    cautionTwo: 'ระบบยังไม่มีเกณฑ์ทางคลินิกหรือคะแนนความถูกต้องของท่า',
    day: 'วันที่ {{day}}',
    activitiesForDay: 'กิจกรรมสาธิตสำหรับวันที่ {{day}}',
    camera: 'ทดลองกล้องในอุปกรณ์',
    viewExercise: 'ดูรายละเอียดกิจกรรม',
    startExercise: 'ตั้งค่ากล้อง',
    empty: 'ยังไม่มีรายการสาธิตสำหรับวันนี้'
  },
  dashboard: {
    updated: 'อัปเดตล่าสุด {{date}}',
    hello: 'สวัสดี {{name}}',
    ready: 'พร้อมสำหรับกิจกรรมวันนี้หรือยัง?',
    aiTitle: 'ผู้ช่วยสนทนา KineGuide AI',
    aiStructured: 'คำถามแบบมีโครงสร้าง',
    aiBody:
      'ตอบคำถามสั้น ๆ ผ่านหน้าสนทนา เพื่อจัดระเบียบข้อมูลที่คุณต้องการบันทึกและไปยังแผนกิจกรรมสาธิต',
    aiBoundary:
      'ผู้ช่วยนี้ไม่วิเคราะห์ข้อความอิสระ ไม่วินิจฉัย และไม่สร้างคำแนะนำการรักษา',
    aiStart: 'เริ่มคุยกับ AI',
    recommended: 'การสาธิตที่แนะนำสำหรับการสำรวจระบบ',
    today: 'กิจกรรมวันนี้',
    todayName: 'การลุกนั่งจากเก้าอี้',
    todayIllustrationAlt: 'ภาพประกอบการสาธิตลุกนั่งจากเก้าอี้',
    todayProgress: 'วันที่ 1 จาก 7',
    viewDetails: 'ดูรายละเอียด',
    completed: 'ทำสำเร็จ',
    start: 'เลือกการสาธิต',
    sessions: 'session ที่เสร็จ',
    streak: 'วันที่ต่อเนื่อง',
    time: 'เวลาที่บันทึก',
    activitySummary: 'สรุปกิจกรรม',
    recent: 'กิจกรรมล่าสุด',
    viewAll: 'ดูทั้งหมด',
    noRecent: 'ยังไม่มี session ที่บันทึก',
    weekly: 'กิจกรรมรายสัปดาห์',
    range: 'ช่วงเวลาของกราฟกิจกรรม',
    rangeDays: '{{count}} วัน',
    chartSummary: 'กิจกรรมที่บันทึก {{count}} รายการในช่วง {{range}} วัน',
    manual:
      'ตัวเลขทั้งหมดเป็นข้อมูลกิจกรรมที่บันทึกเอง ไม่ใช่ผลการประเมินการฟื้นตัว'
  },
  exercises: {
    title: 'คลังการสาธิตการเคลื่อนไหว',
    subtitle:
      'เลือกเพื่อทดลอง flow ของกล้อง เนื้อหายังไม่ใช่โปรแกรมกายภาพบำบัด',
    search: 'ค้นหาการสาธิต',
    all: 'ทั้งหมด',
    neck: 'บริเวณคอ',
    shoulder: 'บริเวณไหล่',
    lower_back: 'บริเวณหลังช่วงล่าง',
    knee: 'บริเวณเข่า',
    hand: 'บริเวณมือ',
    upper: 'ช่วงบน',
    lower: 'ช่วงล่าง',
    details: 'ดูรายละเอียด',
    start: 'เริ่มทดสอบกล้อง',
    empty: 'ไม่พบรายการที่ตรงกับการค้นหา',
    review: 'รอ clinical review',
    sitToStandImageAlt: 'ภาพตัวอย่างสาธิตการลุกนั่งจากเก้าอี้ 3 จังหวะ',
    shoulderImageAlt: 'ภาพตัวอย่างสาธิตการเคลื่อนไหวหัวไหล่ 3 จังหวะ',
    what: 'ระบบจะทำอะไร',
    whatBody:
      'เปิดกล้องหลังได้รับอนุญาต แสดงภาพในอุปกรณ์ และให้คุณบันทึกจำนวนครั้งด้วยตนเอง',
    notIncluded: 'สิ่งที่ยังไม่รวม',
    notIncludedBody:
      'ไม่มีการตัดสินว่าท่าถูกหรือผิด ไม่มีเกณฑ์มุมข้อ และไม่มีคำแนะนำการรักษา'
  },
  camera: {
    title: 'ตั้งค่ากล้อง',
    practiceTitle: 'ฝึกด้วยกล้อง',
    practiceSubtitle:
      'เลือกกิจกรรมก่อนเปิดกล้อง ระบบจะประมวลผลภาพในอุปกรณ์นี้เท่านั้น',
    chooseActivity: 'เลือกกิจกรรมเพื่อเริ่มฝึก',
    subtitle: 'จัดตำแหน่งอุปกรณ์ในพื้นที่มั่นคงและตรวจภาพด้วยตนเอง',
    start: 'เปิดกล้อง',
    stop: 'ปิดกล้อง',
    continue: 'เริ่ม session สาธิต',
    readiness: 'ความพร้อมของระบบ',
    secure: 'ข้อมูลกล้องอยู่ในอุปกรณ์',
    permission: 'สิทธิ์กล้อง',
    visibility: 'มองเห็นภาพตัวอย่าง',
    model: 'Pose model',
    unavailable: 'ยังไม่โหลด—session นี้ใช้การนับด้วยตนเอง',
    modelPending:
      'เมื่อเริ่ม live session เบราว์เซอร์จะดาวน์โหลดไฟล์โมเดลจากผู้ให้บริการภายนอก โดยไม่ส่งภาพกล้อง',
    granted: 'ได้รับอนุญาต',
    waiting: 'รอการอนุญาต',
    denied: 'ไม่สามารถเปิดกล้องได้',
    unsupported: 'เบราว์เซอร์หรืออุปกรณ์นี้ไม่รองรับกล้อง',
    instructions:
      'กล้องจะเริ่มหลังคุณกดปุ่มเท่านั้น และจะหยุดเมื่อออกจากหน้านี้'
  },
  session: {
    live: 'Live session สาธิต',
    timer: 'เวลา',
    reps: 'จำนวนครั้งที่บันทึกเอง',
    automaticTechnicalCount: 'จำนวนรอบการเคลื่อนไหวอัตโนมัติ (เชิงเทคนิค)',
    automaticTechnicalBoundary:
      'นับเฉพาะลำดับการยก-ลดที่กล้องสังเกตได้ ไม่ใช่คะแนนความถูกต้อง ไม่ใช่คำสั่งรักษา และยังไม่บันทึกในประวัติ',
    addRep: 'เพิ่ม 1 ครั้ง',
    undo: 'ย้อนกลับ 1 ครั้ง',
    startCamera: 'เปิดกล้องสำหรับ session',
    pause: 'หยุดเวลา',
    resume: 'จับเวลาต่อ',
    finish: 'เสร็จสิ้น',
    stop: 'หยุด session',
    estimate:
      'โครงกระดูกช่วยตรวจว่าร่างกายอยู่ในเฟรมเท่านั้น ยังไม่มีคะแนนความถูกต้องหรือการแก้ท่า เพราะไม่มี clinical thresholds ที่ผ่านการอนุมัติ',
    poseTitle: 'การตรวจจับร่างกาย ใบหน้า และมือ',
    poseIdle: 'เปิดกล้องเพื่อเริ่มตรวจจับจุดร่างกาย ใบหน้า และมือ',
    poseLoading: 'กำลังโหลดโมเดลตรวจจับร่างกาย ใบหน้า และมือบนอุปกรณ์นี้',
    poseReady: 'ตรวจพบจุดสำคัญที่ต้องใช้สำหรับท่านี้',
    poseAdjust: 'มองเห็นจุดสำคัญไม่ครบ กรุณาปรับตำแหน่งกล้อง',
    poseMissing: 'ยังไม่พบร่างกายในภาพ',
    poseMultiple:
      'พบมากกว่าหนึ่งคนในภาพ ระบบจึงไม่เลือกหรือติดตามบุคคลใด กรุณาให้เหลือผู้ใช้เพียงคนเดียวในเฟรม',
    poseUnsupportedExercise:
      'ท่านี้ยังไม่มีรูปแบบสังเกตด้วยกล้องที่ผ่านการกำหนด ระบบจึงไม่ประเมินการเคลื่อนไหว',
    poseUnavailable: 'โมเดลยังใช้งานไม่ได้ขณะออฟไลน์ คุณยังนับด้วยตนเองได้',
    poseError: 'ไม่สามารถเริ่มการตรวจจับได้ คุณยังนับด้วยตนเองได้',
    posePrivacy:
      'ภาพ จุดร่างกาย ใบหน้า มือ และค่าประมาณการกะพริบตาประมวลผลชั่วคราวในเบราว์เซอร์ ไม่ถูกอัปโหลดหรือบันทึก และไม่ใช่การตรวจสุขภาพ',
    technicalCheck: 'ขอ feedback เชิงเทคนิค',
    technicalResult: 'ผลเชิงเทคนิคจาก Python AI Service',
    technicalConfidence: 'ความมั่นใจของการมองเห็นจุด: {{value}}',
    phaseUnavailable:
      'movement phase และการนับอัตโนมัติยังไม่พร้อม ระบบใช้การนับด้วยตนเองเท่านั้น',
    notAvailable: 'ไม่พร้อมใช้งาน',
    technicalFailed:
      'ไม่สามารถรับ feedback เชิงเทคนิคได้ คุณยังนับด้วยตนเองได้',
    technicalFeedback: {
      waiting_for_camera: 'กำลังรอข้อมูลสถานะกล้อง',
      camera_ready: 'ข้อมูลการมองเห็นจุดพร้อมสำหรับการสาธิตเชิงเทคนิค',
      adjust_camera: 'การมองเห็นจุดไม่ครบ โปรดปรับตำแหน่งกล้อง',
      multiple_people_detected: 'พบมากกว่าหนึ่งคน ระบบไม่เลือกบุคคลใด',
      unsupported_exercise: 'ยังไม่มี technical profile สำหรับท่าสาธิตนี้',
      technical_analysis_unavailable: 'การวิเคราะห์เชิงเทคนิคไม่พร้อมใช้งาน'
    },
    poseResearchMethod: 'วิธีเปรียบเทียบจากงานวิจัย',
    poseResearchPending:
      'มีโครง cosine similarity และ DTW สำหรับท่าไหล่มุมหน้า แต่ยังไม่แสดงผลถูกหรือผิดจนกว่าจะมีลำดับอ้างอิงที่นักกายภาพอนุมัติ',
    poseResearchSource: 'อ่านงานวิจัยต้นทาง (เปิดแท็บใหม่)',
    summary: 'สรุป session',
    completed: 'บันทึก session แล้ว',
    elapsed: 'เวลาที่ใช้',
    backHome: 'กลับ Dashboard',
    viewHistory: 'ดูประวัติ',
    saveFailed: 'ไม่สามารถบันทึก session ได้'
  },
  history: {
    title: 'ประวัติกิจกรรม',
    subtitle: 'เฉพาะ session summary ที่คุณอนุญาตให้จัดเก็บ',
    empty: 'ยังไม่มีประวัติ',
    completed: 'เสร็จสิ้น',
    stopped: 'หยุดก่อนเสร็จ',
    pagination: 'การแบ่งหน้าประวัติกิจกรรม',
    previousPage: 'หน้าก่อนหน้า',
    nextPage: 'หน้าถัดไป',
    pageStatus: 'หน้า {{page}} จาก {{total}}'
  },
  progress: {
    title: 'ความก้าวหน้าด้านกิจกรรม',
    subtitle: 'แผนภูมินี้แสดงความสม่ำเสมอและเวลาเท่านั้น ไม่ตีความการฟื้นตัว',
    sessions: 'session ทั้งหมด',
    time: 'เวลารวม',
    streak: 'ต่อเนื่อง',
    chart: 'กิจกรรมล่าสุด'
  },
  profile: {
    title: 'โปรไฟล์สุขภาพ',
    subtitle:
      'ข้อมูลสุขภาพที่คุณบันทึกไว้สำหรับทบทวนและจัดการ ไม่ใช้วินิจฉัยหรือสร้างแผนเฉพาะบุคคล',
    loading: 'กำลังโหลดข้อมูลโปรไฟล์สุขภาพ…',
    edit: 'แก้ไขข้อมูล',
    notifications: 'เปิดการแจ้งเตือน',
    name: 'ชื่อที่ใช้แสดง',
    email: 'อีเมล',
    joined: 'สร้างบัญชีเมื่อ',
    accountProtected: 'บัญชี KineGuide ที่ลงชื่อเข้าใช้แล้ว',
    completeness: 'ความสมบูรณ์ของแบบฟอร์ม',
    complete: 'ครบถ้วน',
    bodyData: 'ข้อมูลร่างกาย',
    bmi: 'BMI',
    selfReportedNotice:
      'ข้อมูลที่คุณรายงานเองและค่าคำนวณทั่วไป ไม่ใช่การวินิจฉัย',
    goals: 'เป้าหมายของฉัน',
    goalsBoundary: 'บันทึกเพื่อให้คุณทบทวน ยังไม่ใช้สร้างแผนเฉพาะบุคคล',
    movementContext: 'ข้อจำกัดและบริบทการเคลื่อนไหว',
    recentInjuryReported: 'รายงานการบาดเจ็บหรือผ่าตัดในช่วง 6 เดือนที่ผ่านมา',
    noRecentInjuryReported:
      'ไม่ได้รายงานการบาดเจ็บหรือผ่าตัดในช่วง 6 เดือนที่ผ่านมา',
    assistiveDeviceReported: 'รายงานการใช้อุปกรณ์ช่วยเดิน: {{device}}',
    noAssistiveDeviceReported: 'ไม่ได้รายงานอุปกรณ์ช่วยเดิน',
    safetyData: 'ข้อมูลความปลอดภัย',
    lastReviewed: 'อัปเดตคำตอบล่าสุด',
    noWarningsReported: 'คุณรายงานว่าไม่มีข้อมูลอาการเตือนในแบบฟอร์มล่าสุด',
    warningsReported:
      'คุณได้บันทึกข้อมูลอาการไว้ในแบบฟอร์มล่าสุด โปรดทบทวนคำตอบหรือติดต่อบุคลากรทางการแพทย์หากกังวล',
    notEvaluated: 'ระบบบันทึกคำตอบเท่านั้นและไม่ประเมินความพร้อมในการทำกิจกรรม',
    dataUse: 'การใช้ข้อมูล',
    dataUseBody:
      'ใช้เพื่อให้คุณทบทวนและจัดการข้อมูลในบัญชีนี้ ยังไม่ใช้เลือกหรือปรับแผนกิจกรรม',
    retention: 'กำหนดเก็บข้อมูลถึง {{date}} และลบก่อนกำหนดได้',
    privacySettings: 'ตั้งค่าและความเป็นส่วนตัว',
    latestWeight: 'ข้อมูลน้ำหนักล่าสุด',
    noWeightHistory:
      'ยังไม่มีประวัติแนวโน้มน้ำหนัก ระบบจะแสดงเฉพาะค่าล่าสุดโดยไม่แปลผล',
    updateMeasurement: 'อัปเดตข้อมูล',
    reviewAssessment: 'ทบทวนแบบประเมินเบื้องต้น',
    healthTitle: 'โปรไฟล์สุขภาพ',
    healthBody:
      'ทบทวน แก้ไข หรือลบข้อมูลสุขภาพที่คุณกรอกไว้ ข้อมูลนี้ไม่ใช้วินิจฉัยหรือสร้างแผนเฉพาะบุคคล',
    healthEdit: 'ทบทวนและแก้ไข',
    healthDelete: 'ลบโปรไฟล์สุขภาพ',
    healthDeleteConfirm:
      'ลบข้อมูลโปรไฟล์สุขภาพทั้งหมดออกจากบัญชีนี้หรือไม่? การดำเนินการนี้ย้อนกลับไม่ได้',
    healthDeleteFailed: 'ไม่สามารถลบโปรไฟล์สุขภาพได้ กรุณาลองอีกครั้ง'
  },
  assessment: {
    title: 'แบบประเมินข้อมูลเบื้องต้น',
    subtitle: 'ทบทวนและบันทึกคำตอบแบบมีโครงสร้างในบัญชีของคุณ',
    boundary:
      'ระบบบันทึกคำตอบเท่านั้นและไม่ประเมิน วินิจฉัย หรือแนะนำการรักษา หากกังวลเกี่ยวกับอาการ โปรดติดต่อบุคลากรทางการแพทย์ที่มีคุณสมบัติเหมาะสม',
    loading: 'กำลังโหลดคำตอบล่าสุด…',
    formTitle: 'คำตอบที่รายงานด้วยตนเอง',
    formBody: 'เลือกหนึ่งคำตอบในแต่ละหัวข้อ คุณสามารถกลับมาแก้ไขได้',
    concernArea: 'บริเวณที่ต้องการบันทึก',
    duration: 'ช่วงเวลาที่สังเกตข้อมูลนี้',
    dailyImpact: 'ผลต่อกิจวัตรประจำวัน',
    goal: 'สิ่งที่ต้องการใช้ระบบช่วย',
    required: 'กรุณาเลือกหนึ่งคำตอบ',
    save: 'บันทึกคำตอบ',
    saving: 'กำลังบันทึก…',
    saved: 'บันทึกคำตอบแล้วโดยไม่มีการประเมินผล',
    saveFailed: 'ไม่สามารถบันทึกคำตอบได้ กรุณาลองอีกครั้ง',
    retention:
      'จัดเก็บตาม consent สำหรับ session summary และกำหนดเก็บไม่เกิน 365 วัน หรือลบพร้อมบัญชี',
    options: {
      lower_back: 'หลังส่วนล่าง',
      knee: 'เข่า',
      shoulder: 'ไหล่',
      general_mobility: 'การเคลื่อนไหวทั่วไป',
      prefer_not_to_say: 'ไม่ต้องการระบุ',
      lt_week: 'น้อยกว่า 1 สัปดาห์',
      one_to_four_weeks: '1–4 สัปดาห์',
      gt_four_weeks: 'มากกว่า 4 สัปดาห์',
      unsure: 'ไม่แน่ใจ',
      none: 'ไม่กระทบ',
      some: 'กระทบบางส่วน',
      much: 'กระทบมาก',
      understand: 'ทำความเข้าใจข้อมูล',
      camera_demo: 'ทดลองกิจกรรมด้วยกล้อง',
      track_activity: 'บันทึกความสม่ำเสมอของกิจกรรม'
    }
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
    lastLoginMethod: 'ต้องมีวิธีเข้าสู่ระบบอื่นก่อนยกเลิกการเชื่อมบัญชีนี้'
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
    loadingPrepare: 'Prepare activity plan',
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
    brandSubtitle: 'Physiotherapy support',
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
    clinicalDemo: 'Clinical flow demo',
    plan: 'Activity plan',
    camera: 'Camera practice',
    exercises: 'Movement demos',
    history: 'History',
    progress: 'Activity records and progress',
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
      activityReminder: 'Daily activity reminder',
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
      planTitle: "It's time for today's planned activity",
      planBody: 'A demonstration activity is saved in your plan for today.',
      streakTitle: 'You have recorded activity for 4 days in a row',
      streakBody: 'Review consistency based on the activity you recorded.',
      assistantTitle: 'KineGuide AI has a new message',
      assistantBody: 'Your latest information summary is ready to review.',
      savedTitle: 'Activity recorded',
      savedBody: 'The activity summary you entered was saved.',
      cameraTitle: 'Check camera permission',
      cameraBody: 'Allow camera access before starting a camera activity.',
      privacyTitle: 'Privacy settings updated',
      privacyBody: 'Your settings change has been recorded.'
    }
  },
  landing: {
    features: 'Features',
    eyebrow: 'KineGuide AI · Physiotherapy support prototype',
    title: 'Explore movement confidently with support that values your privacy',
    subtitle:
      'Try an on-device camera flow, save minimal activity summaries, and track consistency without uploading photos or video.',
    start: 'Get started',
    learn: 'How it works',
    cameraTitle: 'On-device camera',
    cameraBody:
      'Camera frames stay in browser memory and are never sent to the server.',
    consentTitle: 'Control your data',
    consentBody: 'Give, withdraw, and review consent from settings.',
    progressTitle: 'Non-clinical activity tracking',
    progressBody: 'Review time and sessions you recorded yourself.',
    privacyTitle: 'Private by design',
    privacyBody:
      'Only necessary structured answers and session summaries are stored.',
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
    title: 'Camera and activity-data consent',
    intro: 'Read and choose before the browser asks for camera access.',
    cameraTitle: 'On-device camera processing',
    cameraBody:
      'Frames are temporary in the browser and no video is uploaded or recorded.',
    storageTitle: 'Store session summaries',
    storageBody:
      'Store the demo name, time, and manually recorded count for up to 365 days.',
    researchTitle: 'Allow de-identified research use (optional)',
    required: 'Allow camera processing and session-summary storage',
    aiChat: 'Allow AI chat and conversation-history storage',
    aiChatBody:
      'Chat may contain health information and remains stored until you delete the conversation or your account.',
    research: 'Allow research use',
    accept: 'Accept and continue',
    privacy:
      'Symptom data is sensitive. You may withdraw consent and delete your account at any time.',
    failed: 'Unable to save consent.'
  },
  healthProfile: {
    title: 'Set up your health profile',
    subtitle:
      'Enter information for you to review and correct. It is not used to diagnose, choose treatment, or automatically personalize an activity plan.',
    progress: 'Health-profile setup progress',
    optional: 'Optional — prefer not to say is available',
    select: 'Choose an answer',
    reviewData: 'Review information',
    saveProfile: 'Save profile',
    saveFailed: 'Unable to save your health profile. Please try again.',
    privateFooter:
      'Health information is used under your consent, retained for no more than 365 days, and can be corrected or deleted.',
    steps: {
      basics: 'Basic information',
      safety: 'Health and safety',
      goals: 'Goals',
      review: 'Review'
    },
    basics: {
      title: 'Basic information',
      body: 'Self-reported information displayed for review in this account.',
      birthDate: 'Date of birth',
      sex: 'Sex at birth',
      height: 'Height',
      weight: 'Current weight',
      trackWeight: 'Keep this weight in my profile',
      trackWeightBody: 'No weight history or trend interpretation is created.',
      preview: 'Calculated information preview',
      age: 'Age',
      previewNotice:
        'Displayed values are general calculations, not a diagnosis or medical advice.'
    },
    safety: {
      title: 'Health and safety',
      body: 'Store your self-reported answers. The system does not assess activity suitability.',
      careAreas: 'Areas you want to care for (select all that apply)',
      recentInjury: 'Injury or surgery in the past 6 months',
      clinicianManaged:
        'Has a professional managed this movement concern before?',
      assistiveDevice: 'Do you use a mobility aid?',
      warningTitle: 'Current symptom information',
      warningBody: 'Choose the answers that match you right now.',
      notEvaluated:
        'The system only stores these answers and does not decide whether you are ready for activity. Contact a qualified clinician if you are concerned.'
    },
    goals: {
      title: 'Goals and usage preferences',
      body: 'Choose what fits you. This information is not yet used to create a personalized plan.',
      yourGoals: 'Your goals',
      activityLevel: 'Current activity level',
      preferredTime: 'Convenient time',
      equipment: 'Available equipment',
      camera: 'Camera use',
      notes: 'Information you want the system to remember',
      notesPlaceholder:
        'For example, time, accessibility, or context you want to remember'
    },
    review: {
      title: 'Review your information',
      body: 'Check before saving. You can return to edit each section.',
      edit: 'Edit',
      consentTitle: 'Consent and privacy',
      storageConsent:
        'I consent to storing this health-profile information in my account.',
      retention:
        'Retained for up to 365 days and removable earlier by deleting the profile or account.',
      noDiagnosisConsent:
        'I understand that the system does not diagnose or evaluate this information.',
      noPersonalization:
        'The data is not sent to AI and is not yet used to choose or personalize activities.',
      notifications: 'Activity notifications',
      notificationsBody:
        'Save this preference only. The system does not request browser permission or send notifications yet.'
    },
    validation: {
      required: 'Enter or choose an answer for this field.',
      consent: 'Confirm both statements before saving.'
    },
    units: {
      cm: 'cm',
      kg: 'kg',
      yearsValue: '{{value}} years'
    },
    options: {
      female: 'Female',
      male: 'Male',
      unspecified: 'Prefer not to say',
      lower_back: 'Lower back',
      knee: 'Knee',
      shoulder: 'Shoulder',
      general_mobility: 'General mobility',
      prefer_not_to_say: 'Prefer not to name an area',
      none: 'None',
      cane: 'Cane',
      walker: 'Walker',
      wheelchair: 'Wheelchair',
      other: 'Other',
      chest_pain: 'Chest pain',
      shortness_of_breath: 'Shortness of breath',
      dizziness_or_fainting: 'Dizziness or fainting',
      weakness_or_severe_fatigue: 'Weakness or severe fatigue',
      severe_pain: 'Severe pain',
      strength: 'Increase strength',
      balance_fall_prevention: 'Balance and fall prevention',
      flexibility: 'Improve flexibility',
      daily_activity: 'Daily movement',
      progress: 'Track my activity',
      low: 'Low',
      moderate: 'Moderate',
      regular: 'Regular',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      chair: 'Chair',
      mat: 'Mat',
      resistance_band: 'Resistance band',
      front: 'Front camera — device placed in front',
      rear: 'Rear camera — where supported'
    }
  },
  chat: {
    title: 'KineGuide AI assistant',
    subtitle:
      'Continue a typed conversation using history from this account. Messages remain stored until you delete the conversation or your account.',
    boundary:
      'KineGuide AI provides educational information only. It does not diagnose, prescribe treatment, or replace a physician or physiotherapist.',
    educationalFlow: 'Clinical flow demo',
    conversations: 'Conversation list',
    conversation: 'Conversation',
    new: 'Start a new conversation',
    empty: 'No conversations yet. Start one when you are ready.',
    startPrompt: 'Try asking, “Which movement demonstrations can I explore?”',
    messageLabel: 'Message to KineGuide AI',
    placeholder: 'Try: Can you recommend a movement demonstration?',
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
  clinicalFlow: {
    eyebrow: 'Educational Prototype · Pending Clinical Review',
    title: 'Clinical flow system demonstration',
    pendingBadge: 'Pending professional review',
    disclaimer:
      'This feature is an educational prototype. Its movement and screening content is pending professional review and does not replace advice from a physician or physiotherapist.',
    mockNotice:
      'Every option is mock data marked demo_only: true and not_for_clinical_use: true. It has no medical risk or safety meaning.',
    evaluate: 'Evaluate demo flow',
    evaluateFailed:
      'Unable to evaluate the demonstration flow. Please try again.',
    stoppedTitle: 'Demonstration stopped',
    restart: 'Restart demonstration flow',
    demoExercises: 'Pending-review movement demonstrations',
    demoMovement: 'Movement demonstration in the prototype'
  },
  plan: {
    title: '7-day demo activity plan',
    subtitle:
      'A schedule for exploring the product flow only. It is not a physiotherapy program or treatment guidance.',
    pendingReview: 'Clinical review pending',
    notPersonalized: 'Not personalized to your symptoms',
    details: 'View details',
    start: 'Start activity',
    goalTitle: 'Demo schedule goal',
    goalBody:
      'Explore the movement library, camera setup, and session recording without judging suitability or movement correctness.',
    duration: 'Duration',
    durationValue: '7 days',
    basis: 'Selection basis',
    basisValue: 'Fixed demo rotation',
    cautionTitle: 'Important information',
    cautionOne:
      'This uses a fixed demo activity set and is not personalized to symptoms.',
    cautionTwo:
      'No approved clinical thresholds or movement-correctness score is available.',
    day: 'Day {{day}}',
    activitiesForDay: 'Demo activities for day {{day}}',
    camera: 'Try the on-device camera',
    viewExercise: 'View activity details',
    startExercise: 'Set up camera',
    empty: 'No demo activities are available for this day.'
  },
  dashboard: {
    updated: 'Last updated {{date}}',
    hello: 'Hello {{name}}',
    ready: 'Ready for an activity?',
    aiTitle: 'KineGuide AI conversation assistant',
    aiStructured: 'Structured questions',
    aiBody:
      'Answer short questions in a conversation-style flow to organize what you want to record and continue to the demo activity plan.',
    aiBoundary:
      'This assistant does not interpret free text, diagnose, or generate treatment guidance.',
    aiStart: 'Start AI chat',
    recommended: 'Recommended demo for exploring the system',
    today: 'Today’s activity',
    todayName: 'Sit-to-stand movement demo',
    todayIllustrationAlt: 'Illustration of the sit-to-stand movement demo',
    todayProgress: 'Day 1 of 7',
    viewDetails: 'View details',
    completed: 'Completed',
    start: 'Choose a demo',
    sessions: 'completed sessions',
    streak: 'day streak',
    time: 'recorded time',
    activitySummary: 'Activity summary',
    recent: 'Recent activity',
    viewAll: 'View all',
    noRecent: 'No recorded sessions yet',
    weekly: 'Weekly activity',
    range: 'Activity chart range',
    rangeDays: '{{count}} days',
    chartSummary: '{{count}} recorded activities in the past {{range}} days',
    manual:
      'All figures are self-recorded activity data, not recovery outcomes.'
  },
  exercises: {
    title: 'Movement demo library',
    subtitle: 'Choose a camera-flow demo. This is not a physiotherapy program.',
    search: 'Search demos',
    all: 'All',
    neck: 'Neck',
    shoulder: 'Shoulder',
    lower_back: 'Lower back',
    knee: 'Knee',
    hand: 'Hand',
    upper: 'Upper body',
    lower: 'Lower body',
    details: 'View details',
    start: 'Test camera',
    empty: 'No matching demos',
    review: 'Clinical review pending',
    sitToStandImageAlt:
      'Three-stage illustration of the sit-to-stand movement demo',
    shoulderImageAlt: 'Three-stage illustration of the shoulder movement demo',
    what: 'What the system does',
    whatBody:
      'Opens the camera after permission, keeps the preview on-device, and lets you record counts manually.',
    notIncluded: 'Not included yet',
    notIncludedBody:
      'No correct/incorrect decision, joint-angle thresholds, or treatment advice.'
  },
  camera: {
    title: 'Camera setup',
    practiceTitle: 'Camera practice',
    practiceSubtitle:
      'Choose an activity before turning on the camera. Frames are processed only on this device.',
    chooseActivity: 'Choose an activity to begin',
    subtitle: 'Place the device securely and check the preview yourself.',
    start: 'Turn on camera',
    stop: 'Turn off camera',
    continue: 'Start demo session',
    readiness: 'System readiness',
    secure: 'Camera data stays on-device',
    permission: 'Camera permission',
    visibility: 'Preview visible',
    model: 'Pose model',
    unavailable: 'Not loaded—this session uses manual counting',
    modelPending:
      'When the live session starts, the browser downloads model files from external providers without sending camera frames',
    granted: 'Granted',
    waiting: 'Waiting',
    denied: 'Unable to open camera',
    unsupported: 'This browser or device does not support camera access',
    instructions:
      'The camera starts only after you press the button and stops when you leave this page.'
  },
  session: {
    live: 'Live demo session',
    timer: 'Time',
    reps: 'Manually recorded count',
    automaticTechnicalCount: 'Automatic movement cycles (technical)',
    automaticTechnicalBoundary:
      'Counts only an observable raise-lower sequence. It is not a correctness score or treatment direction and is not saved to history yet.',
    addRep: 'Add one',
    undo: 'Undo one',
    startCamera: 'Turn on camera for session',
    pause: 'Pause timer',
    resume: 'Resume timer',
    finish: 'Finish',
    stop: 'Stop session',
    estimate:
      'The skeleton checks whether the body is visible in frame. No correctness score or form correction is provided because approved clinical thresholds are not available.',
    poseTitle: 'Body, face, and hand detection',
    poseIdle: 'Turn on the camera to detect body, face, and hand landmarks',
    poseLoading: 'Loading body, face, and hand models on this device',
    poseReady: 'Required landmarks for this movement are visible',
    poseAdjust: 'Some required landmarks are not visible. Adjust the camera',
    poseMissing: 'No body detected in the preview yet',
    poseMultiple:
      'More than one person is visible. The system will not select or track anyone until only one person remains in frame.',
    poseUnsupportedExercise:
      'This activity has no defined camera-observation profile, so movement is not assessed.',
    poseUnavailable:
      'The model is unavailable while offline. Manual counting is still available',
    poseError:
      'Skeleton detection could not start. Manual counting is still available',
    posePrivacy:
      'Frames, body, face, hand, and estimated blink landmarks are processed temporarily in this browser, are not uploaded or saved, and are not a health assessment.',
    technicalCheck: 'Request technical feedback',
    technicalResult: 'Technical result from the Python AI Service',
    technicalConfidence: 'Landmark visibility confidence: {{value}}',
    phaseUnavailable:
      'Movement phase and automatic counting are unavailable. Counting remains manual.',
    notAvailable: 'Unavailable',
    technicalFailed:
      'Technical feedback is unavailable. Manual counting remains available.',
    technicalFeedback: {
      waiting_for_camera: 'Waiting for camera status data',
      camera_ready: 'Landmark visibility data is ready for the technical demo',
      adjust_camera: 'Some landmarks are not visible. Adjust the camera',
      multiple_people_detected:
        'More than one person is visible; nobody is selected',
      unsupported_exercise: 'No technical profile exists for this demo',
      technical_analysis_unavailable: 'Technical analysis is unavailable'
    },
    poseResearchMethod: 'Research comparison method',
    poseResearchPending:
      'Cosine similarity and DTW are prepared for the front-view shoulder activity, but no correct/incorrect result is shown without a physiotherapist-approved reference sequence.',
    poseResearchSource: 'Read the source study (opens a new tab)',
    summary: 'Session summary',
    completed: 'Session saved',
    elapsed: 'Elapsed time',
    backHome: 'Back to dashboard',
    viewHistory: 'View history',
    saveFailed: 'Unable to save the session.'
  },
  history: {
    title: 'Activity history',
    subtitle: 'Only session summaries you consented to store',
    empty: 'No history yet',
    completed: 'Completed',
    stopped: 'Stopped early',
    pagination: 'Activity history pagination',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    pageStatus: 'Page {{page}} of {{total}}'
  },
  progress: {
    title: 'Activity progress',
    subtitle: 'This chart shows consistency and time only, not recovery.',
    sessions: 'Total sessions',
    time: 'Total time',
    streak: 'Streak',
    chart: 'Recent activity'
  },
  profile: {
    title: 'Health profile',
    subtitle:
      'Health information you saved for review and management. It is not used for diagnosis or a personalized plan.',
    loading: 'Loading health-profile information…',
    edit: 'Edit information',
    notifications: 'Open notifications',
    name: 'Display name',
    email: 'Email',
    joined: 'Joined',
    accountProtected: 'Signed-in KineGuide account',
    completeness: 'Form completeness',
    complete: 'Complete',
    bodyData: 'Body information',
    bmi: 'BMI',
    selfReportedNotice:
      'Self-reported information and general calculations, not a diagnosis.',
    goals: 'My goals',
    goalsBoundary:
      'Saved for your review and not yet used to create a personalized plan.',
    movementContext: 'Movement limitations and context',
    recentInjuryReported: 'Injury or surgery in the past 6 months reported',
    noRecentInjuryReported:
      'No injury or surgery in the past 6 months reported',
    assistiveDeviceReported: 'Mobility aid reported: {{device}}',
    noAssistiveDeviceReported: 'No mobility aid reported',
    safetyData: 'Safety information',
    lastReviewed: 'Answers last updated',
    noWarningsReported:
      'You reported no warning-sign information in the latest form.',
    warningsReported:
      'You saved symptom information in the latest form. Review your answers or contact a qualified clinician if concerned.',
    notEvaluated:
      'The system stores these answers and does not assess readiness for activity.',
    dataUse: 'Data use',
    dataUseBody:
      'Used for you to review and manage in this account. It is not yet used to choose or personalize activities.',
    retention: 'Scheduled for retention until {{date}} and removable earlier.',
    privacySettings: 'Settings and privacy',
    latestWeight: 'Latest weight information',
    noWeightHistory:
      'No weight trend history is available. Only the latest value is shown without interpretation.',
    updateMeasurement: 'Update information',
    reviewAssessment: 'Review initial assessment',
    healthTitle: 'Health profile',
    healthBody:
      'Review, correct, or delete your self-reported health information. It is not used to diagnose or create a personalized plan.',
    healthEdit: 'Review and edit',
    healthDelete: 'Delete health profile',
    healthDeleteConfirm:
      'Delete all health-profile information from this account? This cannot be undone.',
    healthDeleteFailed: 'Unable to delete the health profile. Please try again.'
  },
  assessment: {
    title: 'Initial information assessment',
    subtitle: 'Review and save bounded structured answers in your account.',
    boundary:
      'The system only stores answers and does not assess, diagnose, or recommend treatment. Contact a qualified healthcare professional if you are concerned about symptoms.',
    loading: 'Loading the latest answers…',
    formTitle: 'Self-reported answers',
    formBody:
      'Choose one answer for each topic. You can return to revise them.',
    concernArea: 'Area to record',
    duration: 'How long you have noticed this information',
    dailyImpact: 'Effect on daily activities',
    goal: 'What you want the system to help with',
    required: 'Choose one answer.',
    save: 'Save answers',
    saving: 'Saving…',
    saved: 'Answers saved without evaluation',
    saveFailed: 'Unable to save the answers. Please try again.',
    retention:
      'Stored under session-summary consent for no more than 365 days, or removed with account deletion.',
    options: {
      lower_back: 'Lower back',
      knee: 'Knee',
      shoulder: 'Shoulder',
      general_mobility: 'General mobility',
      prefer_not_to_say: 'Prefer not to say',
      lt_week: 'Less than 1 week',
      one_to_four_weeks: '1–4 weeks',
      gt_four_weeks: 'More than 4 weeks',
      unsure: 'Unsure',
      none: 'No impact',
      some: 'Some impact',
      much: 'Much impact',
      understand: 'Understand my information',
      camera_demo: 'Try a camera demonstration',
      track_activity: 'Track activity consistency'
    }
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
      'Add another sign-in method before disconnecting this account.'
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
