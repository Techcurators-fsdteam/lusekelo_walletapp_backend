# Cloudinary Setup for Avatar Uploads

Since the backend is deployed on Vercel (which has a read-only filesystem), we use Cloudinary for storing user avatar images.

## Why Cloudinary?

Vercel's serverless functions cannot write to the filesystem. All file uploads must use cloud storage services like:
- Cloudinary (recommended - free tier available)
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

## Setup Instructions

### 1. Create a Free Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email

### 2. Get Your Credentials

1. Log in to your Cloudinary dashboard
2. Go to the Dashboard (home page)
3. You'll see your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Add Credentials to Environment Variables

#### Local Development (.env file)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Vercel Deployment
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Redeploy your application

### 4. Folder Structure

Avatar images will be stored in: `mjicho-wallet/avatars/`

You can view and manage uploaded images in your Cloudinary Media Library.

## Features

- **Automatic optimization**: Images are automatically optimized for web delivery
- **Transformation**: Avatars are resized to 500x500px maximum
- **CDN delivery**: Fast global delivery via Cloudinary's CDN
- **Free tier**: 25 GB storage and 25 GB bandwidth per month

## Troubleshooting

### Error: "No such file or directory"
This means Cloudinary is not configured. Make sure:
1. Environment variables are set correctly
2. You've redeployed after adding variables
3. The cloudinary package is installed

### Error: "Invalid credentials"
Double-check your Cloudinary credentials in the environment variables.

### Images not loading
Check that the avatar URL in the database starts with `https://res.cloudinary.com/`
