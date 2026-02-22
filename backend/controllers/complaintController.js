const db = require('../config/db');
const sendEmailNotification = require('../utils/email');


// CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
    try {
        const { id, description, category, date, location, isAnonymous, userDetails } = req.body;

        let priority = 'medium';
        const urgentKeywords = ["kill", "threat", "weapon", "hurt", "attack", "suicide", "danger"];

        if (description && urgentKeywords.some(word =>
            description.toLowerCase().includes(word)
        )) {
            priority = 'urgent';
        }

        const fileData = req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            path: `/uploads/${file.filename}`
        }));

        const filesJSON = JSON.stringify(fileData);

        let parsedUserDetails = null;
        let userEmail = null;

        if (isAnonymous !== 'true' && userDetails) {
            try {
                parsedUserDetails = JSON.parse(userDetails);
                userEmail = parsedUserDetails.email;
            } catch (e) {
                parsedUserDetails = userDetails;
            }
        }

        const userDetailsVal =
            (isAnonymous === 'true') ? null : JSON.stringify(parsedUserDetails);

        const sql = `
        INSERT INTO complaints
        (complaint_id, description, category, incident_date, incident_location,
        is_anonymous, user_details, files, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            id, description, category, date, location,
            (isAnonymous === 'true'),
            userDetailsVal,
            filesJSON,
            priority
        ];

        await db.query(sql, values);

        if (userEmail) {
            const subject = `Complaint Registered: ${id}`;
            const message = `Hello ${parsedUserDetails.name},

Your complaint has been registered.

Tracking ID: ${id}
Status: Submitted

SafeReport Team`;

            sendEmailNotification(userEmail, subject, message);
        }

        res.status(201).json({ success: true });

    } catch (error) {
        console.error("❌ ERROR:", error.message);
        res.status(500).json({ success: false });
    }
};


// GET ALL
exports.getComplaints = async (req, res) => {
    try {
        const sql = 'SELECT * FROM complaints ORDER BY submitted_at DESC';

        const [results] = await db.query(sql);

        const formatted = results.map(row => {
            let details = row.user_details;
            let files = row.files;

            if (typeof details === 'string') {
                try { details = JSON.parse(details); }
                catch { details = null; }
            }

            if (typeof files === 'string') {
                try { files = JSON.parse(files); }
                catch { files = []; }
            }

            return { ...row, userDetails: details, files };
        });

        res.json(formatted);

    } catch (error) {
        console.error("❌ ERROR:", error.message);
        res.status(500).json({ success: false });
    }
};


// UPDATE STATUS
exports.updateStatus = async (req, res) => {
    try {
        const newStatus = req.body.status;
        const complaintId = req.params.id;

        const findUserSql =
            "SELECT user_details FROM complaints WHERE complaint_id = ?";

        const [results] = await db.query(findUserSql, [complaintId]);

        if (results.length === 0)
            return res.status(404).json({ success: false });

        let userEmail = null;
        let userName = "User";

        if (results[0].user_details) {
            try {
                const details = JSON.parse(results[0].user_details);
                userEmail = details.email;
                userName = details.name;
            } catch {}
        }

        const updateSql =
            'UPDATE complaints SET status = ? WHERE complaint_id = ?';

        await db.query(updateSql, [newStatus, complaintId]);

        if (userEmail) {
            const subject =
                `Status Update: Complaint ${complaintId}`;

            const message =
                `Hello ${userName},

New Status: ${newStatus}

SafeReport Admin`;

            sendEmailNotification(userEmail, subject, message);
        }

        res.json({ success: true });

    } catch (error) {
        console.error("❌ ERROR:", error.message);
        res.status(500).json({ success: false });
    }
};
