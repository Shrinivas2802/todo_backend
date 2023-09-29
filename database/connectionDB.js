import mongoose from "mongoose";

const connectionDB=()=>{
    mongoose.connect(process.env.URI)
    .then(()=>console.log("Database Connected"))
    .catch(error=>console.error(error.message));
};

export default connectionDB;