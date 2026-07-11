# Deployment Guide - PlayZone API Server on Render with Neon PostgreSQL

## Overview

This guide explains how to deploy the PlayZone API server on [Render](https://render.com) with a PostgreSQL database hosted on [Neon](https://neon.tech).

## Architecture

- **Database**: PostgreSQL on Neon (using the "pooler" endpoint for web/serverless environments)
- **Backend**: Express API server on Render
- **Connection Pool**: Configured with max 5 connections in production (Neon pooler limits connections)
- **SSL**: Required for Neon (configured automatically)

## Prerequisites

1. **Neon Account**: Create a project at [neon.tech](https://neon.tech)
2. **Render Account**: Create an account at [render.com](https://render.com)
3. **Local Setup**: `.env` file with all required variables (see `.env.example`)

## Step 1: Set Up Neon PostgreSQL

### Create a Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project (or use existing one)
3. Note the **Database Name** (default: `neondb`)
4. Note the **Database User** (default: `neondb_owner`)

### Get the Connection String

1. In Neon Console, go to **Connection details**
2. Select **"Pooler"** connection type (important for web/serverless)
   - Regular connections can timeout; pooler is optimized for short connections
3. Copy the **Connection string** (format: `postgresql://user:password@pooler.region.us-east-1.aws.neon.tech/dbname`)

### Important URL Parameters

The Neon connection string includes these parameters:

```
postgresql://user:password@pooler.region.us-east-1.aws.neon.tech/dbname?sslmode=require&channel_binding=require
```

- **`sslmode=require`**: Mandatory SSL connection (handled by the code)
- **`channel_binding=require`**: SCRAM authentication enhancement
  - Requires `pg` v8.9+ in Node.js
  - If authentication fails, try removing this parameter from the connection string

## Step 2: Deploy on Render

### Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository (PlayZone monorepo)
4. Configure:
   - **Name**: `playzone-api` (or your preferred name)
   - **Root Directory**: `artifacts/api-server`
   - **Environment**: `Node`
   - **Build Command**: `npm run build` (or your build command)
   - **Start Command**: `npm start`

### Set Environment Variables

Go to **Settings → Environment** and add:

```bash
# Database
DATABASE_URL=postgresql://user:password@pooler.region.us-east-1.aws.neon.tech/dbname?sslmode=require

# Session Secret (generate a secure random string)
SESSION_SECRET=generate-a-secure-random-key-here

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=playzone/galeria

# Node Environment
NODE_ENV=production
```

**⚠️ Important**: Never commit the real `DATABASE_URL` or credentials to git. Use `.env.example` as a template for local development only.

### Deploy

1. Render will automatically deploy on push to your main branch
2. Watch the deployment logs in **Logs** tab
3. Once deployed, your API will be accessible at `https://playzone-api.onrender.com`

## Step 3: Verify the Connection

### Health Check Endpoint

Once deployed, test the database connection:

```bash
curl https://playzone-api.onrender.com/healthz
```

Expected response:
```json
{ "status": "ok" }
```

If you see an error:
```json
{ "status": "error", "message": "Database connection failed" }
```

Check the Render logs for details.

### Local Testing

Before deploying, test locally with a test database:

1. Set a test `DATABASE_URL` in your local `.env` file
2. Run: `npm run dev`
3. Verify health check: `curl http://localhost:5000/healthz`

## Troubleshooting

### Error: "too many connections"

**Cause**: Connection pool is too large or connections aren't being released.

**Solution**:
- Ensure connection pool is set to `max: 5` in production (code already does this)
- Check for unclosed database queries
- Monitor active connections in Neon Console

### Error: "role does not exist" or Authentication Failed

**Cause**: Wrong credentials or channel_binding incompatibility.

**Solution**:
1. Verify credentials in Render Environment Variables
2. Try removing `&channel_binding=require` from the `DATABASE_URL`:
   ```
   postgresql://user:password@pooler.region.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```
3. Ensure `pg` package is v8.9+ (check `package.json` in `@workspace/db`)

### Error: "SSL required"

**Cause**: Connection string doesn't include `sslmode=require`.

**Solution**: Ensure your `DATABASE_URL` in Render includes `?sslmode=require`

### Connection Timeout

**Cause**: Network issues or Neon service unavailability.

**Solution**:
1. Check Neon Console status page
2. Verify your Render region matches Neon region (or nearby)
3. Check Render logs for connection errors
4. Increase `connectionTimeoutMillis` if needed (already set to 10s in code)

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@pooler...` |
| `SESSION_SECRET` | Express session encryption key | Random secure string |
| `NODE_ENV` | Environment mode | `production` / `development` |
| `CLOUDINARY_CLOUD_NAME` | Image storage cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `CLOUDINARY_UPLOAD_FOLDER` | Cloudinary folder path | `playzone/galeria` |

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` for templates
2. **Rotate secrets regularly** - Update `SESSION_SECRET` in Render periodically
3. **Use Environment Variables** - All sensitive data should come from Render settings
4. **Enable Firewall** - Consider restricting database access by IP on Neon
5. **Monitor Logs** - Regularly check Render and Neon logs for suspicious activity
6. **Regenerate credentials** - If credentials are accidentally exposed, regenerate them immediately in Neon Console

## Useful Links

- [Neon Documentation](https://neon.tech/docs)
- [Neon Connection Pooling](https://neon.tech/docs/guides/connection-pooling-guide)
- [Render Documentation](https://render.com/docs)
- [Drizzle ORM Guide](https://orm.drizzle.team/docs/get-started)

## Additional Notes

- Drizzle ORM is used for database migrations and queries
- Connection pooling is automatically handled by the Node `pg` package
- The application gracefully handles database connection failures in the health check endpoint
- For scaling, consider upgrading Neon plan or adding read replicas
