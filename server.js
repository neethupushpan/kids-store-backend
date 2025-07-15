const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const router = require('./routes/app');
const paymentRoutes = require('./routes/paymentRoutes');
console.log('✅ Payment routes loaded'); 
const reviewRoutes = require('./routes/reviewRoutes');
//const productRoutes = require('./routes/productRoutes'); // or correct path

const orderRoutes = require('./routes/orderRoutes');

dotenv.config(); // ✅ Load environment variables
console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS setup (now dynamic from .env)
const allowedOrigins = [
  'https://kids-store-frontend.vercel.app',
  'https://kids-store-frontend-23xqtdxpc-neethu-pushpans-projects.vercel.app',
  'http://localhost:5190'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));



// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ Connect to MongoDB
connectDB();

// ✅ Routes
app.use('/api/auth', authRoutes); 
app.use('/api', router);
app.use('/api/payment', paymentRoutes); 

app.use('/api/reviews', reviewRoutes);


// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
