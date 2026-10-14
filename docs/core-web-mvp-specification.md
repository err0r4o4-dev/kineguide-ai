# Core Web MVP Specification and Acceptance Scenarios

**Status:** Approved for M1 implementation (Gate A)  
**Date:** 2026-10-14 · Aligned with commit `601cec0` and `TODO.md` Milestone M0  
**Scope:** Browser / React PWA, Go API, PostgreSQL persistence, and local MediaPipe Pose Landmarker

---

## 1. วัตถุประสงค์และขอบเขตผลิตภัณฑ์ (Purpose and Product Boundary)

เอกสารนี้กำหนดข้อตกลงทางเทคนิค (Technical Specification) และเกณฑ์การตรวจรับ (Acceptance Scenarios) สำหรับ **Core Web MVP (Gate A)** ของระบบ KineGuide AI

### ข้อจำกัดและการสื่อสาร (Safety & Clinical Disclaimers)
- **ภาษาไทย:** KineGuide AI เป็นระบบต้นแบบเพื่อการศึกษาและการรับรู้พฤติกรรมการนั่งทำงาน (Ergonomic Awareness & Technical Session Monitoring) เท่านั้น ระบบไม่วินิจฉัยโรคหรือการบาดเจ็บ ไม่ระบุสาเหตุของอาการปวด ไม่สั่งการรักษาหรือท่าออกกำลังกาย และไม่ใช้ทดแทนแพทย์ นักกายภาพบำบัด หรือผู้เชี่ยวชาญ การตรวจพบจุดสำคัญของร่างกาย (Landmarks) หรือระยะเวลาในเซสชัน ไม่ถือเป็นหลักฐานยืนยันว่าผู้ใช้กำลังนั่งอยู่จริงหรือมีท่านั่งที่ถูกต้องตามหลักการแพทย์
- **English:** KineGuide AI is an educational and ergonomic awareness prototype for technical session monitoring. It does not diagnose disease or injury, determine the cause of pain, prescribe treatment or exercise, or replace a physician, physiotherapist, ergonomist, or qualified healthcare professional. Technical landmark detection and session duration do not establish that a user is seated or that their posture is medically correct.

---

## 2. โครงสร้างเส้นทางและ Flow ผู้ใช้ (User Journey & Routes)

### 2.1 เส้นทางใน Core Web MVP
1. **Landing (`/`)**: หน้าแรก แสดงข้อมูลผลิตภัณฑ์และขอบเขตความปลอดภัย
2. **Authentication (`/login`, `/register`, `/auth/callback`)**:
   - สมัครและเข้าสู่ระบบด้วย Email/Password หรือ Social OAuth (Google/Facebook)
   - จัดเก็บ Access Token ในหน่วยความจำ (In-memory) และ Refresh Token ใน HttpOnly cookie
3. **Consent (`/consent`)**:
   - บังคับ Consent เวอร์ชันปัจจุบัน (`prototype-v3`) ก่อนเข้าใช้งานแดชบอร์ด
   - สิทธิ์ขั้นต่ำที่ต้องยอมรับ: `camera_processing` (ยินยอมประมวลผลกล้องในเครื่อง) และ `session_summary_storage` (ยินยอมบันทึกสรุปเซสชัน)
4. **Dashboard (`/app`)**:
   - แสดงสถิติ: จำนวนเซสชันที่เสร็จสมบูรณ์ (`completed_sessions`), เวลารวม (`total_seconds`), และ streak ต่อเนื่อง
   - รายการเซสชันล่าสุด (Recent Sessions)
5. **Camera Setup (`/app/monitor`)**:
   - คำอธิบายการประมวลผลในเครื่อง (Privacy Notice)
   - ผู้ใช้ยืนยันโหมดท่านั่ง (Seated Setup Confirmation checkbox)
   - ทดสอบและขอสิทธิ์กล้อง (Camera Permission & Live Preview)
   - เริ่มเซสชัน (`createSession`) -> บันทึกลง PostgreSQL ผ่าน Go API
6. **Live Session (`/app/sessions/:id/live`)**:
   - เปิดกล้องและรัน MediaPipe Pose Landmarker Lite ใน Web Worker / Browser
   - แสดง Technical Visibility Overlay และสถานะกล้อง
   - นับเวลาเซสชัน (`elapsed_seconds`) พร้อมปุ่ม Pause / Resume
   - ปุ่มจบเซสชัน (Finish Session) -> อัปเดตสถานะเป็น `completed` ผ่าน Go API
7. **Session Summary (`/app/sessions/:id/summary`)**:
   - แสดงระยะเวลาที่ผ่านไปจริง (`elapsed_seconds`)
   - แสดงสถานะอย่างตรงไปตรงมาว่า "ยังไม่มีการประเมินคะแนนท่านั่งหรือเกณฑ์ทางการแพทย์" (`summaryUnavailableTitle`)
8. **History & Analytics (`/app/history`, `/app/analytics`)**:
   - ประวัติเซสชันย้อนหลังและสถิติภาพรวม
9. **Settings & Profile (`/app/settings`, `/app/profile`, `/app/help`)**:
   - สลับภาษาไทย/อังกฤษ, การจัดการ Consent, ลบบัญชีผู้ใช้, คำแนะนำการใช้งาน

### 2.2 บริการเสริม (Optional Services)
- **AI Chat (`/app/chat`)**: บริการเสริมที่ต้องมี `ai_chat_storage` consent แยกต่างหาก และทำงานผ่าน Disabled/Mock/OpenRouter adapter บน Go -> Python ไม่เป็นส่วนหนึ่งของเส้นทางหลักในการตรวจจับท่าทางและไม่อยู่ในเงื่อนไขการผ่านของ Gate A

---

## 3. นิยามสถานะทางเทคนิค (Technical Status Semantics)

ใน Core Web MVP (Gate A) ระบบจะรายงานเฉพาะ **สถานะความพร้อมทางเทคนิค (Technical Status)** เท่านั้น จะไม่มีการให้คะแนน Good/Bad หรืออ้างความถูกต้องของท่านั่ง:

| สถานะเทคนิค | เงื่อนไขการตรวจจับ | ข้อความแนะนำผู้ใช้ |
| :--- | :--- | :--- |
| `ready` | ตรวจพบ landmarks สำคัญ (ศีรษะ, ไหล่, ข้อศอก, ข้อมือ, สะโพก) ครบ และ visibility >= 0.5 | กล้องพร้อมใช้งานและมองเห็นจุดสำคัญชัดเจน (ไม่ใช่การยืนยันท่านั่งถูกต้อง) |
| `adjust_camera` | จุดสำคัญบางส่วนหลุดกรอบภาพ หรืออยู่นอกระยะที่เหมาะสม | กรุณาปรับมุมกล้องหรือระยะห่างให้เห็นลำตัวท่อนบนชัดเจน |
| `no_pose` | ไม่พบคนในกรอบภาพ | ไม่พบบุคคลในเฟรมภาพ |
| `multiple_poses` | ตรวจพบบุคคลมากกว่า 1 คนในเฟรม | ตรวจพบมากกว่า 1 คน กรุณาให้อยู่ในเฟรมเพียงคนเดียว |
| `low_confidence` | ตรวจพบคนแต่ visibility score เฉลี่ย < 0.5 | ความคมชัดหรือแสงสว่างไม่เพียงพอ |
| `unsupported_activity` | อยู่นอกเหนือท่าทางที่รองรับ | ท่าทางหรือมุมมองไม่รองรับ |

### กฎสำหรับ Posture Metrics ใน Gate A:
- ตัวชี้วัดเช่น `sitting_seconds`, `standing_seconds`, `good_alignment_seconds`, `needs_adjustment_seconds`, `alert_count`, `break_count` จะต้องแสดงสถานะ **`unavailable` / `not_measured`** หรือปิดการแสดงผล
- ห้ามนำค่าศูนย์ (`0`) หรือคะแนนสมมติมาแสดงเสมือนว่าเป็นผลการวัดจริง

---

## 4. อุปกรณ์ มุมกล้อง และเงื่อนไขที่ไม่รองรับ (Device, Framing & Exclusions)

### 4.1 อุปกรณ์และสภาพแวดล้อมที่รองรับ
- **อุปกรณ์:** เครื่องคอมพิวเตอร์ตั้งโต๊ะ (Desktop), แล็ปท็อป (Laptop), หรือแท็บเล็ตที่มีเว็บแคมในตัวหรือต่อภายนอก
- **หน้าจอและการวางตัว:** แนวนอน (Landscape orientation), ความกว้างหน้าจอตั้งแต่ 320px ขึ้นไป (Responsive: 320, 768, 1024, 1440px)
- **เบราว์เซอร์:** เบราว์เซอร์มาตรฐานที่รองรับ WebRTC / MediaStream API (Chromium, Firefox, Safari)
- **มุมมองกล้อง:** มุมตรงด้านหน้า (Frontal view) หรือเฉียงไม่เกิน 45 องศา เห็นศีรษะ ไหล่สองข้าง และลำตัวท่อนบนอย่างชัดเจน
- **สภาพแสง:** แสงสว่างสม่ำเสมอ ไม่ย้อนแสง ไม่มืดสนิท

### 4.2 สภาพและพฤติกรรมที่ไม่รองรับ (Unsupported Conditions)
- การถือสมาร์ตโฟนด้วยมือแนวตั้งขณะเดินหรือเคลื่อนไหว
- มุมมองด้านข้าง 90 องศา (Side profile) ใน Gate A (ต้องรอเกณฑ์การทดลองและ Calibrate ใน M2)
- บุคคลในเฟรมมากกว่า 1 คน
- การบดบังลำตัวท่อนบน (เช่น ผ้าห่มหนา, เก้าอี้พนักสูงที่บังไหล่จนมิด)
- สภาพย้อนแสงจ้า (Silhouette) จน Landmark visibility ต่ำกว่า 0.5

---

## 5. นิยามระยะเวลาเซสชันและการจัดการ Lifecycle (Session Duration & Lifecycle)

### 5.1 นิยามเวลาเซสชัน (`elapsed_seconds`)
- `elapsed_seconds` คือ เวลาจริง (Wall-clock seconds) ที่เซสชันอยู่ในสถานะ **`active` (กำลังทำงาน)** โดยไม่นับรวมช่วงเวลาที่หยุดชั่วคราว (`paused`)
- `elapsed_seconds` เป็นเวลาทางเทคนิคของเซสชัน **ไม่ใช่เวลาที่ยืนยันว่าผู้ใช้นั่งจริงหรือมีท่านั่งที่ดี**

### 5.2 การควบคุมสถานะ (Pause / Resume / Finish)
- **Pause:** ผู้ใช้กดปุ่มหยุดชั่วคราว -> หยุดตัวนับเวลา (`interval`), หยุดส่งเฟรมเข้า Pose Landmarker, สถานะเซสชันในเครื่องเป็น `paused`
- **Resume:** ผู้ใช้กดเล่นต่อ -> เริ่มนับเวลาต่อจากเดิม และเปิดการประมวลผลเฟรมต่อ
- **Finish:** ผู้ใช้กดจบเซสชัน -> ส่ง `PATCH /v1/sessions/:id` ด้วย `status: "completed"` และ `elapsed_seconds` บันทึกลง PostgreSQL สำเร็จแล้วนำทางไปยังหน้า Summary

### 5.3 การจัดการข้อผิดพลาดและ Exit Paths (Cleanup Discipline)
- **สลับแท็บ / ยุบจอ (`document.visibilitychange`):** หยุดตัวนับเวลา หรือบันทึกสถานะตามนโยบาย ไม่ประมวลผลเฟรมที่ว่างเปล่า
- **ปิดหน้า / เปลี่ยนเส้นทาง / กด Reload / ออกจากระบบ:**
  - ต้องสั่ง `track.stop()` กับทุก `MediaStreamTrack` ของกล้อง
  - เคลียร์ `requestAnimationFrame`, Web Workers, และ `setInterval` ทั้งหมด
  - ไม่ทิ้งเซสชันขยะที่เปิดค้างโดยไม่มีการจัดการ (Unfinished sessions จัดการผ่าน status หรือ timeout)
- **ข้อผิดพลาดในการบันทึก (Network / Server Error):** แจ้งเตือนผู้ใช้และมีปุ่มให้ลองบันทึกใหม่ (Retry) ไม่ทำเป็นว่าบันทึกสำเร็จโดยที่เซิร์ฟเวอร์ยังไม่ตอบรับ

---

## 6. การรักษาความเข้ากันได้ย้อนหลัง (Backward Compatibility)

### 6.1 เส้นทางเว็บเดิม (Route Aliases)
- `/app/progress` ทำการ Redirect (HTTP/Router) ไปยัง `/app/analytics`
- `/app/activities` และ `/app/exercises` ทำการ Redirect ไปยัง `/app/monitor`

### 6.2 สัญญาณและ API เดิม (Backend Compatibility)
- Endpoints เดิมใน Go API เช่น `/v1/exercises`, `/v1/activities`, `/v1/assessments`, `/v1/activity-plan` ยังคงอยู่เพื่อรองรับ client เก่าหรือ component ที่ขึ้นต่อกัน
- ตารางใน PostgreSQL และโครงสร้างเดิมจะไม่มีการลบหรือ Drop จนกว่าจะมี Migration Plan ที่ผ่านการอนุมัติ

---

## 7. เกณฑ์การตรวจรับตามสถานการณ์ (Acceptance Scenarios)

### Scenario 1: การป้องกันเส้นทางเมื่อไม่ได้เข้าสู่ระบบ
- **Given** ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
- **When** ผู้ใช้พยายามเข้าหน้า `/app`, `/app/monitor`, หรือ `/app/sessions/test-id/live`
- **Then** ระบบต้องเปลี่ยนเส้นทาง (Redirect) ไปยังหน้า `/login` อย่างปลอดภัย

### Scenario 2: การตรวจสอบและบังคับ Consent
- **Given** ผู้ใช้เข้าสู่ระบบแล้ว แต่ยังไม่ได้ยินยอม Consent เวอร์ชัน `prototype-v3`
- **When** ผู้ใช้เปิดหน้า `/app`
- **Then** ระบบต้องเปลี่ยนเส้นทางไปยังหน้า `/consent` และไม่อนุญาตให้เปิดกล้องหรือสร้างเซสชันจนกว่าจะยินยอมสิทธิ์ `camera_processing` และ `session_summary_storage`

### Scenario 3: การจัดการเมื่อกล้องถูกปฏิเสธสิทธิ์ (Permission Denied)
- **Given** ผู้ใช้อยู่ในหน้า `/app/monitor` และยืนยันโหมดท่านั่งแล้ว
- **When** ผู้ใช้กดเปิดกล้อง แต่เบราว์เซอร์หรือผู้ใช้ปฏิเสธสิทธิ์ (Permission Denied)
- **Then** ระบบต้องแสดงข้อความอธิบายเหตุผลและวิธีแก้ไขอย่างสุภาพ และไม่อนุญาตให้กด "เริ่มเซสชัน"

### Scenario 4: การยืนยัน Seated Setup ก่อนเปิดกล้อง
- **Given** ผู้ใช้อยู่ในหน้า `/app/monitor`
- **When** ผู้ใช้ยังไม่ได้ทำเครื่องหมายถูกที่ช่อง "ยืนยันการตั้งค่าโหมดท่านั่ง"
- **Then** ปุ่มเปิดกล้องและการเริ่มเซสชันต้องถูกปิดใช้งาน (Disabled) พร้อมคำอธิบายที่เข้าถึงได้

### Scenario 5: การสร้างเซสชันจริงในฐานข้อมูล
- **Given** ผู้ใช้เปิดกล้องสำเร็จและเห็นภาพพรีวิวในหน้า `/app/monitor`
- **When** ผู้ใช้กดปุ่ม "เริ่มเซสชัน"
- **Then** ระบบต้องส่งคำขอ `POST /v1/sessions` ไปยัง Go API, สร้างระเบียนใน PostgreSQL, และนำทางไปยัง `/app/sessions/:id/live` โดย `:id` ต้องเป็น UUID จริงจากเซิร์ฟเวอร์

### Scenario 6: การทำงานใน Live Session และ Technical Feedback
- **Given** ผู้ใช้อยู่ในหน้า `/app/sessions/:id/live`
- **When** กล้องทำงานและตรวจพบบุคคล
- **Then** ตัวนับเวลาต้องเพิ่มขึ้นวินาทีละ 1 ครั้ง, Canvas แสดง Overlay จุดข้อต่อ, และแสดงสถานะเทคนิค (`ready`, `adjust_camera`, `no_pose` ฯลฯ) อย่างถูกต้องโดยไม่มีการอ้างคำว่า "ท่านั่งถูกต้อง"

### Scenario 7: การหยุดชั่วคราวและเล่นต่อ (Pause / Resume)
- **Given** เซสชันกำลังทำงานในหน้า Live
- **When** ผู้ใช้กดปุ่ม "หยุดชั่วคราว" (Pause)
- **Then** เวลาต้องหยุดเดิน การประมวลผลเฟรมต้องหยุดลง และปุ่มเปลี่ยนเป็น "เล่นต่อ" (Resume)
- **When** ผู้ใช้กดปุ่ม "เล่นต่อ" (Resume)
- **Then** เวลาต้องเดินต่อจากค่าวินาทีเดิมที่หยุดไว้

### Scenario 8: การจบเซสชันและบันทึกเวลาจริง
- **Given** ผู้ใช้อยู่ในหน้า Live และมีเวลาเดินไปแล้ว เช่น 45 วินาที
- **When** ผู้ใช้กดปุ่ม "จบเซสชัน" (Finish Session)
- **Then** ระบบต้องส่ง `PATCH /v1/sessions/:id` ด้วย `status: "completed"` และ `elapsed_seconds: 45` ไปยัง Go API และเมื่อสำเร็จจึงนำทางไปยัง `/app/sessions/:id/summary`

### Scenario 9: การแสดงผลในหน้าสรุปเซสชัน (Summary)
- **Given** ผู้ใช้อยู่ในหน้า `/app/sessions/:id/summary` ของเซสชันที่เสร็จสมบูรณ์
- **When** หน้าจอโหลดข้อมูลเซสชัน
- **Then** แสดงเวลา `elapsed_seconds` ที่บันทึกไว้ และแสดงกล่องข้อความชัดเจนว่าคะแนนท่าทางยังไม่เปิดให้บริการ (`summaryUnavailableTitle`)

### Scenario 10: การปล่อยคืนทรัพยากรกล้อง (Resource Cleanup)
- **Given** ผู้ใช้อยู่ในหน้า Setup หรือ Live ที่กล้องกำลังทำงานอยู่
- **When** ผู้ใช้เปลี่ยนหน้า (Navigate), ปิดแท็บ, หรือออกจากระบบ (Sign out)
- **Then** ไฟสถานะกล้องของเครื่องต้องดับลง, ทุก `MediaStreamTrack` ถูกเรียก `.stop()`, และไม่มี memory leak จาก Worker หรือ animation frames
