import dotenv from "dotenv";
dotenv.config();
import express from "express"; 
import mongoose from "mongoose";
import cors from "cors";
import juiceRouter from "./routing/juice.js";
import pizzaRouter from "./routing/pizza.js";
import comboRouter from "./routing/combo.js";
import { ApolloServer } from "@apollo/server"; 
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";
import rater from "./middleware.js/rateLimiting.js";

const app = express();
const port = process.env.PORT || 5000;


const corsOption = {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOption));
app.use(express.json()); 
app.use(rater);

app.use("/shop", juiceRouter);
app.use("/shop", pizzaRouter);
app.use("/shop", comboRouter);


const server = new ApolloServer({ 
    typeDefs, 
    resolvers 
});

server.start()
.then(()=>{
    console.log('GraphQL server started!!');
    app.use('/graphql', 
        cors(),
        expressMiddleware(server, {
            context: async ({ req }) => ({ req }),
            cors: {
              origin: "*",  // Allow all origins
              credentials: true,
              methods: ["GET", "POST", "OPTIONS"],
              allowedHeaders: ["Content-Type", "Authorization"],
    },
        })
    )
}).catch((error)=>{
    console.error("Error starting GraphQL server:", error)
    throw new Error(error);
})

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("MongoDB connection failed:", err));

app.listen(port,()=>{
    console.log("express surver is running on", process.env.EXPRESSPORT);
});

// console.log("apikey",process.env.FOURSQUARE_API_KEY);
