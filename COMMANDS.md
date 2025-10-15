# 🛠️ Quick Reference Commands

## Development Commands

### Backend Commands

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Seed database with sample data
npm run seed
```

### Frontend Commands

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Database Commands

### MongoDB Local

```powershell
# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB

# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use waste_management database
use waste_management

# Show collections
show collections

# Query users
db.users.find()
```

### MongoDB Compass (GUI)
```
Connection String: mongodb://localhost:27017/waste_management
```

## Git Commands

```powershell
# Initialize repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Full MERN waste management system"

# Add remote
git remote add origin <your-repo-url>

# Push to GitHub
git push -u origin main

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/new-feature

# Pull latest changes
git pull origin main
```

## Testing API with PowerShell

### Health Check
```powershell
curl http://localhost:5000/health
```

### Register User
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "Test@12345"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "Test@12345"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
```

### Get Current User (with token)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/me" -Method GET -Headers $headers
```

## Environment Setup

### Create .env files quickly
```powershell
# Backend
cd backend
copy .env.example .env

# Frontend
cd ..\frontend
copy .env.example .env
```

### Edit .env files
```powershell
# Backend
notepad backend\.env

# Frontend
notepad frontend\.env
```

## Port Management

### Check port usage
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check if port 3000 is in use
netstat -ano | findstr :3000
```

### Kill process on port
```powershell
# Find PID
netstat -ano | findstr :5000

# Kill process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

## Troubleshooting Commands

### Clear node_modules and reinstall
```powershell
# Backend
cd backend
rm -r -Force node_modules
rm package-lock.json
npm install

# Frontend
cd ..\frontend
rm -r -Force node_modules
rm package-lock.json
npm install
```

### Check Node and npm versions
```powershell
node --version
npm --version
```

### Update npm
```powershell
npm install -g npm@latest
```

### Clear npm cache
```powershell
npm cache clean --force
```

## Production Build

### Build both applications
```powershell
# Build backend (no special build needed, just install)
cd backend
npm install --production

# Build frontend
cd ..\frontend
npm run build
```

### Deploy frontend build
The `dist` folder contains the production build.
```powershell
cd frontend\dist
# Upload these files to your hosting service
```

## Docker Commands (Future)

```powershell
# Build containers
docker-compose build

# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart
```

## Database Backup

### Export database
```powershell
mongodump --db=waste_management --out=backup_folder
```

### Import database
```powershell
mongorestore --db=waste_management backup_folder/waste_management
```

## VS Code Commands

### Open project in VS Code
```powershell
# Open entire project
code "e:\USER\Desktop\Waste Management System"

# Open backend
code backend

# Open frontend
code frontend
```

### Install VS Code extensions
```powershell
# Install ESLint
code --install-extension dbaeumer.vscode-eslint

# Install Prettier
code --install-extension esbenp.prettier-vscode

# Install MongoDB
code --install-extension mongodb.mongodb-vscode

# Install REST Client
code --install-extension humao.rest-client
```

## Package Management

### Update all dependencies
```powershell
# Backend
cd backend
npm update

# Frontend
cd ..\frontend
npm update
```

### Check for outdated packages
```powershell
npm outdated
```

### Install specific package
```powershell
# Backend
cd backend
npm install package-name

# Frontend
cd ..\frontend
npm install package-name
```

## Logs and Debugging

### View backend logs
```powershell
cd backend
npm run dev
# Logs appear in terminal
```

### View frontend logs
- Open browser console (F12)
- Check Network tab for API calls
- Check Console tab for errors

## Quick Start (All in One)

### Start everything
```powershell
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Stop everything
Press `Ctrl+C` in each terminal window

## Performance Monitoring

### Check memory usage
```powershell
# Windows Task Manager
taskmgr

# Or PowerShell
Get-Process node | Select-Object ProcessName, WorkingSet
```

## Security

### Generate random secret key
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## Useful Aliases (Optional)

Add to PowerShell profile:
```powershell
# Edit profile
notepad $PROFILE

# Add these aliases
function dev-backend { cd "e:\USER\Desktop\Waste Management System\backend"; npm run dev }
function dev-frontend { cd "e:\USER\Desktop\Waste Management System\frontend"; npm run dev }
function mongo-start { net start MongoDB }
function mongo-stop { net stop MongoDB }
```

## API Testing

### Using curl
```powershell
# GET request
curl http://localhost:5000/api/v1/schedules

# POST request
curl -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\",\"password\":\"Test@12345\"}'
```

### Using Postman
1. Import API collection
2. Set base URL: `http://localhost:5000/api/v1`
3. Add Authorization header: `Bearer <token>`
4. Test endpoints

## Maintenance

### Regular updates
```powershell
# Update Node.js packages monthly
npm update

# Security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🔖 Bookmarks

### Development URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API: http://localhost:5000/api/v1
- Health: http://localhost:5000/health

### Documentation
- Main: README.md
- Installation: INSTALLATION.md
- Scope: PROJECT_SCOPE.md
- Summary: PROJECT_SUMMARY.md

### External Resources
- MongoDB Docs: https://docs.mongodb.com/
- React Docs: https://react.dev/
- Express Docs: https://expressjs.com/
- TailwindCSS: https://tailwindcss.com/

---

**Save this file for quick reference! 📌**
