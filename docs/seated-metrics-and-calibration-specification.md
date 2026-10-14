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
| `torsoInclinationDegrees` | Midpoint Shoulders $\frac{P_{11}+P_{12}}{2}$, Midpoint Hips $\frac{P_{23}+P_{24}}{2}$ | มุมของเวกเตอร์แกนลำตัวเทียบกับแนวดิ่ง ($y$-axis) | องศา (deg) | ความเอียงของแนวกระดูกสันหลัง/ลำตัวส่วนบนเทียบกับแนวดิ่ง |
| `eyeShoulderDistanceRatio` | Eye Midpoint, Shoulder Midpoint, Shoulder Width | $\frac{\text{dist}(\text{Eyes}, \text{Shoulders})}{\text{dist}(P_{11}, P_{12})}$ | ไร้หน่วย (Ratio) | สัดส่วนระยะห่างระหว่างระดับสายตากับแนวไหล่เทียบกับความกว้างไหล่ ใช้ตรวจจับการก้มศีรษะหรือการห่อไหล่เทียบกับ Baseline |

---

## 4. โพรโทคอลการสอบเทียบเฉพาะบุคคล (Personal Calibration Protocol)

1. **ขั้นตอนการสอบเทียบ (Calibration Steps):**
   - ผู้ใช้นั่งในท่าที่สบายและตั้งตรงในตำแหน่งทำงานปกติ
   - ระบบเก็บตัวอย่างเฟรมที่มีความสมบูรณ์ทางเทคนิค (Technical Visibility Gate ผ่าน) ติดต่อกัน 30-60 เฟรม (~2-3 วินาที)
   - คำนวณค่าเฉลี่ย ($\mu$) และส่วนเบี่ยงเบนมาตรฐาน ($\sigma$) ของแต่ละ Metric
   - บันทึกเป็น `PersonalBaseline` ประจำเซสชันในหน่วยความจำเบราว์เซอร์
2. **อายุและการหมดอายุของ Baseline (Validity & Expiry):**
   - Baseline มีผลเฉพาะในเซสชันปัจจุบัน (In-memory เท่านั้น ไม่เก็บลง LocalStorage ถาวร)
   - อายุการใช้งานสูงสุด: 8 ชั่วโมง หรือจนกว่าจะจบเซสชัน
   - หากตรวจพบว่ากรอบภาพ (Bounding Box) เปลี่ยนแปลงขนาดหรือตำแหน่งเกินกว่า 30% หรือมุมกล้องเปลี่ยน ให้ถือว่า Baseline เป็นสถานะ `stale` และแนะนำให้ผู้ใช้สอบเทียบใหม่ (`recalibration_recommended`)
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
