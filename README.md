# MSA Software Engineer Backend Challenge

## Objective
This project is a backend service built using **Node.js** that allows users to find nearby **pizza** and **juice** shops using the **Foursquare API**. The service provides both **RESTful APIs** and **GraphQL APIs** for querying places.

## Features
- **REST API** endpoints for retrieving pizza, juice, and combo shops.
- **GraphQL API** for flexible queries.
- **MongoDB (Mongoose) Integration** for data persistence.
- **Rate-limiting Middleware** to prevent API abuse.
- **Concurrency Optimization** with async/await.
- **Proper Error Handling & Logging**.

## Tech Stack
- **Backend**: Node.js (Express)
- **Database**: MongoDB (Mongoose ORM)
- **GraphQL**: Apollo Server
- **Third-party API**: Foursquare Places API
- **Middleware**: Express-rate-limit (for rate limiting)
- **Logging**: Winston (optional)


## Installation & Setup
### Prerequisites
- Node.js installed
- MongoDB running locally or on a cloud service
- A Foursquare API key

### Steps
1. **Clone the Repository**
   ```sh
   git clone https://github.com/Vedkumar07/MSA_ASSIGMENT1.0.git
   cd project-root
   ```
2. **Install Dependencies**
   ```sh
   npm install
   ```
3. **Setup Environment Variables**
   Create a `##.env` file in the root directory and add:
   ```env
   PORT=5000
   MONGO_URL=<DATABASE URL>
   FOURSQUARE_API_KEY=your_foursquare_api_key
   ```
4. **Start the Server**
   ```sh
   npm install
   npm start
   ```

## REST API Endpoints
| Method | Endpoint         | Description |
|--------|----------------|-------------|
| GET    | /search/pizza  | Fetch nearby pizza places |
| GET    | /search/juice  | Fetch nearby juice places |
| GET    | /search/combo  | Fetch places offering both pizza and juice |

## GraphQL API
GraphQL Queries:
```graphql
type Query {
  searchPizza(lat: Float!, lng: Float!, radius: Int): [Place]
  searchJuice(lat: Float!, lng: Float!, radius: Int): [Place]
  searchCombo(lat: Float!, lng: Float!, radius: Int): [Place]
}

type Place {
  name: String!
  address: String!
  rating: Float
  phone: String
}
```
### Example GraphQL Query
```graphql
query {
  searchPizza(lat: 40.7128, lng: -74.006, radius: 1000) {
    name
    address
    rating
    phone
  }
}
```

## Rate Limiting
To prevent API abuse, **express-rate-limit** middleware has been added to limit requests. It ensures that users cannot send too many requests within a short period.

Example configuration:
```js
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});

app.use(limiter);
```

## Deployment
For deployment, you can use **Heroku**, **AWS**, **DigitalOcean**, or **any cloud provider** that supports Node.js applications.

---
### Author
**Ved Kumar**  
MSA Backend Challenge - 2025

