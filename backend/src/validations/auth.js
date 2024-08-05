const jwt = require("jsonwebtoken");
const User = require("../user/model");

// Token oluşturma işlevi
const createToken = async (user) => {
  try {
    console.log("JWT oluşturuluyor kullanıcı bilgileri: ", {
      userId: user._id,
      userName: user.name,
    });

    const payload = {
      sub: user._id,
      name: user.name,
    };

    // JWT oluşturuluyor
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      algorithm: "HS512",
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    console.log("JWT oluşturuldu");
    return token;
  } catch (error) {
    console.error("JWT oluşturulurken hata:", error);
    throw new Error("Token oluşturulurken bir hata oluştu.");
  }
};

// Token doğrulama 
const tokenCheck = async (req, res, next) => {
  const headerToken =
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ");

  if (!headerToken) {
    console.error("Geçersiz oturum token bulunamadı");
    return res.status(401).json({ message: "Geçersiz Oturum, Lütfen Oturum Açın" });
  }

  const token = req.headers.authorization.split(" ")[1];
  console.log("Token kontrol ediliyor: ", token);

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userInfo = await User.findById(decoded.sub).select("_id name lastname email");

    if (!userInfo) {
      console.error("Kullanıcı bulunamadı, geçersiz token: ", decoded.sub);
      return res.status(401).json({ message: "Geçersiz token" });
    }

    req.user = userInfo;
    console.log("Kullanıcı doğrulandı: ", userInfo);
    next(); // Bir sonraki middleware'e geçiyoruz
  } catch (err) {
    console.error("Geçersiz token", err.message);
    return res.status(401).json({ message: "Geçersiz token" });
  }
};

// Geçici token oluşturma işlevi
const createTemporaryToken = async (userId, email) => {
  try {
    console.log("Geçici token oluşturuluyor kullanıcı bilgileri: ", {
      userId,
      email,
    });

    const payload = {
      sub: userId,
      email,
    };

    const token = await jwt.sign(payload, process.env.JWT_TEMPORARY_KEY, {
      algorithm: "HS512",
      expiresIn: process.env.JWT_TEMPORARY_EXPIRES_IN,
    });

    console.log("Geçici token oluşturuldu: ", token);
    return "Bearer " + token;
  } catch (error) {
    console.error("Geçici token oluşturulurken hata:", error);
    throw new Error("Geçici token oluşturulurken bir hata oluştu.");
  }
};

// Geçici token'ı çözme işlevi
const decodedTemporaryToken = async (temporaryToken) => {
  const token = temporaryToken.split(" ")[1];
  let userInfo;

  console.log("Geçici token çözülüyor: ", token);

  try {
    const decoded = await jwt.verify(token, process.env.JWT_TEMPORARY_KEY);
    userInfo = await User.findById(decoded.sub).select("_id name lastname email");

    if (!userInfo) {
      console.error("Kullanıcı bulunamadı, geçersiz token: ", decoded.sub);
      throw new Error("Geçersiz token");
    }
  } catch (err) {
    console.error("Geçersiz token", err.message);
    throw new Error("Geçersiz token");
  }

  console.log("Geçici token'den kullanıcı bilgileri alındı: ", userInfo);
  return userInfo;
};

module.exports = {
  createToken,
  tokenCheck,
  createTemporaryToken,
  decodedTemporaryToken,
};
