/* ============================================================
   Stepper.js — ตัวช่วยบันทึก "ขั้นตอน" ของอัลกอริทึม
   อัลกอริทึมไม่วาดภาพเอง แค่เรียก add() บันทึกสถานะแต่ละขั้น
   แล้ว VizPlayer จะเล่นซ้ำให้ (เดินหน้า/ถอยหลังได้)
   ============================================================ */
(function () {
  window.DSA = window.DSA || {};

  function Stepper() {
    this.steps = [];
  }

  /**
   * บันทึก 1 ขั้นตอน
   * @param {Object} snapshot   สถานะข้อมูล ณ ขั้นนี้ (ต้องเป็นสำเนา ไม่ใช่ reference)
   * @param {string} description คำอธิบายภาษาไทยของขั้นนี้
   * @param {Object} meta        ข้อมูลเสริม เช่น { line: 2 } บรรทัดโค้ดที่ไฮไลต์
   */
  Stepper.prototype.add = function (snapshot, description, meta) {
    this.steps.push({
      snapshot: snapshot,
      description: description || '',
      meta: meta || {},
    });
    return this;
  };

  DSA.Stepper = Stepper;
})();
