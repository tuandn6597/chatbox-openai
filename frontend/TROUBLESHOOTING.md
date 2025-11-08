# Troubleshooting Frontend Issues

## BUILD_ID Error

If you encounter the error:
```
Error: ENOENT: no such file or directory, open '/path/to/frontend/.next/BUILD_ID'
```

### Solution:

1. **For Development** - Use `yarn dev` or `npm run dev`:
   ```bash
   yarn dev
   ```
   This will create the `.next` directory automatically.

2. **For Production** - Build first, then start:
   ```bash
   yarn build
   yarn start
   ```

3. **Clean and Rebuild**:
   ```bash
   rm -rf .next node_modules/.cache
   yarn install
   yarn dev
   ```

## Common Issues

### Dependencies not installed
```bash
yarn install
```

### Port already in use
Change the port in package.json or use:
```bash
yarn dev -p 3001
```

### TypeScript errors
Make sure all types are installed:
```bash
yarn add -D @types/react @types/react-dom @types/node
```

