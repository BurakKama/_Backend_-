const User = require("./model");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Girilen email ile bir kullanıcı var mı bakıyoruz
    const user = await User.findOne({ email });

    // Kullanıcı yoksa hata döndürüyoruz
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }

    const comparePassword = await bcrypt.compare(password, user.password); // Şifre karşılaştırması

    // Şifre yanlışsa hata döndürüyoruz
    if (!comparePassword) {
      return res.status(401).json({ message: "Email ya da şifre hatalı!" });
    }

    // Başarılı giriş
    console.log("Kullanıcı girişi başarılı:", user._id);
    return res
      .status(200)
      .json({ message: "Giriş başarılı!", userId: user._id }); // Kullanıcı kimliğini döndür
  } catch (error) {
    // Buradaki hata server ile ilgili hatalar
    console.error("Giriş yaparken hata:", error);
    return res.status(500).json({ message: "Giriş yaparken bir hata oluştu." });
  }
};

const register = async (req, res) => {
  const { name, lastname, email, password, confirmpassword } = req.body;

  try {
    //isim ve soyismin zorunlu olduğunu belirttik
    if (!name || !lastname) {
      return res
        .status(400)
        .json({ message: "İsim ve soyisim alanları zorunludur!" });
    }

    const userCheck = await User.findOne({ email });

    // Kayıt için girilen maili kontrol ediyoruz, aynı mail 2 kere kayıt olamaz
    if (userCheck) {
      return res
        .status(400)
        .json({ message: "Girmiş olduğunuz mail kullanımda!" });
    }

    // Girilen şifre ve şifre tekrarı uyuşmuyorsa hata fırlat
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Şifreler eşleşmiyor!" });
    }

    // Şifreyi hashledik (123 olan şifre 4asd5d45 tarzında zor bir hale getirdik)
    req.body.password = await bcrypt.hash(password, 10);

    const userSave = new User(req.body); // Yeni kullanıcı nesnesi oluşturuluyor
    const savedUser = await userSave.save(); // Veritabanına kaydettik

    // Başarılı kayıt sonrası yanıt gönder
    return res
      .status(201)
      .json({ message: "Kayıt başarılı!", userId: savedUser._id });
  } catch (error) {
    console.error("Kayıt yaparken hata:", error);
    return res.status(500).json({ message: "Kayıt yaparken bir hata oluştu." });
  }
};

module.exports = { login, register };
