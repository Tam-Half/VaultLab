const express = require('express')
const dotenv = require('dotenv')
const auth = require('./src/middleware/auth.js')
const authRoutes = require('./src/routes/authRotes.js')
const userRoutes = require('./src/routes/userRoutes.js')

const cors = require('cors');



dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api', auth, userRoutes);





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
