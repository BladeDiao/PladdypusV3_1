import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import sequelize from './config/postgresql.config';
import PublicRoute from './route/Public.route';
import PrivateRoute from './route/Private.route';
import RootRoute from './route/Root.route';

dotenv.config();
const app = express();
app.set('trust proxy', true);

// Database connection
sequelize.authenticate()
  .then(() => console.log('Database connected.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

// Sequelize database
sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err: Error) => {
    console.log("Failed to sync db: " + err.message);
  });

// CORS options
const corsOptions: cors.CorsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3002", "http://192.168.0.60:3002"]
};

// app.use(cors(corsOptions));
app.use(cors({ origin: "*" })); // allow all source disable when in production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 8080;

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Simple route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "PladdypusV2 Backend 2. Hello World" });
});

// Route setup 
app.use('/public', PublicRoute);
app.use('/private',PrivateRoute);
app.use('/root', RootRoute);


// redrict the /? to ?
app.use((req: Request, res: Response, next: Function) => {
  if (req.url.startsWith('/?')) {
    const newUrl = req.url.substring(1);
    res.redirect(newUrl);
  } else {
    next();
  }
});