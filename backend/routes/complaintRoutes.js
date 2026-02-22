const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const complaintController =
    require('../controllers/complaintController');

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' +
            file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ storage });

// Routes
router.post('/',
    upload.array('evidenceFiles'),
    complaintController.createComplaint
);

router.get('/',
    complaintController.getComplaints
);

router.put('/:id/status',
    complaintController.updateStatus
);

module.exports = router;
