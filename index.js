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
import bodyParser from "body-parser"; // You might need to install this

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration - Make it very permissive for debugging
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Apply Express middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(rater);

// Apply routes
app.use("/shop", juiceRouter);
app.use("/shop", pizzaRouter);
app.use("/shop", comboRouter);

// Create Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Add more permissive CORS configuration at the Apollo level too
    plugins: [
        {
            async serverWillStart() {
                console.log('Apollo Server is starting up...');
                return {
                    async drainServer() {
                        console.log('Apollo Server is shutting down...');
                    },
                };
            },
        },
    ],
});

// Connect to MongoDB and start servers
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

        // Special handling for OPTIONS requests (CORS preflight)
        app.options('/graphql', cors(corsOptions));

        // Apply Apollo middleware with explicit body-parser middleware
        app.use(
            '/graphql',
            cors(corsOptions), // Explicit CORS for this route
            bodyParser.json(), // Use explicit body-parser
            expressMiddleware(server, {
                context: async ({ req }) => ({ req }),
            })
        );

        // Start Express server
        app.listen(port, () => {
            console.log(`Express server is running on port ${port}`);
            console.log(`Access GraphQL at http://localhost:${port}/graphql`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

startServer();
