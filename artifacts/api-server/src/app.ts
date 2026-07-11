import express from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import dotenv from 'dotenv';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

// Load env variables from playzone-bar directory for local development only.
// Render provides runtime environment variables directly, so we avoid overriding them.
if (!isProduction) {
  dotenv.config({ path: path.resolve(__dirname, '../../playzone-bar/.env') });
}

if (!process.env.SESSION_SECRET) {
  logger.warn("SESSION_SECRET env var is not set — refusing to start with insecure default");
  process.exit(1);
}

const app = express();

// Trust Render's reverse proxy so the request protocol and secure cookies are handled correctly.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
  }),
);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const publicDir = path.resolve(__dirname, "../../playzone-bar/dist/public");
app.use(express.static(publicDir));

// SPA fallback - serve index.html for all non-API routes
app.use((req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(publicDir, "index.html"));
});

export default app;
