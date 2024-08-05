const nodemailer = require("nodemailer");

// E-posta gönderim fonksiyonu
const sendEmail = async (mailOptions) => {
  // SMTP sunucusu için taşıyıcıyı oluşturuyoruz
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // E-postayı gönderiyoruz ve sonucu bekliyoruz
    const info = await transporter.sendMail(mailOptions);
    // Başarı durumunda bilgi mesajını döndürüyoruz
    console.log("E-posta başarıyla gönderildi: ", info.response);
    return true; // Başarı durumunda true döndürüyoruz
  } catch (error) {
    // Hata durumunda hata mesajını döndürüyoruz
    console.error("E-posta gönderim hatası: ", error);
    return false; // Hata mesajını döndürüyoruz
  }
};

module.exports = sendEmail;
