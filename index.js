const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

const JWT_SECRET_KEY = 'your_actual_secret_key_here';
// إعداد الـ session
app.use("/customer",session({secret: JWT_SECRET_KEY,resave: true, saveUninitialized: true}))




// Middleware للتحقق من التوثيق عند الوصول للمسارات التي تتطلب ذلك
app.use("/customer/auth/*", function auth(req,res,next){
    const accessToken = req.session.accessToken;
  // التحقق من وجود توكن
  if (!accessToken) {
    return res.status(401).json({ message: "Authentication required: No token found" });
  }
// Decode the JWT token to get the logged-in user's username
  // التحقق من صحة التوكن
  const decoded=  jwt.verify(accessToken, JWT_SECRET_KEY)
    const username = decoded.username;
    const isbn = req.params.isbn;
    const review = req.body.review; // The review text sent in the request body
    req.user = decoded.username; // إضافة اسم المستخدم إلى الـ request
    next(); // استدعاء الـ next للانتقال إلى المسار التالي
  });

const PORT =5100;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running in",PORT));
