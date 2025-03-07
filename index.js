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
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
app.use(express.json()); 
app.use(rater);
app.use("/shop", juiceRouter);
app.use("/shop", pizzaRouter);
app.use("/shop", comboRouter);

const server = new ApolloServer({ 
    typeDefs, 
    resolvers 
});



async function startServer() {
    try {
        await server.start();
        console.log('GraphQL server started!!');
        app.use('/graphql', 
            cors(corsOptions),
            bodyParser.json(),
            expressMiddleware(server, {
                context: async ({ req }) => ({ req }),
            })
        );

        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
        });
        console.log("Connected to MongoDB");
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
