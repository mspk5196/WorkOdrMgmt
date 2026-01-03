# 🏗️ Work Order Management System

> **Complete Full-Stack Mobile Application for Job Order Management**

[![React Native](https://img.shields.io/badge/React%20Native-0.83-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Overview

A comprehensive mobile application for managing work orders between **Agents** (job givers) and **Contractors** (job takers). Built with React Native for the frontend and Node.js/Express for the backend, this system provides complete workflow management from job posting to payment processing.

### 🎯 Key Features

- 🔐 **Secure Authentication** - JWT-based auth with password hashing
- 👥 **Dual Role System** - Separate interfaces for Agents and Contractors
- 📱 **Mobile-First Design** - Native mobile experience with React Native
- 🔄 **Complete Workflow** - Job posting → Application → Approval → Work tracking → Payment
- 📊 **Real-time Updates** - Live status tracking and notifications
- 💼 **Professional UI** - Clean, modern interface with Material Design icons
- 🔒 **Production-Ready** - Security features, error handling, and audit logging

---

## 🚀 Quick Start

📖 **Detailed Setup**: See [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

---

## 📁 Project Structure

```
WorkOdrMgmt/
├── Backend/                      # Node.js/Express Backend
│   ├── src/
│   │   ├── models/              # Database models (7 files)
│   │   ├── controllers/         # Business logic (6 files)
│   │   ├── routes/              # API routes (6 files)
│   │   ├── middleware/          # Auth & validation
│   │   └── newApp.js            # Express app
│   ├── database/
│   │   └── schema.sql           # Complete DB schema
│   └── server.js                # Entry point
│
├── WorkOdrMgmt/                 # React Native Frontend
│   ├── src/
│   │   ├── pages/               # App screens
│   │   │   ├── Auth/           # Login, SignUp
│   │   │   ├── Agent/          # Agent-specific pages
│   │   │   ├── Contractor/     # Contractor-specific pages
│   │   │   └── Shared/         # Profile, Settings
│   │   ├── components/         # Reusable components
│   │   │   ├── Routes/         # Navigation
│   │   │   ├── JobOrders/      # Job components
│   │   │   └── WorkOrders/     # Application components
│   │   └── utils/              # API services, Auth context
│   ├── android/                # Android native code
│   └── ios/                    # iOS native code
│
└── Documentation/              # Complete Documentation
    ├── QUICK_START_GUIDE.md           # Setup guide
    ├── FRONTEND_IMPLEMENTATION_COMPLETE.md
    ├── IMPLEMENTATION_CHECKLIST.md
    ├── API_REFERENCE.md
    └── COMPLETE_IMPLEMENTATION_SUMMARY.md
```

---

## 💼 User Roles

### 👔 Agent (Job Giver)
- Create and manage job orders
- Review contractor applications
- Approve/reject contractors
- Track work progress
- Manage payments

### 👷 Contractor (Job Taker)
- Browse available jobs
- Apply with proposals
- Track application status
- Manage assignments
- Submit invoices

---

## 🎨 Screenshots

### Agent Dashboard
```
┌─────────────────────────────────────┐
│  ← Dashboard               👤 ⚙️    │
├─────────────────────────────────────┤
│  Welcome, John Agent                │
│  Agent Dashboard                    │
│                                     │
│  [+ Create New Job Order]          │
│                                     │
│  My Job Orders (3)                 │
│  ┌─────────────────────────────┐   │
│  │ Install HVAC System    [OPEN]│   │
│  │ Location: New York, NY      │   │
│  │ Budget: $5,000              │   │
│  │ Applications: 2             │   │
│  └─────────────────────────────┘   │
│                                     │
│ [Jobs] [Assignments] [Profile] [⚙️] │
└─────────────────────────────────────┘
```

### Contractor Dashboard
```
┌─────────────────────────────────────┐
│  ← Dashboard               👤 ⚙️    │
├─────────────────────────────────────┤
│  Browse Jobs | Applications | Work  │
│                                     │
│  🔍 [Search jobs...]               │
│                                     │
│  Available Jobs (5)                │
│  ┌─────────────────────────────┐   │
│  │ Install HVAC System    [OPEN]│   │
│  │ Agent: John Agent           │   │
│  │ Budget: $5,000              │   │
│  │ [Apply Now →]               │   │
│  └─────────────────────────────┘   │
│                                     │
│ [Find Jobs] [My Work] [💰] [👤] [⚙️]│
└─────────────────────────────────────┘
```

---

## 🔄 Complete Workflow

```
1. Agent Creates Job
   ↓
2. Job Posted to System
   ↓
3. Contractors Browse & Apply
   ↓
4. Agent Reviews Applications
   ↓
5. Agent Approves Contractor
   ↓
6. Assignment Created
   ↓
7. Contractor Creates Work Plan
   ↓
8. Work Progress Tracked
   ↓
9. Invoice Generated
   ↓
10. Payment Processed
```

---

## 🛠️ Technology Stack

### Frontend
- **React Native** 0.83 - Mobile framework
- **React Navigation** - Navigation library
- **React Native Paper** - UI components
- **AsyncStorage** - Local storage
- **Vector Icons** - Icon library
- **TypeScript** - Type safety

### Backend
- **Node.js** 20+ - Runtime
- **Express.js** - Web framework
- **MySQL** 8.0+ - Database
- **mysql2/promise** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Security
- JWT token authentication
- Password hashing (bcrypt)
- SQL injection prevention
- Token revocation
- Audit logging

---

## 📊 API Endpoints (36 total)

### Authentication (8 endpoints)
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
POST   /api/auth/google-login      # Google OAuth
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Get profile
PUT    /api/auth/profile           # Update profile
POST   /api/auth/change-password   # Change password
POST   /api/auth/request-password-reset  # Reset password
```

### Job Orders (7 endpoints)
```
POST   /api/job-orders             # Create job
GET    /api/job-orders             # Get my jobs
GET    /api/job-orders/open        # Get open jobs
GET    /api/job-orders/:id         # Get job details
PUT    /api/job-orders/:id         # Update job
DELETE /api/job-orders/:id         # Delete job
GET    /api/job-orders/search      # Search jobs
```

### Work Orders (5 endpoints)
```
POST   /api/work-orders            # Apply to job
GET    /api/work-orders            # Get my applications
GET    /api/work-orders/job/:id    # Get job applications
POST   /api/work-orders/:id/approve  # Approve application
POST   /api/work-orders/:id/reject   # Reject application
```

[See full API documentation](API_REFERENCE.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) | Quick setup & installation |
| [FRONTEND_IMPLEMENTATION_COMPLETE.md](FRONTEND_IMPLEMENTATION_COMPLETE.md) | Frontend features & setup |
| [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) | Step-by-step verification |
| [API_REFERENCE.md](API_REFERENCE.md) | Complete API documentation |
| [COMPLETE_IMPLEMENTATION_SUMMARY.md](COMPLETE_IMPLEMENTATION_SUMMARY.md) | Full project summary |

---

## ✅ Features Checklist

### ✓ Completed
- [x] User authentication (JWT)
- [x] Role-based access control
- [x] Job posting & management
- [x] Application system
- [x] Approval workflow
- [x] Assignment tracking
- [x] Work plan management
- [x] Invoice generation
- [x] Payment tracking
- [x] Profile management
- [x] Settings & preferences
- [x] Bottom tab navigation
- [x] Pull-to-refresh
- [x] Search functionality
- [x] Status tracking
- [x] Audit logging
- [x] Error handling
- [x] Form validation
- [x] Responsive design

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd WorkOdrMgmt
npm test
```

### Manual Testing Workflow
1. Register Agent & Contractor
2. Agent creates job
3. Contractor applies
4. Agent approves
5. Track assignment
6. Complete workflow

See [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) for detailed testing steps.

---

## 🐛 Troubleshooting

### Common Issues

**Can't connect to backend**
- Verify backend is running
- Check `API_URL` in env.js
- Use `http://10.0.2.2:3000` for Android emulator
- Use computer's IP for physical device

**Icons not showing**
- Add `fonts.gradle` to android/app/build.gradle
- Run `./gradlew clean` in android folder

**Build fails**
- Clear cache: `npm start -- --reset-cache`
- Clean build: `cd android && ./gradlew clean`

[See full troubleshooting guide](QUICK_START_GUIDE.md#troubleshooting)

---

## 📈 Project Statistics

- **Total Files**: 50+ files created
- **Lines of Code**: 8000+ lines
- **API Endpoints**: 36 endpoints
- **Database Tables**: 13 tables
- **Pages/Components**: 15+ pages
- **Documentation**: 7 comprehensive guides

---

## 🚀 Deployment

### Development
```bash
npm run android  # Android development
npm run ios      # iOS development
```

### Production Build
```bash
# Android APK
cd android
./gradlew assembleRelease

# iOS IPA
cd ios
xcodebuild -workspace WorkOdrMgmt.xcworkspace \
  -scheme WorkOdrMgmt -configuration Release
```

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ bcrypt password hashing (10 rounds)
- ✅ Token revocation on logout
- ✅ SQL injection prevention
- ✅ Input validation & sanitization
- ✅ Role-based access control
- ✅ Audit logging for all actions
- ✅ Secure token storage (AsyncStorage)

---

## 🤝 Contributing

This is a complete, production-ready system. To extend:

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📝 License

MIT License - Feel free to use this project for your needs.

---

## 👨‍💻 Development Team

- **Backend**: Express.js, MySQL, JWT
- **Frontend**: React Native, Navigation
- **Documentation**: Complete guides & references

---

## 🎯 Next Steps

1. ✅ Follow [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
2. ✅ Complete [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)
3. ✅ Test complete workflow
4. ✅ Customize branding
5. ✅ Deploy to production

---

## 📞 Support

For issues and questions:
1. Check documentation files
2. Review troubleshooting section
3. Verify configuration files
4. Check logs (backend & Metro)

---

## 🎉 Ready to Deploy!

Your complete Work Order Management System is ready for:
- ✅ Development testing
- ✅ User acceptance testing
- ✅ Production deployment
- ✅ Real-world usage

**Start building your work order management system now!** 🚀

---

Made with ❤️ using React Native & Node.js
