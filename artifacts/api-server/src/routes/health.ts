import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  try {
    // Test database connection with a simple query
    await pool.query('SELECT 1');
    
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: "error", 
      message: "Database connection failed" 
    });
  }
});

export default router;
