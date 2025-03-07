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

// CORS configuration
const corsOption = {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply middleware
app.use(cors(corsOption));
app.use(express.json()); 
app.use(rater);

// Apply routes
app.use("/shop", juiceRouter);
app.use("/shop", pizzaRouter);
app.use("/shop", comboRouter);

// Create Apollo Server
const server = new ApolloServer({ 
    typeDefs, 
    resolvers 
});

// Connect to MongoDB
async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
        });
        console.log("Connected to MongoDB");
        
        // Start Apollo Server
        await server.start();
        console.log('GraphQL server started!!');
        
        // Apply GraphQL middleware
        app.use('/graphql', 
            cors(corsOption), // Using the same CORS options for consistency
            express.json(),
            expressMiddleware(server, {
                context: async ({ req }) => ({ req }),
            })
        );
        
        // Start Express server after everything is set up
        app.listen(port, () => {
            console.log(`Express server is running on port ${port}`);
            console.log(`GraphQL endpoint available at http://localhost:${port}/graphql`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startServer();
