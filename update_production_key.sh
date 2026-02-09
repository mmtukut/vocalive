#!/bin/bash
echo "Updating Vocalive Backend API Key on Cloud Run..."

# Set the new API key
API_KEY="AIzaSyBqgraZBVv-J30hwBQ-ocbtLpVUbs_uEEQ"

# Update the service
/Users/mmtsmacbook/google-cloud-sdk/bin/gcloud run services update vocalive-backend \
  --update-env-vars GEMINI_API_KEY=$API_KEY \
  --region us-central1 \
  --platform managed

echo "Deployment update triggered."
