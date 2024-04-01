// import dotenv from 'dotenv'
// dotenv.config()
// import express from 'express'
// import cors from 'cors'
// import router from './routes/useRoutes.js'
// import mongoose from "mongoose";
// import cookieParser from 'cookie-parser'
// import formData from 'express-form-data'
// async function connectDb(DATABASE_URL) {
//     try {
//         const DB_options = {
//             dbname: "shivam"
//         };
//         await mongoose.connect(DATABASE_URL, DB_options);
//         console.log("Database Connected........");
//     } catch (error) {
//         console.log(error);
//     }


// }

// const app = express()
// const port=process.env.PORT
// const DATABASE_URL=process.env.DATABASE_URL

// connectDb(DATABASE_URL)

// const corsOptions = {
//     credentials: true,
//     origin: 'http://localhost:5173'
//   };
  
// app.use(cors(corsOptions));
// app.use(express.json())
// app.use(cookieParser())
// app.use(formData.parse());

// app.use("/api/users",router)
// app.listen(port,()=>{
//     console.log(`listening port on ${port}`)
// })




import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import router from './routes/useRoutes.js'
import mongoose from "mongoose";
import cookieParser from 'cookie-parser'
import formData from 'express-form-data'
import bodyParser from 'body-parser'
import session from 'express-session'
import connectRedis from 'connect-redis';
import Redis from 'ioredis';


const RedisStore = connectRedis(session);
const redisClient = new Redis({
    // Redis configuration options
    host: 'localhost', // Redis server hostname
    port: 6379, // Redis server port
    // Add more configuration options if needed
});

async function connectDb(DATABASE_URL) {
    try {
        const DB_options = {
            dbname: "shivam"
        };
        await mongoose.connect(DATABASE_URL, DB_options);
        console.log("Database Connected........");
    } catch (error) {
        console.log(error);
    }


}

const app = express()
const port=process.env.PORT
const DATABASE_URL=process.env.DATABASE_URL

connectDb(DATABASE_URL)

// const corsOptions = {
//      methods: ['POST', 'GET', 'DELETE', 'PUT'],
//     credentials: true,
//     origin: 'https://front-mart-seven.vercel.app',
//     exposedHeaders: ["shivam"],
//   };
// app.use(cors(corsOptions));

const corsOptions = {
  origin: 'https://front-mart-seven.vercel.app',
  credentials: true, 
  exposedHeaders: ['Set-Cookie'],
};
app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())
app.use(formData.parse());
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    key: 'id',
  secret: process.env.jwt_secret_key,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: true, // Secure only in production
    sameSite: 'none', // Adjust for compatibility if needed
    // maxAge: 1000 * 60 * 60 * 24, // Uncomment for explicit expiration
    expiresIn: "7d"
  },
  })
    )

app.use("/api/users",router)
app.listen(port,()=>{
    console.log(`listening port on ${port}`)
})