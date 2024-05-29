const { v4: uuidv4 } = require("uuid");
const tfjs = require("@tensorflow/tfjs-node");
const dataStore = require("../service/dataStore");

async function predict(req, res) {
    const img = req.file.buffer;
    
    // Memeriksa apakah ukuran file melebihi batas maksimum
    if (req.file.size > 1000000) {
        return res.status(413).send({
            status: "fail",
            message: "Payload content length greater than maximum allowed: 1000000",
        });
    }
        // Memuat model dari URL
        const modelUrl = "https://storage.googleapis.com/ibens-bukcet121221312/model.json";
        const model = await tfjs.loadGraphModel(modelUrl);

    try {
        // Mendekode gambar, mengubah ukuran, dan mengubah ke tensor
        const tensor = tfjs.node
            .decodeJpeg(img)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat();

        // Melakukan prediksi dengan model
        const predictions = await model.predict(tensor);

        // Menyimpan score 
        const scores = await predictions.data()

        // Menghitung hasil prediksi
        const confidenceScore = Math.max(...scores) * 100;
        
        // Mendefinisikan label dan saran berdasarkan hasil prediksi
        let label, suggestion;
        if (confidenceScore > 50) {
            label = "Cancer";
            suggestion = "Segera periksa ke dokter!";
        } else {
            label = "Non-cancer";
            suggestion = "Anda sehat!";
        }

        // Membuat ID unik dan mengambil timestamp saat ini
        const id = uuidv4();
        const createdAt = new Date().toISOString();
        
        // Membuat objek data yang akan disimpan
        const data = { 
            id,
            result: label,
            suggestion,
            score: confidenceScore,
            createdAt 
        };

        // Menyimpan hasil prediksi ke dalam database
        await dataStore.postPredict(id, data);

        // Mengirim respon dengan status sukses dan data hasil prediksi
        return res.status(201).send({
            status: "success",
            message: "Model is predicted successfully",
            data,
        });
    } catch (error) {
        // Menangani kesalahan yang terjadi selama prediksi
        console.error("Error during prediction:", error);
        return res.status(400).send({
            status: "fail",
            message: "Terjadi kesalahan dalam melakukan prediksi",
        });
    }
}

async function getPredict(req, res) {
    try {
        const result = await dataStore.getPredictHistory();
        return res.status(200).send({
            status: "success",
            data: result,
        });
    } catch (error) {
        console.error("Error while fetching predictions:", error);
        return res.status(500).send({
            status: "fail",
            message: "Terjadi kesalahan saat mengambil data prediksi",
        });
    }
}

module.exports = {
    predict,
    getPredict,
};
