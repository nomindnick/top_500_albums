# Google Cloud Deployment Guide

This guide will help you deploy the 500 Albums app to Google Cloud Run with Cloud SQL.

## Prerequisites

1. Google Cloud account with billing enabled
2. `gcloud` CLI installed and configured
3. Docker installed locally (optional, for testing)

## Setup Steps

### 1. Create a Google Cloud Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud projects create $PROJECT_ID
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

### 2. Create Cloud SQL PostgreSQL Instance

```bash
# Create instance (this takes a few minutes)
gcloud sql instances create albums-db-instance \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create albums_countdown_db \
  --instance=albums-db-instance

# Create user
gcloud sql users create albums_countdown_user \
  --instance=albums-db-instance \
  --password=YOUR_SECURE_PASSWORD
```

### 3. Generate Secure Keys

```bash
# Generate JWT secret key
openssl rand -base64 32

# Generate Flask secret key
openssl rand -base64 32
```

### 4. Update Configuration

1. Edit `cloudbuild.yaml` and replace:
   - `PROJECT_ID` with your actual project ID
   - `REGION` with your region (e.g., us-central1)
   - `INSTANCE_NAME` with `albums-db-instance`
   - `PASSWORD` with your database password
   - `CHANGE_ME_TO_STRONG_KEY` with your generated keys

### 5. Deploy the Application

```bash
# Submit build
gcloud builds submit --config cloudbuild.yaml

# Get the Cloud Run URL
gcloud run services describe albums-app --region us-central1 --format 'value(status.url)'
```

### 6. Initialize the Database

After deployment, you need to run migrations and seed the database:

```bash
# SSH into a temporary Cloud Shell or use Cloud SQL proxy
gcloud sql connect albums-db-instance --user=albums_countdown_user --database=albums_countdown_db

# Then run these SQL commands to create tables (you'll need to adapt from your migrations)
```

Alternatively, create a one-time job to run migrations:

```bash
# Create a migration job (you'll need to create a migration script)
gcloud run jobs create migrate-db \
  --image gcr.io/$PROJECT_ID/albums-app \
  --command "flask,db,upgrade" \
  --add-cloudsql-instances=$PROJECT_ID:us-central1:albums-db-instance \
  --set-env-vars DATABASE_URL=...

# Execute the job
gcloud run jobs execute migrate-db --region us-central1
```

### 7. Seed Album Data

You'll need to upload the CSV file and run the seed script. One approach:

1. Upload CSV to Cloud Storage
2. Create a Cloud Run job to download and seed the data

## Security Notes

1. **Never commit** `.env` files with real credentials
2. Use **Secret Manager** for production secrets (optional for 2 users)
3. Set up **Cloud IAM** to restrict access
4. Enable **Cloud SQL backups**

## Monitoring

- View logs: `gcloud run services logs read albums-app --region us-central1`
- View metrics in Cloud Console

## Updating the App

To deploy updates:

```bash
gcloud builds submit --config cloudbuild.yaml
```

## Cost Estimates (2 users)

- Cloud Run: ~$0-5/month (mostly free tier)
- Cloud SQL (db-f1-micro): ~$8/month
- Storage: ~$0.20/month
- **Total: ~$8-15/month**

## Troubleshooting

1. **Database connection errors**: Check Cloud SQL instance is running and connection string is correct
2. **502 errors**: Check Cloud Run logs for startup errors
3. **Permission errors**: Ensure Cloud Build service account has necessary permissions