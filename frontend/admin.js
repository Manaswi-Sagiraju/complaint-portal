const API_URL = "http://localhost:3000/api/complaints";


/* ===============================
   LOAD COMPLAINTS
================================= */
async function loadComplaints() {
    try {

        const statusFilter =
            document.getElementById("statusFilter").value;

        const response = await fetch(API_URL);
        let complaints = await response.json();

        // Apply Status Filter
        if (statusFilter) {
            complaints = complaints.filter(c =>
                (c.status || "Submitted") === statusFilter
            );
        }

        const tableBody =
            document.getElementById("complaintsTableBody");

        tableBody.innerHTML = "";

        let pending = 0;
        let investigation = 0;
        let resolved = 0;

        complaints.forEach(c => {

            const status = c.status || "Submitted";

            if (status === "Submitted") pending++;
            if (status === "Under Investigation") investigation++;
            if (status === "Resolved") resolved++;

            const submittedBy =
                c.is_anonymous == 1
                ? "Anonymous"
                : (c.user_name || "N/A");

            tableBody.innerHTML += `
                <tr>
                    <td>${c.complaint_id || c.id}</td>
                    <td>${c.category || "-"}</td>
                    <td>${c.incident_date || "-"}</td>

                    <td>
                        <select class="form-select form-select-sm"
                            onchange="updateStatus(${c.id}, this.value)">
                            <option ${status==="Submitted"?"selected":""}>Submitted</option>
                            <option ${status==="Under Investigation"?"selected":""}>Under Investigation</option>
                            <option ${status==="Resolved"?"selected":""}>Resolved</option>
                        </select>
                    </td>

                    <td>${c.priority || "Normal"}</td>
                    <td>${submittedBy}</td>

                    <td>
                        <button class="btn btn-sm btn-outline-info"
                            onclick="viewComplaint(${c.id})">
                            View
                        </button>
                    </td>
                </tr>
            `;
        });

        // Update Stats Cards
        document.getElementById("pendingCount").innerText = pending;
        document.getElementById("investigationCount").innerText = investigation;
        document.getElementById("resolvedCount").innerText = resolved;

    } catch (error) {
        console.error("Error loading complaints:", error);
        alert("Backend not running!");
    }
}


/* ===============================
   SEARCH BY ID
================================= */
async function searchComplaint() {

    const id =
        document.getElementById("searchInput").value.trim();

    if (!id) {
        loadComplaints();
        return;
    }

    const response = await fetch(API_URL);
    const complaints = await response.json();

    const filtered =
        complaints.filter(c =>
            String(c.id) === id ||
            String(c.complaint_id) === id
        );

    const tableBody =
        document.getElementById("complaintsTableBody");

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
        tableBody.innerHTML =
            `<tr><td colspan="7" class="text-center text-danger">
                No Complaint Found
             </td></tr>`;
        return;
    }

    filtered.forEach(c => {
        tableBody.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.category}</td>
                <td>${c.incident_date}</td>
                <td>${c.status || "Submitted"}</td>
                <td>${c.priority || "Normal"}</td>
                <td>${c.user_name || "Anonymous"}</td>
                <td>-</td>
            </tr>
        `;
    });
}


/* ===============================
   UPDATE STATUS
================================= */
async function updateStatus(id, newStatus) {

    try {

        await fetch(`${API_URL}/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: newStatus
            })
        });

        loadComplaints();

    } catch (error) {
        console.error("Status update failed:", error);
        alert("Status update failed!");
    }
}


/* ===============================
   EXPORT CSV
================================= */
async function downloadReport() {

    const response = await fetch(API_URL);
    const complaints = await response.json();

    let csv =
        "ID,Category,Date,Status,Priority,Submitted By\n";

    complaints.forEach(c => {
        csv += `${c.id},${c.category},${c.incident_date},${c.status || "Submitted"},${c.priority || "Normal"},${c.user_name || "Anonymous"}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints_report.csv";
    a.click();
}


/* ===============================
   VIEW (OPTIONAL)
================================= */
function viewComplaint(id) {
    alert("Complaint ID: " + id);
}


/* ===============================
   LOGOUT
================================= */
function logout() {
    alert("Logged out!");
    window.location.href = "index.html";
}


/* ===============================
   AUTO LOAD
================================= */
loadComplaints();
