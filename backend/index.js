const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./src/db/dbConnected")
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const router = require("./src/routers/index");
// const userRoutes = require("./src/user/routes"); // Router dosyanızın yolu

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true,parameterLimit:50000 }));
app.use(bodyParser.json());

// API yönlendirmesi
app.use("/api",router); 

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Server ${PORT}'unda çalışıyor`);
});
