# Fix BUILD_ID Error

## Problem
Error: `ENOENT: no such file or directory, open '/Users/dangngoctuan/Desktop/interview/chatbox/frontend/.next/BUILD_ID'`

## Solution

### Option 1: Development Mode (Recommended)
Use development mode which automatically creates the `.next` directory:

```bash
cd frontend
yarn install
yarn dev
```

This will start the Next.js development server on `http://localhost:3000` and automatically create the `.next` directory.

### Option 2: Clean and Rebuild
If the `.next` directory is corrupted:

```bash
cd frontend
yarn clean  # or: rm -rf .next node_modules/.cache
yarn install
yarn dev
```

### Option 3: Production Build
If you need to run in production mode:

```bash
cd frontend
yarn install
yarn build    # This creates the .next directory with BUILD_ID
yarn start    # Now this will work
```

## Important Notes

- **Always use `yarn dev` for development** - It handles the `.next` directory automatically
- **Don't run `yarn start` without building first** - Production mode requires a build
- The `.next` directory is auto-generated and should be in `.gitignore`

## Quick Fix Command

```bash
cd frontend && rm -rf .next && yarn dev
```

