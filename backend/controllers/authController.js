const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (name,email,password) VALUES (?,?,?)",
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0)
            return res.status(400).json({ message: "User not found" });

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
