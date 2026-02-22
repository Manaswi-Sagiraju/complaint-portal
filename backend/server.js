require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();   // ✅ CREATE APP FIRST

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);




// ✅ Add test route AFTER app is created
app.get('/test', (req, res) => {
    res.json({
        id: "TEST123",
        message: "Backend is working properly"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
