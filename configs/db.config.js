const mongoose = require ('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { default: chalk } = require('chalk');

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });  
        console.log(chalk.bgCyan("Connected to the database"))
    } catch (error) {
        console.log(`Could not connect to the database with error : ${error}`);
        process.exit(1);
    }
}

module.exports = connectDatabase;