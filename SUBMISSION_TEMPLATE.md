# SUBMISSION - Exit Exam MVC 1/2569 (เสาร์บ่าย)

## 1. วิธีเปิดโปรแกรม
- ภาษา/เฟรมเวิร์ก: JavaScript (HTML + Vanilla)
- Entry point / คำสั่งเปิดโปรแกรม:
  1. เปิดโฟลเดอร์โปรเจกต์ใน terminal แล้วรัน python -m http.server 8080
  2. เปิดเบราว์เซอร์ที่ http://localhost:8080

## 2. ตารางเชื่อมโยง Requirements

| Requirement | Model / Domain | Controller / Action | View / Screen |
|---|---|---|---|
| R1 แสดงผล | Member, ChangeRequest | AppController.refresh() | index.html + MemberView.renderTable , RequestView.renderList |
| R2 สร้างคำขอเปลี่ยนบทบาท | ChangeRequestStore.create() | AppController.createRequest() | index.html |
| R3 โหวต | ChangeRequest.addVote(), Member.isActive() | AppController.vote() | RequestView.renderList |
| R4 สรุปผลและเปลี่ยนบทบาท | ChangeRequest.addVote() + Member.changeRole() | AppController.vote() | RequestView.renderDetail |
| R5 ยกเลิก + สรุปตามสถานะ + แจ้ง error | ChangeRequest.cancel() , ChangeRequestStore.groupByStatus() | AppController.cancelRequest(), refresh() | RequestView.renderSummary, RequestView.showMessage |

## 3. ผลการทดสอบ

| กรณี | ผ่าน/ไม่ผ่าน | หมายเหตุ (เฉพาะที่จำเป็น) |
|---|---|---|
| T1 | | |
| T2 | | |
| T3 | | |
| T4 | | |
| T5 | | |
| T6 | | |

## 4. ความแตกต่างระหว่างแบบที่ออกกับโปรแกรมจริง (ถ้ามี)
ระบุไม่เกิน 3 ข้อ
1. เรื่องความปลอดภัย ใช้การเลือก dropdown เลือกสมาชิกที่ แทนระบบ Login 
2. เก็บ state ใน memory ระหว่างรันเท่านั้น ไม่ได้ทำการอัพเดตข้อมูลจริง
3. หน้าตา ux/ui ที่ไม่ค่อยเป็นมิตรกับ User

## 5. บันทึกการใช้ Generative AI
หากไม่ได้ใช้ ให้ระบุ **ไม่ได้ใช้ Generative AI**

| เวลาโดยประมาณ | เครื่องมือ | ใช้เพื่ออะไร | นำคำแนะนำไปใช้อย่างไร |
|10 นาที|claude|สรุป requiment|จะได้มาเป็น R1-R6 แบบเข้าใจ flow ง่ายๆและนำมาออกแบบ|
|30 - 50 นาที |claude | ช่วยอธิบายวิธีการออกแบบ class diagram and sequence diagram | |
| | | | |
| | | | |
