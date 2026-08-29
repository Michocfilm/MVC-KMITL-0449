document.addEventListener("DOMContentLoaded", async () => {
  const app = new AppController();
  try {
    await app.init();
  } catch (err) {
    const box = document.getElementById("message-box");
    if (box) {
      box.className = "msg msg-error";
      box.textContent =
        "เริ่มไม่สำเร็จ: " + (err && err.message ? err.message : String(err)) + " ลองเปิดด้วย Live Server ";
    }
    console.error(err);
  }
});
