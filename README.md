# NextStep 🚀

A full-stack web application designed to help students select their academic branch and generate personalized AI-powered learning roadmaps for their educational journey.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Key Components](#key-components)
- [Database Models](#database-models)
- [Contributing](#contributing)

## 📖 Overview

NextStep is a comprehensive academic planning platform that uses AI (Google Gemini) to generate customized learning roadmaps. It helps students:
- Explore different engineering branches and specializations
- Define their career goals
- Get AI-generated 4-year master roadmaps
- Receive semester-wise roadmap breakdowns
- Track their academic profile and preferences

## ✨ Features

### User Features
- **User Authentication**: Secure login and signup with JWT-based authentication
- **Branch Explorer**: Browse and explore different academic branches and their specializations
- **Profile Management**: Create and edit user profiles with career goals and specialization preferences
- **AI Roadmap Generation**: Generate personalized learning roadmaps using Google Gemini API
  - Master 4-Year Roadmap: Comprehensive long-term learning path
  - Semester-wise Roadmaps: Detailed semester-by-semester breakdown of learning objectives
- **Roadmap Dashboard**: View generated roadmaps and track progress

### Branch Categories
- **Computer Science**: CSE-CORE, CSE-AI, CSE-AIML, CSE-DS, CSE-CS, CSE-IOT, CSE-NET, CSD, CSBS, CE-SE
- **Electronics**: ECE, EEE, EIE, ECOMP, ETELE, ECI, ACT, VLSI
- **Mechanical**: MECH, MECHATRONICS, AUTOMOBILE, AUTOROBOTICS, INDPROD
- **And more...**

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router DOM 6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library
- **React Icons** - Additional icons
- **React Loader Spinner** - Loading indicators
- **React Scripts 5** - Build tooling (Create React App)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT (jsonwebtoken)** - Authentication tokens
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management
- **Cookie Parser** - Cookie middleware
- **Validator** - Input validation

### External APIs
- **Google Gemini API** - AI-powered roadmap generation

## 📁 Project Structure

```
NextStep/
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── app.js                   # Main Express application
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection config
│   │   │   └── gemini.js            # Google Gemini API configuration
│   │   ├── controllers/
│   │   │   ├── branchController.js  # Branch route handlers
│   │   │   ├── roadmapController.js # Roadmap generation logic
│   │   │   └── semesterRoadmapController.js # Semester-wise roadmaps
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── Branch.js            # Branch schema
│   │   │   ├── MasterRoadmap.js     # Master roadmap schema
│   │   │   ├── SemesterRoadmap.js   # Semester roadmap schema
│   │   │   └── user.js              # User schema
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication routes
│   │   │   ├── branchRoutes.js      # Branch endpoints
│   │   │   └── roadmap.js           # Roadmap generation endpoints
│   │   ├── utils/
│   │   │   └── Roadmap/
│   │   │       ├── masterRoadmapGenerator.js    # Master roadmap generation logic
│   │   │       └── semesterRoadmapGenerator.js  # Semester breakdown logic
│   │   └── utils/validation.js      # Input validation utilities
│   └── package.json
│
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── App.js                   # Main application component
│   │   ├── App.css                  # Application styles
│   │   ├── AppLayout.jsx            # Layout wrapper component
│   │   ├── AuthProvider.jsx         # Authentication context provider
│   │   ├── index.js                 # React DOM entry point
│   │   ├── index.css                # Global styles
│   │   ├── assets/                  # Images and static files
│   │   └── components/
│   │       ├── ScrollToTop.jsx      # Utility component
│   │       ├── AI/
│   │       │   ├── MasterRoadmap/   # Master roadmap display
│   │       │   └── SemesterRoadmap/ # Semester roadmap display
│   │       ├── BranchesExplorer/    # Branch exploration UI
│   │       ├── Common/
│   │       │   ├── EmptyView/       # Empty state component
│   │       │   ├── ErrorView/       # Error display component
│   │       │   └── LoaderView/      # Loading indicator component
│   │       ├── Home/
│   │       │   ├── Dashboard/       # Main user dashboard
│   │       │   └── Sidebar/         # Navigation sidebar
│   │       ├── NotFound/            # 404 page
│   │       ├── pages/
│   │       │   ├── Landing/         # Landing page
│   │       │   ├── Login/           # Login page
│   │       │   └── Signup/          # Registration page
│   │       └── Profile/
│   │           ├── EditProfile/     # Edit user profile
│   │           └── ShowProfile/     # View user profile
│   ├── public/
│   │   ├── index.html               # HTML template
│   │   ├── manifest.json            # PWA manifest
│   │   └── robots.txt               # SEO robots directive
│   ├── build/                       # Production build output
│   └── package.json
│
└── package.json                     # Root package.json (Create React App wrapper)
```

## 📋 Prerequisites

- **Node.js** v16+ and npm
- **MongoDB** (local or cloud instance)
- **Google Gemini API Key** (for AI features)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd /Users/mantenwarakshaya/Desktop/NextStep
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file in backend root directory
touch .env
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Root Setup

```bash
cd ..

# Install root dependencies
npm install
```

## ⚙️ Configuration

### Backend Environment Variables (.env)

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=7777
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Google Gemini API
GEMINI_API_KEY=your_google_gemini_api_key
# OR
GOOGLE_API_KEY=your_google_api_key
```

### Frontend Configuration

The frontend is configured to connect to the backend at `http://localhost:7777` by default. Axios requests are automatically sent to this URL.

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:7777`

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000` and open in your browser.

### Production Mode

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

## 📡 API Endpoints

### Authentication Routes (`/api`)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user profile
- `POST /auth/refresh` - Refresh authentication token

### Branch Routes (`/api/branches`)
- `GET /` - Get all branches
- `GET /:branchCode` - Get specific branch details
- `GET /search/:query` - Search branches

### Roadmap Routes (`/api/roadmap`)
- `POST /generate-master` - Generate master 4-year roadmap
- `POST /generate-semester` - Generate semester-wise roadmap
- `GET /master/:roadmapId` - Get master roadmap details
- `GET /semester/:roadmapId` - Get semester roadmap details
- `GET /user/roadmaps` - Get user's all roadmaps
- `DELETE /:roadmapId` - Delete a roadmap

## 🗄️ Database Models

### User Model
- User authentication and profile data
- Branch selection
- Career goals and specializations
- Links to generated roadmaps

### Branch Model
- Branch code and name
- Category classification
- Aliases for different names
- About description
- Available specializations

### MasterRoadmap Model
- User reference
- Branch and specialization details
- 4-year learning objectives
- Career path recommendations
- Timestamps

### SemesterRoadmap Model
- Reference to master roadmap
- Semester number (1-8)
- Semester-specific learning objectives
- Course recommendations
- Project suggestions

## 🔐 Authentication Flow

1. User registers with email and password
2. Password is hashed using Bcrypt
3. JWT token is generated on successful login
4. Token is stored in HTTP-only cookies
5. Protected routes verify JWT token via auth middleware
6. Token refresh mechanism maintains session

## 🤖 AI Roadmap Generation

The application uses Google Gemini API to generate personalized learning roadmaps:

1. **Input**: Branch, specialization, career goal, semester (for semester roadmaps)
2. **Processing**: Gemini analyzes requirements and generates structured JSON
3. **Storage**: Roadmap is stored in MongoDB
4. **Display**: Frontend displays roadmap with semester-wise breakdown

### Gemini Configuration
- **Model**: Supports configurable Gemini models
- **Response Format**: JSON structured response
- **Retry Logic**: Automatic retry with exponential backoff
- **Error Handling**: Graceful error messages

## 📝 Key Features Implementation

### Master Roadmap Generation
- Analyzes student branch and career goals
- Generates comprehensive 4-year learning path
- Includes skill development milestones
- Suggests projects and internships

### Semester Roadmap Breakdown
- Divides master roadmap into 8 semesters
- Provides semester-specific learning objectives
- Recommends courses and resources
- Includes practical project assignments

### Branch Explorer
- Browse all available branches
- View branch details and specializations
- Compare different branches
- Select preferred branch for profile

## 🛣️ User Journey

1. **Landing** → Welcome page explaining features
2. **Authentication** → Sign up or Log in
3. **Profile Setup** → Select branch and career goal
4. **Branch Explorer** → Browse available specializations
5. **Roadmap Generation** → Generate AI-powered learning path
6. **Dashboard** → View master and semester roadmaps
7. **Profile Management** → Update career goals and preferences

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a new branch for your feature: `git checkout -b feature/YourFeature`
2. Commit your changes: `git commit -m 'Add YourFeature'`
3. Push to the branch: `git push origin feature/YourFeature`
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📧 Support

For issues, questions, or feature requests, please create an issue in the repository or contact the development team.

---

**Built with ❤️ to help students plan their academic journey successfully.**
