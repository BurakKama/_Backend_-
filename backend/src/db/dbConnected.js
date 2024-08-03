const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Veritabanına Bağlandı");
})
.catch((err) => {
    console.error("Veritabanı bağlantı hatası:", err);
});