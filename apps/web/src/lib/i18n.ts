import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const th = {
  common: {
    language: 'English',
    loading: 'กำลังโหลด…',
    error: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
    retry: 'ลองอีกครั้ง',
    skip: 'ข้ามไปยังเนื้อหาหลัก',
    continue: 'ดำเนินการต่อ',
    back: 'ย้อนกลับ',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
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
  nav: {
    public: 'เมนูเว็บไซต์',
    main: 'เมนูหลัก',
    menu: 'เปิดเมนู',
    closeMenu: 'ปิดเมนู',
    home: 'หน้าหลัก',
    assessment: 'ประเมินอาการ',
    plan: 'แผนกิจกรรม',
    exercises: 'ท่าฝึกสาธิต',
    history: 'ประวัติ',
    progress: 'ความก้าวหน้า',
    profile: 'โปรไฟล์',
    settings: 'ตั้งค่า',
    help: 'ช่วยเหลือ'
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
    socialLoading: 'กำลังไปยังหน้าลงชื่อเข้าใช้…',
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
    research: 'ยอมรับการใช้เพื่อการวิจัย',
    accept: 'ยอมรับและดำเนินการต่อ',
    privacy:
      'ข้อมูลอาการเป็นข้อมูลละเอียดอ่อน คุณสามารถถอน consent และลบบัญชีได้เสมอ',
    failed: 'ไม่สามารถบันทึก consent ได้'
  },
  assessment: {
    title: 'เล่าอาการของคุณให้เราฟัง',
    subtitle:
      'คำตอบนี้ใช้จัดระเบียบข้อมูลเท่านั้น ระบบไม่วินิจฉัยหรือคัดกรองความเสี่ยง',
    progress: 'ขั้นตอน {{current}} จาก {{total}}',
    reviewProgress: 'พร้อมตรวจทานคำตอบ',
    start: 'เริ่มประเมิน',
    summary: 'สรุปผล',
    conversation: 'บทสนทนาแบบประเมิน',
    welcome:
      'ขอบคุณที่ให้ข้อมูล เพื่อจัดระเบียบคำตอบเบื้องต้น ขอถามเพิ่มเติมเล็กน้อยครับ',
    area: 'บริเวณที่คุณต้องการบันทึก',
    duration: 'เป็นมานานเท่าใด',
    impact: 'มีผลต่อกิจวัตรมากเพียงใด',
    goal: 'คุณต้องการใช้ระบบเพื่ออะไร',
    submit: 'บันทึกข้อมูล',
    sendAnswer: 'ส่งคำตอบ',
    reviewAnswers: 'ตรวจทานคำตอบ',
    reviewTitle: 'ตรวจทานคำตอบของคุณ',
    reviewBody:
      'ตรวจสอบข้อมูลก่อนบันทึก คำตอบเหล่านี้จะไม่ถูกใช้เพื่อวินิจฉัยหรือสร้างแผนรักษา',
    edit: 'แก้ไข',
    saveAndViewPlan: 'บันทึกและดูแผน',
    areas: {
      lower_back: 'หลังส่วนล่าง',
      knee: 'เข่า',
      shoulder: 'หัวไหล่',
      general_mobility: 'การเคลื่อนไหวทั่วไป',
      prefer_not_to_say: 'ไม่ประสงค์ระบุ'
    },
    durations: {
      lt_week: 'น้อยกว่า 1 สัปดาห์',
      one_to_four_weeks: '1–4 สัปดาห์',
      gt_four_weeks: 'มากกว่า 4 สัปดาห์',
      unsure: 'ไม่แน่ใจ'
    },
    impacts: {
      none: 'ไม่มีผล',
      some: 'มีผลบ้าง',
      much: 'มีผลมาก',
      prefer_not_to_say: 'ไม่ประสงค์ระบุ'
    },
    goals: {
      understand: 'จัดระเบียบข้อมูลของฉัน',
      camera_demo: 'ทดลองกล้องและการเคลื่อนไหว',
      track_activity: 'ติดตามกิจกรรม'
    },
    safety:
      'หากมีอาการรุนแรง ฉุกเฉิน หรือกังวลต่อความปลอดภัย ให้หยุดใช้งานและติดต่อบริการฉุกเฉินหรือผู้เชี่ยวชาญในพื้นที่',
    saved: 'บันทึกข้อมูลแล้ว โดยยังไม่มีการประเมินหรือคำแนะนำทางคลินิก',
    failed: 'ไม่สามารถบันทึกแบบประเมินได้'
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
    cautionOne: 'รายการนี้ไม่ใช้คำตอบแบบประเมินในการเลือกกิจกรรม',
    cautionTwo: 'ระบบยังไม่มีเกณฑ์ทางคลินิกหรือคะแนนความถูกต้องของท่า',
    day: 'วันที่ {{day}}',
    activitiesForDay: 'กิจกรรมสาธิตสำหรับวันที่ {{day}}',
    camera: 'ทดลองกล้องในอุปกรณ์',
    viewExercise: 'ดูรายละเอียดกิจกรรม',
    startExercise: 'ตั้งค่ากล้อง',
    saved: 'บันทึกแบบประเมินแล้ว',
    empty: 'ยังไม่มีรายการสาธิตสำหรับวันนี้'
  },
  dashboard: {
    hello: 'สวัสดี {{name}}',
    ready: 'พร้อมสำหรับกิจกรรมวันนี้หรือยัง?',
    recommended: 'การสาธิตที่แนะนำสำหรับการสำรวจระบบ',
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
    consent: 'จัดการ consent',
    revoke: 'ถอน consent',
    delete: 'ลบบัญชีและข้อมูลทั้งหมด',
    deleteConfirm:
      'ยืนยันว่าต้องการลบบัญชีและข้อมูลที่เกี่ยวข้องอย่างถาวรหรือไม่?',
    deleted: 'ลบบัญชีแล้ว',
    retention:
      'คำตอบแบบประเมินและ session summary ตั้ง retention ไว้ 365 วัน และสามารถลบก่อนกำหนดด้วยการลบบัญชี',
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
    loading: 'Loading…',
    error: 'Something went wrong. Please try again.',
    retry: 'Try again',
    skip: 'Skip to main content',
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
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
  nav: {
    public: 'Website navigation',
    main: 'Main navigation',
    menu: 'Open menu',
    closeMenu: 'Close menu',
    home: 'Home',
    assessment: 'Assessment',
    plan: 'Activity plan',
    exercises: 'Movement demos',
    history: 'History',
    progress: 'Progress',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help'
  },
  landing: {
    features: 'Features',
    eyebrow: 'KineGuide AI · Physiotherapy support prototype',
    title:
      'Explore movement confidently with support that values your privacy',
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
    socialLoading: 'Opening the sign-in provider…',
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
    research: 'Allow research use',
    accept: 'Accept and continue',
    privacy:
      'Symptom data is sensitive. You may withdraw consent and delete your account at any time.',
    failed: 'Unable to save consent.'
  },
  assessment: {
    title: 'Tell us about your concern',
    subtitle:
      'Answers organize information only. The system does not diagnose or screen risk.',
    progress: 'Step {{current}} of {{total}}',
    reviewProgress: 'Ready to review answers',
    start: 'Start assessment',
    summary: 'Summary',
    conversation: 'Assessment conversation',
    welcome:
      'Thank you for sharing. To organize your answers, we have a few short questions.',
    area: 'Area you want to record',
    duration: 'How long has this been present?',
    impact: 'How much does it affect daily activity?',
    goal: 'What do you want to use the system for?',
    submit: 'Save information',
    sendAnswer: 'Send answer',
    reviewAnswers: 'Review answers',
    reviewTitle: 'Review your answers',
    reviewBody:
      'Check the information before saving. These answers are not used to diagnose or create a treatment plan.',
    edit: 'Edit',
    saveAndViewPlan: 'Save and view plan',
    areas: {
      lower_back: 'Lower back',
      knee: 'Knee',
      shoulder: 'Shoulder',
      general_mobility: 'General mobility',
      prefer_not_to_say: 'Prefer not to say'
    },
    durations: {
      lt_week: 'Less than one week',
      one_to_four_weeks: '1–4 weeks',
      gt_four_weeks: 'More than four weeks',
      unsure: 'Unsure'
    },
    impacts: {
      none: 'No impact',
      some: 'Some impact',
      much: 'A lot of impact',
      prefer_not_to_say: 'Prefer not to say'
    },
    goals: {
      understand: 'Organize my information',
      camera_demo: 'Try the camera flow',
      track_activity: 'Track activity'
    },
    safety:
      'For severe, urgent, or safety concerns, stop and contact local emergency services or a qualified professional.',
    saved: 'Saved without clinical evaluation or guidance.',
    failed: 'Unable to save the assessment.'
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
    cautionOne: 'Assessment answers are not used to select these activities.',
    cautionTwo:
      'No approved clinical thresholds or movement-correctness score is available.',
    day: 'Day {{day}}',
    activitiesForDay: 'Demo activities for day {{day}}',
    camera: 'Try the on-device camera',
    viewExercise: 'View activity details',
    startExercise: 'Set up camera',
    saved: 'Assessment saved',
    empty: 'No demo activities are available for this day.'
  },
  dashboard: {
    hello: 'Hello {{name}}',
    ready: 'Ready for an activity?',
    recommended: 'Recommended demo for exploring the system',
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
    consent: 'Manage consent',
    revoke: 'Withdraw consent',
    delete: 'Delete account and all data',
    deleteConfirm: 'Permanently delete the account and all associated data?',
    deleted: 'Account deleted',
    retention:
      'Assessment answers and session summaries have a 365-day retention target and can be removed earlier by deleting the account.',
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

void i18n.use(initReactI18next).init({
  resources: { th: { translation: th }, en: { translation: en } },
  lng: 'th',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
