# Seated Metrics and Personal Calibration Specification

**Status:** Approved Specification (Milestone M2)  
**Date:** 2026-10-14  
**Target:** In-browser MediaPipe Pose Landmarker (Lite), Frontal/Oblique Seated View  
**Clinical & Safety Boundary:** Observational and ergonomic-supportive only; non-diagnostic; clinical verdict = `null`.

---

## 1. วัตถุประสงค์ (Purpose)

เอกสารนี้กำหนดนิยามทางคณิตศาสตร์ หน่วยวัด ระบบพิกัด และโพรโทคอลการสร้าง **Personal Baseline (การสอบเทียบเฉพาะบุคคล)** สำหรับการติดตามท่าทางขณะนั่งทำงานในเบราว์เซอร์ โดยหลีกเลี่ยงการกำหนด "เกณฑ์องศามาตรฐานสากล (Universal Angle Thresholds)" ที่ไม่มีหลักฐานทางคลินิกรองรับ แต่ใช้การเปรียบเทียบการเปลี่ยนแปลงสัมพัทธ์กับ Baseline ของผู้ใช้รายนั้นๆ ในสภาพแวดล้อมจริง

---

## 2. พิกัดและการแปลงค่า (Coordinate System and Mirroring)

**หมายเหตุการประเมิน 2026-10-19:** สูตรในตารางเดิมเป็น legacy normalized-square
geometry ที่ live `seated-baseline-v1` ยังใช้อยู่ ไม่ใช่มุมทางกายวิภาค 3D
ชุดประเมิน offline `seated-image-v2` ส่งขนาดภาพจริงและปรับ `y * height / width`
ก่อนคำนวณมุม/ระยะ เพื่อให้แกนมีสเกลเท่ากัน ยังไม่เปลี่ยน baseline/API/ฐานข้อมูล
หรือเกณฑ์แจ้งเตือนของเว็บ ดู `docs/research/evaluation-plan.md` สำหรับข้อจำกัด
และเงื่อนไขก่อนนำผลไปใช้จริง

1. **ระบบพิกัด (Coordinate Space):**
   - พิกัดของ MediaPipe Normalized Landmarks: $x \in [0, 1]$ (ซ้ายไปขวา), $y \in [0, 1]$ (บนลงล่าง), $z$ (ความลึกสัมพัทธ์จากระนาบสะโพก)
   - หน้าจอการแสดงผลแสดงผลแบบ Mirroring (กลับด้านแกน X สำหรับกล้องหน้า) เพื่อความคุ้นเคยของผู้ใช้ แต่การคำนวณทางคณิตศาสตร์จะรักษาทิศทางกายวิภาค (Left vs Right) อย่างสม่ำเสมอ
2. **เกณฑ์ความเชื่อมั่นขั้นต่ำ (Confidence & Visibility Threshold):**
   - ทุก Landmark ที่จำเป็นต้องมี `visibility >= 0.5`
   - ค่าพิกัด $x, y$ ต้องเป็นจำนวนจริงจำกัด (`Number.isFinite`) และอยู่ในช่วง $[0, 1]$

---

## 3. นิยามตัวชี้วัดท่าทางขณะนั่ง (Seated Metrics Definition)

| Metric Identifier | Landmarks ที่ใช้ | สูตรคำนวณ | หน่วย | ความหมายเชิงการสังเกต |
| :--- | :--- | :--- | :--- | :--- |
| `shoulderSlopeDegrees` | Left Shoulder (11), Right Shoulder (12) | $\theta = \arctan\left(\frac{y_{12} - y_{11}}{x_{12} - x_{11}}\right) \times \frac{180}{\pi}$ | องศา (deg) | ความเอียงของแนวระดับไหล่ทั้งสองข้างเทียบกับแนวราบ (ค่า 0 = ขนานแนวราบ) |
| `headTiltDegrees` | Left Ear (7) หรือ Eye (2), Right Ear (8) หรือ Eye (5) | $\theta = \arctan\left(\frac{y_{8} - y_{7}}{x_{8} - x_{7}}\right) \times \frac{180}{\pi}$ | องศา (deg) | ความเอียงของศีรษะเทียบกับแนวราบ |
| `torsoInclinationDegrees` | Midpoint Shoulders $\frac{P_{11}+P_{12}}{2}$, Midpoint Hips $\frac{P_{23}+P_{24}}{2}$ (เฉพาะโหมด `full_torso`) | มุมของเวกเตอร์แกนลำตัวเทียบกับแนวดิ่ง ($y$-axis) | องศา (deg) | ความเอียงของแนวกระดูกสันหลัง/ลำตัวส่วนบนเทียบกับแนวดิ่ง (เป็น `null` ในโหมด `upper_body`) |
| `eyeShoulderDistanceRatio` | Eye Midpoint, Shoulder Midpoint, Shoulder Width | $\frac{\text{dist}(\text{Eyes}, \text{Shoulders})}{\text{dist}(P_{11}, P_{12})}$ | ไร้หน่วย (Ratio) | สัดส่วนระยะห่างระหว่างระดับสายตากับแนวไหล่เทียบกับความกว้างไหล่ ใช้ตรวจจับการก้มศีรษะหรือการห่อไหล่เทียบกับ Baseline |

### โหมดมุมมอง (Framing Modes)

1. **`upper_body` (ค่าเริ่มต้นเมื่อโต๊ะบังสะโพก):** ใช้จุดอ้างอิง `[0, 2, 5, 11, 12]` รองรับกล้องหน้า/แล็ปท็อปทั่วไป ตัวชี้วัดลำตัว (`torsoInclinationDegrees`) เป็น `null`
2. **`full_torso`:** เมื่อจุดสะโพก `[23, 24]` มีความเชื่อมั่น $\ge 0.5$ ระบบจะเพิ่มการสังเกตมุมเอียงของลำตัวโดยอัตโนมัติ

---

## 4. โพรโทคอลการสอบเทียบเฉพาะบุคคล (Personal Calibration Protocol) — `seated-baseline-v1`

1. **ขั้นตอนการสอบเทียบ (Calibration Steps):**
   - ผู้ใช้นั่งในท่าที่สบายและตั้งตรงในตำแหน่งทำงานปกติ
   - สอบเทียบในหน้า Live หลังผู้ใช้เริ่มกล้อง ระบบเก็บตัวอย่างเฟรมที่มีสถานะ `ready` และผ่านการตรวจคุณภาพ โดยมีเป้าหมาย 30 ตัวอย่าง; ระยะเวลาจริงขึ้นกับเฟรมที่ใช้ได้
   - คำนวณค่าเฉลี่ย ($\mu$) และส่วนเบี่ยงเบนมาตรฐาน ($\sigma$) ของแต่ละ Metric
   - บันทึกเป็น `PersonalBaseline` ประจำเซสชันในหน่วยความจำเบราว์เซอร์
2. **อายุและการหมดอายุของ Baseline (Validity & Expiry):**
   - Baseline มีผลเฉพาะในเซสชันปัจจุบัน (In-memory เท่านั้น ไม่เก็บลง LocalStorage ถาวร)
   - อายุการใช้งานสูงสุด: 8 ชั่วโมง หรือจนกว่าจะจบเซสชัน
   - หาก framing mode เปลี่ยน หรือความกว้างไหล่เทียบกับ baseline เปลี่ยนเกิน 35% ให้แนะนำการสอบเทียบใหม่ (`recalibration_recommended`); การตรวจนี้ไม่ได้จำแนกท่านั่งหรือยืนยันมุมกล้อง
3. **การจัดการความเป็นส่วนตัว (Privacy Discipline):**
   - ไม่มีการอัปโหลด Landmark Stream ดิบไปยังเซิร์ฟเวอร์
   - ข้อมูล Baseline เก็บเฉพาะค่าสถิติเชิงตัวเลข ($\mu, \sigma$) ในหน่วยความจำ ไม่เก็บภาพหรือพิกัดใบหน้า
   - การล้างเซสชันหรือออกจากระบบจะล้าง Baseline ทันที

---

## 5. การจำแนกสถานะเชิงเทคนิค (Deterministic Classification)

เมื่อเทียบกับ `PersonalBaseline`:
- **`good_alignment`**: ค่า Metrics ทั้งหมดเบี่ยงเบนจาก $\mu$ ไม่เกินขอบเขตปกติ ($|\Delta| \le \text{tolerance}$)
- **`needs_adjustment`**: ค่า Metric มีการเบี่ยงเบนเกินกว่าขอบเขตที่ตั้งไว้ต่อเนื่องเกินระยะเวลาที่กำหนด (Temporal Debounce)
- **`low_confidence`**: Landmark visibility เฉลี่ยต่ำกว่า 0.5 หรือมีความคมชัดต่ำ
- **`unable_to_assess`**: ขาดจุดอ้างอิงที่จำเป็น, มุมมองกล้องไม่รองรับ, หรือมีคนมากกว่า 1 คนในเฟรม

*หมายเหตุ: ไม่มีการระบุคำว่า "ท่านั่งผิดทางคลินิก" หรือ "จะทำให้ปวดหลัง" โดยเด็ดขาด*

Baseline เป็นค่าอ้างอิงส่วนบุคคล ไม่ใช่หลักฐานว่าท่าปลอดภัยหรือถูกต้องทางการแพทย์ การตรวจจับ sit/stand อัตโนมัติยังไม่มี และเวลาที่สรุปไม่ใช่เวลานั่งที่ผ่านการตรวจสอบ ดู [SF1 flow](seated-monitoring-flow.md)

`usePostureMonitor` ไม่ใช้ landmarks ที่ค้างจากสถานะอื่นแทน `ready`; feedback ที่เฟรมไม่สดเกิน 1.5 วินาทีจะถูกถอน และการ pause ระงับการสะสมช่วงเวลา การสอบเทียบใหม่รักษายอดที่สะสมก่อนหน้าไว้ ตัวสะสมปัดเศษวินาทีแต่ละประเภทลงก่อนส่งสรุป; ช่องว่างที่ไม่ได้สังเกตไม่ถูกนับเป็นสถานะท่าทาง

เมื่อเริ่มสอบเทียบใหม่ active baseline เดิมจะถูกยกเลิกและหยุดสะสมเวลา หากสอบเทียบไม่สำเร็จ เฟรมหลังจากนั้นจะไม่เพิ่มยอด แต่ยอดเดิมและ framing ของสรุปยังคงอยู่ สรุปหนึ่งเซสชันรวม `upper_body` กับ `full_torso` ไม่ได้: การสอบเทียบใหม่ด้วยโหมดต่างจากสรุปเดิมจะล้มเหลวด้วย `mixed_framing` ให้กลับไปใช้ framing เดิมหรือเริ่มเซสชันใหม่
