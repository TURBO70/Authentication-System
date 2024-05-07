const express = require("express");

const dotenv = require("dotenv");


const {db} = require("./config/db.config");

const globalError = require("./middlewares/errorMiddleware");

const authRoute = require('./routes/auth.routes');
const { customError } = require("./utils/customError");

db();

const app = express();

app.use(express.json());

// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./routes/swagger.json');

//Mount Routes
app.use("/auth", authRoute);

// Handel unhandelling Routes
app.all("*", (req, res, next) => {
  next(new customError(`Can't found this Route : ${req.originalUrl}`, 400));
});

// Global error handelling middleware
app.use(globalError);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const PORT = 3000 || 8000;
const server = app.listen(PORT, () => {
  console.log(`App Running on port ${PORT}`);
});

// process.on("unhandledRejection", (error) => {
//   console.log(`unhandledRejection Error : ${error.name} | ${error.message}`);
//   server.close(() => {
//     console.error("Shutting down.... ");
//     process.exit(1);
//   });
// });
