/* js/main.js - FINAL VERSION WITH VOICE RECORDING */

const API_BASE_URL = 'http://localhost:3000/api';

// Variables for Voice Recording
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;

window.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('anonymousToggle')) {
        togglePersonalDetails();
    }
});

// --- 1. VOICE RECORDING LOGIC (NEW) ---
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioPreview = document.getElementById('audioPreview');
            audioPreview.src = audioUrl;
            audioPreview.style.display = 'block';
            document.getElementById('audioMsg').style.display = 'block';
        };

        mediaRecorder.start();
        document.getElementById('startBtn').disabled = true;
        document.getElementById('startBtn').style.background = "#95a5a6";
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('stopBtn').style.background = "#2c3e50";
        document.getElementById('recordStatus').style.display = 'inline';
        
    } catch (err) {
        alert("Microphone access denied. Please enable permissions.");
        console.error(err);
    }
}

function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').style.background = "#e74c3c";
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('stopBtn').style.background = "#95a5a6";
        document.getElementById('recordStatus').style.display = 'none';
    }
}

// --- 2. GEOLOCATION ---
function getLocation() {
    const locInput = document.getElementById('location');
    if (navigator.geolocation) {
        locInput.value = "Fetching address...";
        locInput.disabled = true; 

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        locInput.value = data.display_name;
                    } else {
                        locInput.value = `Lat: ${lat}, Long: ${long}`;
                    }
                } catch (error) {
                    locInput.value = `Lat: ${lat}, Long: ${long}`;
                } finally {
                    locInput.disabled = false;
                }
            },
            (error) => {
                alert("Location access denied.");
                locInput.value = "";
                locInput.disabled = false;
            }
        );
    } else {
        alert("Geolocation not supported.");
    }
}

// --- 3. ADMIN LOGIN ---
const adminForm = document.getElementById('adminLoginForm');
if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPass').value;
        if (email === 'admin@gmail.com' && pass === 'admin123') {
            window.location.href = 'admin-dashboard.html'; 
        } else {
            alert('Invalid Credentials!');
        }
    });
}

// --- 4. FILE HANDLING ---
let selectedFiles = []; 
function handleFiles(files) {
    selectedFiles = Array.from(files); 
    const list = document.getElementById('fileList');
    list.innerHTML = ''; 
    selectedFiles.forEach(file => {
        const item = document.createElement('div');
        item.style.padding = "5px";
        item.style.borderBottom = '1px solid #eee';
        item.innerHTML = `<span>📎 ${file.name}</span> <small style="color:gray">(${Math.round(file.size/1024)} KB)</small>`;
        list.appendChild(item);
    });
}

// --- 5. COMPLAINT FORM SUBMISSION (UPDATED & CLEANED) ---
const complaintForm = document.getElementById('complaintForm');

if (complaintForm) {
    complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        togglePersonalDetails();

        if (!complaintForm.checkValidity()) {
            complaintForm.reportValidity();
            return;
        }

        const isAnonymous = document.getElementById('anonymousToggle').checked;
        const newId = "CMP-" + Date.now();

        const formData = new FormData();

        formData.append('complaint_id', newId);
        formData.append('category', document.getElementById('category').value);
        formData.append('incident_date', document.getElementById('incidentDate').value);
        formData.append('location', document.getElementById('location').value.trim());
        formData.append('description', document.getElementById('description').value.trim());
        formData.append('is_anonymous', isAnonymous);

        // Add user details if not anonymous
        if (!isAnonymous) {
            const userDetails = {
                name: document.getElementById('userName').value.trim(),
                email: document.getElementById('userEmail').value.trim(),
                phone: document.getElementById('userPhone').value.trim(),
                address: document.getElementById('userAddress').value.trim(),
                age: document.getElementById('userAge').value
            };

            formData.append('userDetails', JSON.stringify(userDetails));
        }

        // Append selected files
        selectedFiles.forEach(file => {
            formData.append('evidenceFiles', file);
        });

        // Append recorded audio
        if (audioBlob) {
            const audioFile = new File(
                [audioBlob],
                `voice_${newId}.webm`,
                { type: 'audio/webm' }
            );
            formData.append('evidenceFiles', audioFile);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/complaints`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {

                document.getElementById('modalComplaintId').textContent = newId;
                document.getElementById('successModal').classList.remove('hidden');

                // Reset form
                complaintForm.reset();
                document.getElementById('fileList').innerHTML = '';
                document.getElementById('audioPreview').style.display = 'none';
                document.getElementById('audioMsg').style.display = 'none';

                selectedFiles = [];
                audioBlob = null;

                if (isAnonymous) {
                    document.getElementById('anonymousToggle').checked = false;
                    togglePersonalDetails();
                }

            } else {
                alert("Server Error: " + (result.message || "Something went wrong"));
            }

        } catch (error) {
            console.error("Submission Error:", error);
            alert("❌ Failed to connect to server.");
        }
    });
}


// --- 6. TRACKING LOGIC ---
async function trackComplaint() {
    const idInput = document.getElementById('trackId').value.trim();
    const resultDiv = document.getElementById('statusResult');

    if (!idInput) { alert("Please paste your Complaint ID."); return; }

    resultDiv.innerHTML = "Searching server...";

    try {
        const response = await fetch(`${API_BASE_URL}/complaints/search/${idInput}`);
        if (response.ok) {
            const found = await response.json();
            let color = 'orange';
            if(found.status === 'resolved') color = 'green';
            if(found.status === 'under_investigation') color = '#e67e22';

            resultDiv.innerHTML = `
                <div style="padding: 15px; border: 1px solid #ccc; background: #fff; border-radius: 5px; text-align: left;">
                    <p><strong>Complaint ID:</strong> ${found.complaint_id}</p>
                    <p><strong>Status:</strong> <span style="color: ${color}; font-weight: bold; text-transform: capitalize;">${found.status.replace('_', ' ')}</span></p>
                    <p><strong>Category:</strong> ${found.category}</p>
                    <p><strong>Date:</strong> ${found.incident_date ? found.incident_date.split('T')[0] : 'N/A'}</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<span style="color: red;">❌ ID not found.</span>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<span style="color: red;">❌ Connection Error.</span>`;
    }
}
// --- 7. LOAD ADMIN DASHBOARD DATA ---
async function loadComplaints() {
    const tableBody = document.getElementById('complaintsTableBody');
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE_URL}/complaints`);
        const complaints = await response.json();

        tableBody.innerHTML = '';

        complaints.forEach(comp => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${comp.complaint_id}</td>
                <td>${comp.category}</td>
                <td>${comp.incident_location || comp.location}</td>
                <td>${comp.status}</td>
                <td>${comp.submitted_at ? comp.submitted_at.split('T')[0] : ''}</td>
                <td>
                    <select onchange="updateStatus(${comp.id}, this.value)">
                        <option value="submitted" ${comp.status === 'submitted' ? 'selected' : ''}>Submitted</option>
                        <option value="under_investigation" ${comp.status === 'under_investigation' ? 'selected' : ''}>Under Investigation</option>
                        <option value="resolved" ${comp.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading complaints:", error);
    }
}

async function updateStatus(id, newStatus) {
    try {
        await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        loadComplaints(); // Refresh table

    } catch (error) {
        console.error("Error updating status:", error);
    }
}

// Auto-load if on admin page
window.addEventListener('DOMContentLoaded', loadComplaints);
