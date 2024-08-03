const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./src/db/dbConnected")
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const userRoutes = require("./src/user/routes"); // Router dosyanızın yolu

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json());

// API yönlendirmesi
app.use("/api/auth", userRoutes); // Router'ı buraya ekledik

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Server ${PORT}'unda çalışıyor`);
});
