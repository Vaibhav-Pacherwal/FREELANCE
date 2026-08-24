import express from "express"
import cors from "cors";
import connectToDB from "./config/db.js";
import dotenv from "dotenv"
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

const main = async () => {
    await connectToDB();
    
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

main();