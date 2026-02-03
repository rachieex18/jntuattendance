#!/bin/bash

# Script to push code to a new GitHub repository
# Usage: ./push-to-new-repo.sh YOUR_USERNAME YOUR_REPO_NAME

echo "════════════════════════════════════════════════════════"
echo "🚀 Push to New GitHub Repository"
echo "════════════════════════════════════════════════════════"
echo ""

# Check if arguments are provided
if [ $# -ne 2 ]; then
    echo "❌ Error: Missing arguments"
    echo ""
    echo "Usage: ./push-to-new-repo.sh YOUR_USERNAME YOUR_REPO_NAME"
    echo ""
    echo "Example:"
    echo "  ./push-to-new-repo.sh johndoe jntuxatt-vercel"
    echo ""
    echo "📝 First, create a new repository on GitHub:"
    echo "   https://github.com/new"
    echo ""
    echo "   ⚠️  DO NOT initialize with README, .gitignore, or license"
    echo ""
    exit 1
fi

USERNAME=$1
REPO_NAME=$2
NEW_REMOTE="https://github.com/$USERNAME/$REPO_NAME.git"

echo "📋 Configuration:"
echo "   Username: $USERNAME"
echo "   Repository: $REPO_NAME"
echo "   Remote URL: $NEW_REMOTE"
echo ""

# Confirm
read -p "❓ Is this correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔄 Step 1: Checking current remote..."
git remote -v

echo ""
echo "🔄 Step 2: Removing old remote..."
git remote remove origin

echo ""
echo "🔄 Step 3: Adding new remote..."
git remote add origin $NEW_REMOTE

echo ""
echo "🔄 Step 4: Verifying new remote..."
git remote -v

echo ""
echo "🔄 Step 5: Pushing to new repository..."
git push -u origin main

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ SUCCESS! Code pushed to new repository"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🌐 View your repository:"
echo "   https://github.com/$USERNAME/$REPO_NAME"
echo ""
echo "🚀 Next steps:"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Import your new repository"
echo "   3. Follow QUICK_START.md for deployment"
echo ""
