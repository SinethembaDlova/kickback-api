# KickBack API

Backend API for KickBack Sneaker Cleaning Service built with Node.js, TypeScript, Express, MongoDB, and Mongoose.

## 🚀 Features

- ✅ JWT Authentication
- ✅ Role-based access control (Customer, Admin, Technician)
- ✅ User registration and login
- ✅ Password reset with email verification
- ✅ Order management
- ✅ Yoco payment integration
- ✅ MongoDB with Mongoose ODM
- ✅ TypeScript for type safety
- ✅ Email notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd kickback-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/kickback
JWT_SECRET=your-super-secret-key
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Start MongoDB
If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas (cloud) - update `MONGODB_URI` in `.env`

### 5. Run the development server
```bash
npm run dev
```

Server will start at `http://localhost:3001`

## 📁 Project Structure

```
kickback-api/
├── src/
│   ├── controllers/
│   │   ├── auth.ts                 # Authentication logic
│   │   ├── order.ts                # Order management
│   │   └── webhook.ts              # Yoco webhook handler
|   ├── middleware/
│   │   └── auth.ts                 # JWT authentication middleware
│   ├── models/
│   │   ├── User.ts                 # User schema
│   │   ├── PasswordReset.ts        # Order schema
│   │   └── Order.ts                # Password reset schema
│   ├── routes/
│   │   ├── auth.ts                 # Auth routes
│   │   ├── orders.ts               # Order routes
│   │   └── webhooks.ts             # Webhook routes
│   ├── services/
│   │   └── email.ts                # Email sending service
│   ├── types/
│   │   └── express.d.ts            # express types
│   │   └── jwt.ts                  # JWT types
│   ├── utils/
│   │   └── jwt.ts                  # JWT utilities
│   └── server.ts                   # Main server file
├── .env.example                    # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new account | No |
| POST | `/api/auth/signin` | Sign in | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/verify-code` | Verify reset code | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/refresh` | Refresh JWT token | Yes |

### Orders

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/orders` | Create order | Yes | All |
| GET | `/api/orders` | Get all orders | Yes | All |
| GET | `/api/orders/:orderId` | Get order by ID | Yes | All |
| PATCH | `/api/orders/:orderId` | Update order status | Yes | Admin, Technician |
| PATCH | `/api/orders/:orderId/after-photos` | Upload after photos | Yes | Admin, Technician |
| PATCH | `/api/orders/:orderId/payment` | Update payment | Yes | All |

### Webhooks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/webhooks/yoco` | Yoco payment webhook | No (signature verified) |

## 🧪 Testing Endpoints

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+27123456789"
  }'
```

### 3. Sign In
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### 4. Get Current User
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 👥 User Roles

### Customer (default)
- Create orders
- View own orders
- Update payment status

### Technician
- View all orders
- Update order status
- Upload after-cleaning photos

### Admin
- Full system access
- Manage all users and orders

## 💳 Yoco Payment Integration

### Setup Webhook
1. Go to Yoco Dashboard → Developers → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/yoco`
3. Select events: `payment.succeeded`, `payment.failed`, `refund.succeeded`
4. Copy webhook secret to `.env`

### Testing Payments
Use Yoco test cards:
- **Success**: 4242 4242 4242 4242
- **Failure**: 4000 0000 0000 0002

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password at: https://myaccount.google.com/apppasswords
3. Use App Password in `SMTP_PASS`

### Other Providers
Update `SMTP_HOST`, `SMTP_PORT` in `.env`

## 🏗️ Production Deployment

### 1. Build the project
```bash
npm run build
```

### 2. Set production environment variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secure-random-string
FRONTEND_URL=https://yourdomain.com
```

### 3. Start the production server
```bash
npm start
```

### 4. Recommended: Use PM2
```bash
npm install -g pm2
pm2 start dist/server.js --name kickback-api
pm2 save
pm2 startup
```

## 🔒 Security Best Practices

✅ **Password Hashing**: bcrypt with 12 salt rounds  
✅ **JWT Tokens**: Secure secret, 7-day expiration  
✅ **CORS**: Configured for frontend only  
✅ **Input Validation**: Required fields validated  
✅ **Rate Limiting**: Recommended for production  
✅ **HTTPS**: Required for production  
✅ **Environment Variables**: Never commit `.env`  
✅ **Webhook Verification**: Signature validation  

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Email Sending Failed
- Check SMTP credentials
- Verify App Password (for Gmail)
- Check firewall settings

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Yoco API Docs](https://developer.yoco.com/)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

Built with ❤️ for KickBack Sneaker Cleaning Service