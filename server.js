import 'dotenv/config'
import express from 'express'
import { connectDB } from './src/db/dbConnection.js';

const app = express();
connectDB()

app.listen(process.env.PORT, ()=> console.log('server is running!'))