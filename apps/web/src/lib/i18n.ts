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
    account: 'บัญชี',
    system: 'ระบบ',
    settingsPrivacy: 'ตั้งค่าและความเป็นส่วนตัว',
    logoutTitle: 'ออกจากระบบ',
    logoutConfirm: 'ต้องการออกจากระบบหรือไม่?'
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
  chat: {
    title: 'ผู้ช่วย KineGuide AI',
    subtitle:
      'พิมพ์สนทนาต่อเนื่องโดยใช้ประวัติในบัญชีนี้ ข้อความจะเก็บจนกว่าคุณจะลบบทสนทนาหรือลบบัญชี',
    boundary:
      'KineGuide AI ให้ข้อมูลเพื่อการศึกษาเท่านั้น ไม่วินิจฉัยโรค ไม่กำหนดการรักษา และไม่ใช้แทนแพทย์หรือนักกายภาพบำบัด',
    conversations: 'รายการบทสนทนา',
    conversation: 'บทสนทนา',
    new: 'เริ่มบทสนทนาใหม่',
    empty: 'ยังไม่มีบทสนทนา เริ่มห้องใหม่เมื่อคุณพร้อม',
    startPrompt: 'พิมพ์ข้อความเพื่อเริ่มบทสนทนา',
    messageLabel: 'ข้อความถึง KineGuide AI',
    placeholder: 'พิมพ์ข้อความของคุณ…',
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
    todayProgress: 'วันที่ 1 จาก 7',
    viewDetails: 'ดูรายละเอียด',
    completed: 'ทำสำเร็จ',
    start: 'เลือกการสาธิต',
    sessions: 'session ที่เสร็จ',
    streak: 'วันที่ต่อเนื่อง',
    time: 'เวลาที่บันทึก',
    recent: 'กิจกรรมล่าสุด',
    noRecent: 'ยังไม่มี session ที่บันทึก',
    weekly: 'ภาพรวมกิจกรรม',
    manual:
      'ตัวเลขทั้งหมดเป็นข้อมูลกิจกรรมที่บันทึกเอง ไม่ใช่ผลการประเมินการฟื้นตัว'
  },
  exercises: {
    title: 'คลังการสาธิตการเคลื่อนไหว',
    subtitle:
      'เลือกเพื่อทดลอง flow ของกล้อง เนื้อหายังไม่ใช่โปรแกรมกายภาพบำบัด',
    search: 'ค้นหาการสาธิต',
    all: 'ทั้งหมด',
    upper: 'ช่วงบน',
    lower: 'ช่วงล่าง',
    details: 'ดูรายละเอียด',
    start: 'เริ่มทดสอบกล้อง',
    empty: 'ไม่พบรายการที่ตรงกับการค้นหา',
    review: 'รอ clinical review',
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
    addRep: 'เพิ่ม 1 ครั้ง',
    undo: 'ย้อนกลับ 1 ครั้ง',
    startCamera: 'เปิดกล้องสำหรับ session',
    pause: 'หยุดเวลา',
    resume: 'จับเวลาต่อ',
    finish: 'เสร็จสิ้น',
    stop: 'หยุด session',
    estimate:
      'ไม่มี AI form score หรือการแก้ท่าในเวอร์ชันนี้ เนื่องจากยังไม่มี clinical thresholds ที่ผ่านการอนุมัติ',
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
    stopped: 'หยุดก่อนเสร็จ'
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
    title: 'โปรไฟล์',
    subtitle: 'ข้อมูลบัญชีพื้นฐาน',
    name: 'ชื่อที่ใช้แสดง',
    email: 'อีเมล',
    joined: 'สร้างบัญชีเมื่อ'
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
    account: 'Account',
    system: 'System',
    settingsPrivacy: 'Settings and privacy',
    logoutTitle: 'Sign out',
    logoutConfirm: 'Do you want to sign out?'
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
  chat: {
    title: 'KineGuide AI assistant',
    subtitle:
      'Continue a typed conversation using history from this account. Messages remain stored until you delete the conversation or your account.',
    boundary:
      'KineGuide AI provides educational information only. It does not diagnose, prescribe treatment, or replace a physician or physiotherapist.',
    conversations: 'Conversation list',
    conversation: 'Conversation',
    new: 'Start a new conversation',
    empty: 'No conversations yet. Start one when you are ready.',
    startPrompt: 'Type a message to begin the conversation.',
    messageLabel: 'Message to KineGuide AI',
    placeholder: 'Type your message…',
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
    todayProgress: 'Day 1 of 7',
    viewDetails: 'View details',
    completed: 'Completed',
    start: 'Choose a demo',
    sessions: 'completed sessions',
    streak: 'day streak',
    time: 'recorded time',
    recent: 'Recent activity',
    noRecent: 'No recorded sessions yet',
    weekly: 'Activity overview',
    manual:
      'All figures are self-recorded activity data, not recovery outcomes.'
  },
  exercises: {
    title: 'Movement demo library',
    subtitle: 'Choose a camera-flow demo. This is not a physiotherapy program.',
    search: 'Search demos',
    all: 'All',
    upper: 'Upper body',
    lower: 'Lower body',
    details: 'View details',
    start: 'Test camera',
    empty: 'No matching demos',
    review: 'Clinical review pending',
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
    addRep: 'Add one',
    undo: 'Undo one',
    startCamera: 'Turn on camera for session',
    pause: 'Pause timer',
    resume: 'Resume timer',
    finish: 'Finish',
    stop: 'Stop session',
    estimate:
      'No AI form score or correction is provided because approved clinical thresholds are not available.',
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
    stopped: 'Stopped early'
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
    title: 'Profile',
    subtitle: 'Basic account information',
    name: 'Display name',
    email: 'Email',
    joined: 'Joined'
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
