const dotenv = require("dotenv");
const mongoose = require("mongoose");


const ConnectDB = async()=>{
    try {
        const mongoConnection = await mongoose.connect(`mongodb+srv://rachouhan58:U33kskwumJJI7NEn@cosrx-db.5fwh1bl.mongodb.net` ,{} );
        console.log("mongodb",mongoConnection.connection.host);

    } catch(err) {

        console.log("Error-Connecting-Database");
        throw new Error(err.message);
    }
}

module.exports = ConnectDB;