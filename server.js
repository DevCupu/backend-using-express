const express = require("express");
const prediksiController = require("./src/controllers/predictModel");
const handler = require('./src/middleware/handler');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/predict', handler.single('image'), prediksiController.predict);
app.get('/predict/histories', prediksiController.getPredict);
app.get('/', (req, res) => {
    res.status(200).send({ status: "Server berjalan" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
