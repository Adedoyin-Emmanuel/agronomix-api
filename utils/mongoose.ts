const mongoose = require('mongoose');


async function connectDB() {
    mongoose.connect('mongodb://localhost:27017/agronomix', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('mongoose connected')
    })
    .catch((error:any) => {
       console.log('Error:', error)
    })
}



export default connectDB;