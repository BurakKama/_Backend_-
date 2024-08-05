const User = require("./model");
const {
  createToken,
  createTemporaryToken,
  decodedTemporaryToken,
} = require("../validations/auth");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const moment = require("moment");
const sendEmail = require("../utils/sendMail");

// Giriş işlemi
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({ message: "Email ya da şifre hatalı!" });
    }

    console.log("Kullanıcı girişi başarılı:", user._id);

    const token = await createToken(user);

    return res.status(200).json({
      message: "Giriş başarılı!",
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Giriş yaparken hata:", error);
    return res.status(500).json({ message: "Giriş yaparken bir hata oluştu." });
  }
};

// Kayıt işlemi
const register = async (req, res) => {
  const { name, lastname, email, password, confirmpassword } = req.body;

  try {
    if (!name || !lastname) {
      return res
        .status(400)
        .json({ message: "İsim ve soyisim alanları zorunludur!" });
    }

    const userCheck = await User.findOne({ email });
    if (userCheck) {
      return res
        .status(400)
        .json({ message: "Girmiş olduğunuz mail kullanımda!" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Şifreler eşleşmiyor!" });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const userSave = new User({
      name,
      lastname,
      email,
      password: hashpassword,
    });
    const savedUser = await userSave.save();

    return res.status(201).json({
      message: "Kayıt başarılı!",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        lastname: savedUser.lastname,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Kayıt yaparken hata:", error);
    return res.status(500).json({ message: "Kayıt yaparken bir hata oluştu." });
  }
};

//şifre sıfırlama
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  console.log("Şifre sıfırlama isteği alındı: ", { email });

  try {
    // Email ile kullanıcıyı buluyoruz
    const userInfo = await User.findOne({ email }).select(
      "name lastname email"
    );

    if (!userInfo) {
      console.error("E-posta adresiyle ilişkili bir hesap bulunamadı: ", email);
      return res
        .status(404)
        .json({
          message: "E-posta adresinizle ilişkili bir hesap bulunamadı.",
        });
    }

    // Şifre sıfırlama kodunu oluşturuyoruz
    const resetCode = crypto.randomBytes(3).toString("hex"); // 8 haneli kod
    console.log("Şifre sıfırlama kodu oluşturuldu: ", resetCode);

    // E-posta gönderme işlemi
    const emailSent = await sendEmail({
      from: process.env.EMAIL_USER,
      to: userInfo.email,
      subject: "Şifre Sıfırlama",
      text: `Şifre sıfırlama kodunuz: ${resetCode}`,
    });

    // Kullanıcının sıfırlama kodunu ve süresini güncelliyoruz
    await User.updateOne(
      { email },
      {
        reset: {
          code: resetCode,
          time: moment().add(15, "minutes").toDate(),
        },
      }
    );

    console.log("Kullanıcı için reset kodu güncellendi: ", email);
    return res
      .status(200)
      .json({ message: "Lütfen mail adresinizi kontrol ediniz" });
  } catch (error) {
    console.error("Şifre sıfırlama işlemi sırasında hata:", error);
    return res
      .status(500)
      .json({ message: "Şifre sıfırlama işlemi sırasında bir hata oluştu." });
  }
};

// Şifre sıfırlama kodunu kontrol etme
const resetCodeCheck = async (req, res) => {
  const { email, code } = req.body;

  console.log("Şifre sıfırlama kodu kontrol ediliyor: ", { email, code });

  try {
    const userInfo = await User.findOne({ email }).select(
      "_id name lastname email reset"
    );

    if (!userInfo) {
      console.error("Geçersiz kod için kullanıcı bulunamadı: ", email);
      return res.status(400).json({ message: "Geçersiz kod" });
    }

    const dtTime = moment(userInfo.reset.time);
    const nowTime = moment();

    const timeDiff = nowTime.diff(dtTime, "minutes");

    if (timeDiff > 0 || userInfo.reset.code !== code) {
      console.error("Kod geçersiz veya süresi dolmuş: ", { email, code });
      return res.status(400).json({ message: "Geçersiz kod" });
    }

    const temporaryToken = await createTemporaryToken(
      userInfo._id,
      userInfo.email
    );

    console.log("Geçici token oluşturuldu: ", temporaryToken);

    return res.status(200).json({ token: temporaryToken });
  } catch (error) {
    console.error("Şifre sıfırlama kodunu kontrol ederken hata:", error);
    return res
      .status(500)
      .json({
        message: "Şifre sıfırlama kodunu kontrol ederken bir hata oluştu.",
      });
  }
};

// Şifre yenileme
const resetPassword = async (req, res) => {
  const { password, temporaryToken } = req.body;

  console.log("Şifre sıfırlama işlemi başlatıldı: ", { temporaryToken });

  try {
    const decodedToken = await decodedTemporaryToken(temporaryToken);

    const hashpassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decodedToken._id, {
      $set: {
        reset: {
          code: null,
          time: null,
        },
        password: hashpassword,
      },
    });

    console.log("Şifre başarıyla sıfırlandı.");

    return res.status(200).json({ message: "Şifre başarıyla sıfırlandı." });
  } catch (error) {
    console.error("Şifre sıfırlama işlemi sırasında hata:", error);
    return res
      .status(500)
      .json({ message: "Şifre sıfırlama işlemi sırasında bir hata oluştu." });
  }
};

module.exports = {
  login,
  register,
  forgetPassword,
  resetCodeCheck,
  resetPassword,
};
