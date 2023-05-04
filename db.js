const mongoose = require("mongoose");

const mongoURI = "mongodb://127.0.0.1:27017/notes-sensei?directConnection=true&tls=false&readPreference=primary";


const connectToMongo = async () =>{
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully")
}

module.exports = connectToMongo;