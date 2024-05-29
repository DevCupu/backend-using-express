const { Firestore } = require('@google-cloud/firestore');

async function postPredict(id, data) {
    const db = new Firestore();
    const predictCollection = db.collection('predictions').doc(id).set(data);
    return predictCollection;
}

async function getPredictHistory() {
    const db = new Firestore();
    const predictCollection = db.collection('predictions');
    const response = await predictCollection.get();
    let responArr = [];
    
        response.forEach(doc => {
        responArr.push({ id: doc.data().id, history: doc.data() });
});
    return responArr;
}

module.exports = {
    postPredict,
    getPredictHistory
};
