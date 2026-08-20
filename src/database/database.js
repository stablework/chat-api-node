const mongoose = require('mongoose');

const database = async () => {
    try {
        await mongoose.connect(process.env.DATABASE)
        .then(() => console.log('Connected!'))
        .catch(err => console.log(err));
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); 
    }
};

module.exports = database;