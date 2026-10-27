# USB controllers: Unity Editor and WebGL

## เตรียม ESP32

อัปโหลด `Sensor_Controller/Sensor_Controller.ino` จาก repo นี้ลง ESP32 บอร์ดเดียว เลือก board/port ให้ตรงกับของจริง ใช้ HX711 by Rob Tillaart 0.6.5 ที่ติดตั้งอยู่ ไม่ต้องแฟลชสลับเมื่อเปลี่ยน FSR/Load Cell ในเกม ปิด Serial Monitor ก่อนเชื่อมจาก Unity หรือ Browser เพราะพอร์ตเดียวเปิดพร้อมกันไม่ได้

| ช่อง | Pin | Calibration ชั่วคราว |
|---|---|---|
| FSR ซ้าย (ตัวใหม่ใน 2.1.0) | GPIO34 | ปล่อย 4095, กดอ้างอิง 156.5 |
| FSR ขวา | GPIO35 | ปล่อย 4095, กดอ้างอิง 156.5 |
| Load Cell ซ้าย 1 kg | DT32 / SCK18 | −2449.84 counts/g |
| Load Cell ขวา 5 kg | DT33 / SCK4 | −429.11 counts/g |

สเก็ตช์ส่ง JSON หนึ่งบรรทัดประมาณ 20 ครั้ง/วินาที ที่ 115200 baud ค่า HX711 อัปเดตตามความเร็วตัวเซนเซอร์ ดูรายละเอียดเพิ่มเติมใน `Sensor_Controller/README.md`

## Unity Editor บน Windows

1. เปิดราก repo ที่มี `Assets`, `Packages`, `ProjectSettings` ด้วย Unity 6000.3.25f1 แล้ว Play จาก `Assets/CPS/Scenes/Boot.unity` (checkout ที่ใช้พัฒนาเดิมคือ `C:\Users\Arc\Unity\CPS-Project`)
2. หน้า Home กด **Controller** แล้วเลือก Keyboard / FSR / Load Cell ค่านี้เป็น Global ไม่ผูกกับ Profile
3. สำหรับเซนเซอร์ กด Refresh เลือก COM ของ ESP32 แล้ว Connect USB ไม่มีการเปิดพอร์ตหรืออัปโหลดบอร์ดให้อัตโนมัติ
4. FSR แสดงระดับสัมพัทธ์ 0–100% พร้อมใช้งานเมื่อมีข้อมูลสดทั้งสองฝั่ง ไม่แปลงเป็น N
5. Load Cell: เอาแรงกด/น้ำหนักออกจาก **ทั้งสองตัว** แล้วกด Tare รอทั้งสองช่องพร้อม จึงเริ่มเล่น ค่าเป็น **Estimated Force (N)** ไม่มีเปอร์เซ็นต์สมมติ
6. เลือก Profile/ความยาก แล้ว Start Cooking ใช้ตัวควบคุมที่เลือกได้ทั้งพื้นที่ฝึกและในเกม

Keyboard ยังใช้ A / ลูกศรซ้าย และ D / B / ลูกศรขวา ส่วน Spacebar / Escape ใช้ Pause / Resume ไม่ทำงานระหว่างพิมพ์ชื่อหรือเปิด Settings/Controller การ Resume นับถอยหลัง 3 วินาที

## WebGL

ใช้ Browser ที่รองรับ Web Serial เช่น Chrome บน Desktop เปิดเกมผ่าน HTTPS หรือ localhost จากนั้นเข้า Controller และกด Connect USB เพื่อเลือกพอร์ตจากหน้าต่างของ Browser ต้องกดด้วยตนเอง Browser ที่ไม่มี Web Serial ยังเล่น Keyboard ได้

การอนุญาต USB เป็นของแต่ละ Browser/origin ไม่แชร์กับ Unity Editor และไม่ใช่ Bluetooth/MQTT ปิด Editor/Serial Monitor ที่ใช้พอร์ตนั้นก่อนเชื่อม ไม่รองรับการเชื่อม USB นี้จาก iPhone

## เมื่อข้อมูลขาดหาย

เกมหยุดอัตโนมัติเมื่อข้อมูลเก่า/ช่องที่เลือกไม่พร้อม/พอร์ตขาด/บอร์ดรีบูต โดยไม่เดินเวลา เสีย HP หรือสะสมสถิติต่อ เปิด **Controller** จากหน้า Pause เพื่อเชื่อมใหม่หรือ Tare หลังข้อมูลกลับมาเกมยังรอให้กด Keep Cooking หรือ Spacebar เอง เปลี่ยนชนิด Controller ได้เมื่อกลับ Home เท่านั้น

## ปรับ threshold ใน Inspector

เปิด `Assets/CPS/Resources/ControllerSettings.asset` ใน Unity:

- FSR เริ่มกดที่ 20% และปล่อยที่ 15% แยกซ้าย/ขวา
- Load Cell เริ่มกดที่ 0.5 N และปล่อยที่ 0.3 N แยกซ้าย/ขวา
- `Stale Seconds` เริ่มต้น 0.75 วินาที ตั้งสั้นลงได้ แต่ข้อมูลที่เก่าถึง 0.75 วินาทีจะถูกปฏิเสธเสมอ

Press ต้องมากกว่า Release การแยกสองค่านี้ช่วยกันการสั่นบริเวณ threshold ค่าถูกสำเนาเมื่อเริ่มรอบ การแก้ระหว่างเล่นมีผลรอบถัดไป

## ตรวจของจริงก่อนใช้งาน

ผู้ใช้ยืนยันว่าเล่นได้แล้ว และเปลี่ยน FSR ซ้ายพร้อมปรับสเก็ตช์สำหรับ Version 2.1.0 การตรวจอัตโนมัติไม่ได้อัปโหลดหรือเปิดพอร์ตจริง หากประกอบชุดใหม่ ให้ลองปล่อย → กดซ้าย → ปล่อย → กดขวา ตรวจทิศทางและระดับ จากนั้นลองถอด USB ระหว่างเล่นและเชื่อมใหม่ ต้องหยุดและรอ Resume ทดสอบ Load Cell ด้วยน้ำหนักที่ทราบค่าหลัง Tare โดยเฉพาะตัว 1 kg ห้ามเกินพิกัด ค่า calibration ยังเป็นชั่วคราวเพราะจุด 83 g ไม่สอดคล้องกับจุด 228/525 g และ FSR ทั้งสองข้างปล่อยอยู่ที่ ADC เพดาน 4095 จึงแยกสายหลุดบางแบบจากการปล่อยไม่ได้

Results ระบุแหล่งข้อมูลจริง: Keyboard/FSR ไม่มีสถิติแรง N ส่วน Load Cell มี Max/Average N และไม่สร้างสถิติเปอร์เซ็นต์เพิ่ม โครงสร้างคอลัมน์ Sheets เดิมไม่เปลี่ยน
