document.addEventListener("DOMContentLoaded", () => {
  // API Base Endpoint
  const API_BASE_URL = "http://localhost:8081/api";
  let employeesData = JSON.parse(localStorage.getItem("employees")) || [];
  loadEmployees();

  // DOM Elements
  const loginPage = document.getElementById("loginPage");
  const dashboardPage = document.getElementById("dashboardPage");
  const loginForm = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const logoutBtn = document.getElementById("logoutBtn");

  // Add Modal Elements
  const addModal = document.getElementById("addEmployeeModal");
  const addBtn = document.getElementById("addEmployeeBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const addEmployeeForm = document.getElementById("addEmployeeForm");

  // Edit Modal Elements
  const editModal = document.getElementById("editEmployeeModal");
  const closeEditModalBtn = document.getElementById("closeEditModalBtn");
  const editEmployeeForm = document.getElementById("editEmployeeForm");

  // Search and Filter Elements
  const searchInput = document.getElementById("searchEmployee");
  const deptFilter = document.getElementById("departmentFilter");

  // 1. Authentication Handlers
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");
    showToast("Logged in successfully");
    fetchEmployees();
  });

  logoutBtn?.addEventListener("click", () => {
    dashboardPage.classList.add("hidden");
    loginPage.classList.remove("hidden");
    showToast("Logged out successfully");
  });

  togglePassword?.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.querySelector("i").classList.toggle("fa-eye");
    togglePassword.querySelector("i").classList.toggle("fa-eye-slash");
  });

  // 2. Navigation Tabs
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const target = item.getAttribute("data-target");

      if (target === "add-employee-section") {
        openAddModal();
        return;
      }

      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active");
      });

      const activeTab = document.getElementById(target);
      if (activeTab) activeTab.classList.add("active");

      const titleMap = {
        "dashboard-section": [
          "Dashboard",
          "Welcome back! Here's what's happening today.",
        ],
        "employees-section": [
          "Employees",
          "Manage and view your active organization workforce.",
        ],
        "departments-section": [
          "Departments",
          "Overview of company divisions and structures.",
        ],
        "reports-section": [
          "Reports",
          "Analyze key metrics and export reports.",
        ],
        "settings-section": [
          "Settings",
          "Configure your account and system options.",
        ],
      };

      if (titleMap[target]) {
        document.getElementById("pageTitle").innerText = titleMap[target][0];
        document.getElementById("pageSubtitle").innerText = titleMap[target][1];
      }
    });
  });

  // 3. API Fetch & Dynamic Table Render
  async function fetchEmployees() {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (response.ok) {
        employeesData = await response.json();
      } else {
        throw new Error("Server responded with error");
      }
    } catch (error) {
      console.warn(
        "Backend API unavailable or CORS issue. Checking local context.",
      );
    }
    updatestats();
    populateDepartmentFilter();
    renderTable(employeesData);
  }

  function renderTable(data) {
    const tbody = document.getElementById("employeeTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state" style="text-align: center; padding: 20px;">
                        <i class="fa-solid fa-users"></i>
                        <h4>No employees found</h4>
                    </td>
                </tr>
            `;
      return;
    }

    data.forEach((emp) => {
      const fullName =
        emp.name ||
        `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
        "N/A";
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td><strong>${fullName}</strong></td>
                <td>${emp.department || "IT"}</td>
                <td>${emp.email || "N/A"}</td>
                <td>${emp.phone || "N/A"}</td>
                <td style="text-align: center;">
                    <button onclick="openEditModal(${emp.id})" style="background-color: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 6px;">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button onclick="deleteEmployee(${emp.id})" style="background-color: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  }

  // 4. Filtering and Search
  searchInput?.addEventListener("input", filterData);
  deptFilter?.addEventListener("change", filterData);

  function filterData() {
    const query = searchInput.value.toLowerCase();
    const selectedDept = deptFilter.value;

    const filtered = employeesData.filter((emp) => {
      const name =
        `${emp.firstName || ""} ${emp.lastName || ""} ${emp.name || ""}`.toLowerCase();
      const matchesSearch =
        name.includes(query) || emp.email?.toLowerCase().includes(query);
      const matchesDept =
        selectedDept === "" || emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });

    renderTable(filtered);
  }

  function populateDepartmentFilter() {
    if (!deptFilter) return;
    const depts = [
      ...new Set(employeesData.map((e) => e.department).filter(Boolean)),
    ];
    deptFilter.innerHTML = '<option value="">All Departments</option>';
    depts.forEach((d) => {
      deptFilter.innerHTML += `<option value="${d}">${d}</option>`;
    });
  }

  // 5. Statistics Overview Update
  function updatestats() {
    const totalElem = document.getElementById("totalEmployees");
    const activeElem = document.getElementById("activeEmployees");
    const deptElem = document.getElementById("totalDepartments");
    const newEmpElem = document.getElementById("newEmployees");

    if (totalElem && window.employeesData)
      totalElem.innerText = window.employeesData.length;
    if (activeElem && window.employeesData)
      activeElem.innerText = window.employeesData.length;
    if (newEmpElem && window.employeesData)
      newEmpElem.innerText = window.employeesData.length;

    // Dynamically set the department count based on defaultDepartments length
    if (deptElem && typeof defaultDepartments !== "undefined") {
      deptElem.innerText = defaultDepartments.length;
    }
  }

  // 6. Modal Functions (Add & Edit)
  addBtn?.addEventListener("click", openAddModal);
  closeModalBtn?.addEventListener("click", closeAddModal);

  function openAddModal() {
    addModal?.classList.remove("hidden");
  }

  function closeAddModal() {
    addModal?.classList.add("hidden");
    addEmployeeForm?.reset();
  }

  // POST: Add Employee Endpoint Mapping

  addEmployeeForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newEmpDTO = {
      firstName: document.getElementById("empFirstName").value,
      lastName: document.getElementById("empLastName").value,
      email: document.getElementById("empEmail").value,
      department: document.getElementById("empDepartment").value,
      phone: document.getElementById("empPhone").value,
    };

    try {
      // Updated port to 8081 to match running Spring Boot backend
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmpDTO),
      });

      if (res.ok) {
        const savedDTO = await res.json();
        employeesData.push(savedDTO);
      } else {
        // Fallback for non-200 responses
        newEmpDTO.id = Date.now();
        employeesData.push(newEmpDTO);
      }
    } catch (err) {
      console.warn(
        "Backend offline or request failed. Fallback to local data.",
        err,
      );
      newEmpDTO.id = Date.now();
      employeesData.push(newEmpDTO);
    }

    // 1. Persist updated array to browser storage so refresh won't erase it
    localStorage.setItem("employees", JSON.stringify(employeesData));

    // 2. Clear form input fields and close modal
    addEmployeeForm.reset();
    closeAddModal();

    // 3. Trigger UI refreshes across all sections
    showToast("Employee added successfully");
    renderTable(employeesData);
    updateStats();
    populateDepartmentFilter();

    if (typeof renderDepartments === "function") {
      renderDepartments(); // Dynamically updates department member counts
    }
  });

  // OPEN EDIT MODAL
  window.openEditModal = function (id) {
    const emp = employeesData.find((e) => e.id == id);
    if (!emp) return;

    document.getElementById("editEmpId").value = emp.id;
    document.getElementById("editEmpFirstName").value =
      emp.firstName || (emp.name ? emp.name.split(" ")[0] : "");
    document.getElementById("editEmpLastName").value =
      emp.lastName || (emp.name ? emp.name.split(" ")[1] : "");
    document.getElementById("editEmpEmail").value = emp.email || "";
    document.getElementById("editEmpDepartment").value = emp.department || "";
    document.getElementById("editEmpPhone").value = emp.phone || "";

    editModal?.classList.remove("hidden");
  };

  closeEditModalBtn?.addEventListener("click", () => {
    editModal?.classList.add("hidden");
  });

  // PUT: Update Employee Endpoint Mapping
  editEmployeeForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editEmpId").value;
    const updatedDTO = {
      firstName: document.getElementById("editEmpFirstName").value,
      lastName: document.getElementById("editEmpLastName").value,
      email: document.getElementById("editEmpEmail").value,
      department: document.getElementById("editEmpDepartment").value,
      phone: document.getElementById("editEmpPhone").value,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDTO),
      });

      if (res.ok) {
        const returnedDTO = await res.json();
        const index = employeesData.findIndex((e) => e.id == id);
        if (index !== -1) employeesData[index] = returnedDTO;
      }
    } catch (err) {
      const index = employeesData.findIndex((e) => e.id == id);
      if (index !== -1) {
        employeesData[index] = { ...employeesData[index], ...updatedDTO };
      }
    }

    editModal?.classList.add("hidden");
    showToast("Employee updated successfully");
    renderTable(employeesData);
    updatestats();
    populateDepartmentFilter();
  });

  // DELETE: Delete Employee Endpoint Mapping
  window.deleteEmployee = async function (index) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      // If your backend uses an id, you can fetch delete here, otherwise remove locally
      window.employeesData.splice(index, 1);
    } catch (err) {
      window.employeesData.splice(index, 1);
    }

    // Save the updated list to localStorage so stats and storage stay in sync
    localStorage.setItem("employees", JSON.stringify(window.employeesData));

    renderTable(window.employeesData);
    updatestats();
    populateDepartmentFilter();
    showToast("Employee deleted successfully");
  };

  // 7. Utility Functions
  function showToast(message) {
    const toast = document.getElementById("toast");
    const msg = document.getElementById("toastMessage");
    if (toast && msg) {
      msg.innerText = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);
    }
  }
});

// Load employees from localStorage on startup, or fall back to default list
let employeesData = JSON.parse(localStorage.getItem("employeesData")) || [
  {
    id: 1,
    firstName: "Ajay",
    lastName: "Sangwan",
    email: "ajay@gmail.com",
    department: "IT",
    phone: "1234567890",
  },
];

// Helper function to save current state
function saveToLocalStorage() {
  localStorage.setItem("employeesData", JSON.stringify(employeesData));
}

// Call saveToLocalStorage() inside your Add, Edit, and Delete functions:
function addEmployee(newEmp) {
  employeesData.push(newEmp);
  saveToLocalStorage(); // Saves state
  renderTable(employeesData);
}

function deleteEmployee(id) {
  employeesData = employeesData.filter((emp) => emp.id !== id);
  saveToLocalStorage(); // Saves state
  renderTable(employeesData);
}

//make change department section to look attractive

// Base department list with starting counts set to 0

let defaultDepartments = JSON.parse(localStorage.getItem("departments")) || [
  {
    name: "IT & Software",
    head: "Aman Patil",
    icon: "fa-laptop-code",
    color: "#4f46e5",
  },
  {
    name: "Human Resources",
    head: "Priya Sharma",
    icon: "fa-users-gear",
    color: "#ec4899",
  },
  {
    name: "Finance",
    head: "Rohan Mehta",
    icon: "fa-calculator",
    color: "#10b981",
  },
  {
    name: "Marketing",
    head: "Neha Verma",
    icon: "fa-bullhorn",
    color: "#f59e0b",
  },
];

function renderDepartments(data) {
  const grid = document.getElementById("departmentGrid");
  if (!grid) return;

  // Correctly prioritize data: use localStorage ONLY if it has items, otherwise use your hardcoded array
  let storedEmps = JSON.parse(localStorage.getItem("employees"));
  let employeesList =
    storedEmps && storedEmps.length > 0
      ? storedEmps
      : typeof employeesData !== "undefined"
        ? employeesData
        : window.employeesData || [];

  grid.innerHTML = defaultDepartments
    .map((dept) => {
      const count = employeesList.filter((emp) => {
        if (!emp) return false;
        const rawDept = emp.department || emp.dept || "";
        const empDept = String(rawDept).trim().toLowerCase();
        const deptName = String(dept.name).trim().toLowerCase();

        // Flexible matching for IT & Software and exact names
        if (empDept === deptName) return true;
        if (
          deptName.includes("it") &&
          (empDept === "it" || empDept.includes("it"))
        )
          return true;

        return false;
      }).length;

      return `
            <div class="dept-card">
                <div class="dept-header">
                    <div class="dept-icon" style="background: ${dept.color}15; color: ${dept.color}">
                        <i class="fa-solid ${dept.icon}"></i>
                    </div>
                    <span class="dept-badge">${count} Members</span>
                </div>
                <h4 class="dept-title">${dept.name}</h4>
                <p class="dept-lead"><i class="fa-regular fa-user"></i> Lead: <strong>${dept.head}</strong></p>
                <div class="dept-footer">
                    <button class="btn-text">View Team <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        `;
    })
    .join("");
}

async function loadEmployees() {
  let data = [];
  try {
    const res = await fetch(`${API_BASE_URL}/employees`);
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    console.warn("Backend unavailable, loading local fallback.");
  }

  // If API failed or returned empty, load from localStorage or use fallback data
  if (!Array.isArray(data) || data.length === 0) {
    data = JSON.parse(localStorage.getItem("employees"));
  }

  // Ultimate fallback if localStorage is also empty
  if (!Array.isArray(data) || data.length === 0) {
    data = [
      {
        name: "Pranav Surve",
        department: "IT",
        email: "pranav@gmail.com",
        phone: "9876543210",
      },
      {
        name: "Ajay Sangwan",
        department: "IT",
        email: "ajay@gmail.com",
        phone: "1234567809",
      },
    ];
    localStorage.setItem("employees", JSON.stringify(data));
  }

  window.employeesData = data;

  // Render everything safely
  const savedEmployees =
    JSON.parse(localStorage.getItem("employees")) || window.employeesData || [];
  window.employeesData = savedEmployees;

  if (typeof renderTable === "function") {
    renderTable(window.employeesData);
  }
  if (typeof updatestats === "function") {
    updatestats();
  }
  if (typeof renderDepartments === "function") {
    renderDepartments(window.employeesData);
  }
}

function updatestats() {
  const totalElem = document.getElementById("totalEmployees");
  const activeElem = document.getElementById("activeEmployees");
  const deptElem = document.getElementById("totalDepartments");

  if (totalElem && window.employeesData)
    totalElem.textContent = window.employeesData.length;
  if (activeElem && window.employeesData)
    activeElem.textContent = window.employeesData.length;

  // Dynamically set the department count based on defaultDepartments length
  if (deptElem && typeof defaultDepartments !== "undefined") {
    deptElem.textContent = defaultDepartments.length;
  }
}

//bell n administration at header:

function toggleNotifications() {
  const dropdown = document.getElementById("notificationDropdown");
  if (dropdown) {
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  }
}

// Close dropdown if clicked outside
window.addEventListener("click", function (e) {
  const bell = document.getElementById("bellIcon");
  const dropdown = document.getElementById("notificationDropdown");
  if (
    bell &&
    dropdown &&
    !bell.contains(e.target) &&
    !dropdown.contains(e.target)
  ) {
    dropdown.style.display = "none";
  }
});

//add department buttion

// Handle "+ Add Department" button click dynamically
document.addEventListener("click", function (e) {
  const targetBtn = e.target.closest("button");
  if (targetBtn && targetBtn.textContent.includes("Add Department")) {
    const deptName = prompt(
      "Enter new department name (e.g., Quality Assurance):",
    );
    if (!deptName || deptName.trim() === "") return;

    const deptHead = prompt("Enter department lead name (e.g., Rahul Sharma):");

    // Create the new department object
    const newDept = {
      name: deptName.trim(),
      head: deptHead ? deptHead.trim() : "Unassigned",
      icon: "fa-building", // Default icon
      color: "#3b82f6", // Default blue accent color
    };

    // Push to defaultDepartments and save to localStorage for persistence
    if (typeof defaultDepartments !== "undefined") {
      defaultDepartments.push(newDept);
      localStorage.setItem("departments", JSON.stringify(defaultDepartments));
    }

    // Re-render the department cards and refresh top statistics
    if (typeof renderDepartments === "function") {
      renderDepartments(window.employeesData);
    }
    if (typeof updatestats === "function") {
      updatestats();
    }
  }
});

function updateAdminProfile() {
  const savedName = localStorage.getItem("adminName") || "Admin";
  const savedRole = localStorage.getItem("adminRole") || "Administrator";

  const adminName = document.getElementById("adminNameText");
  const adminRole = document.getElementById("adminRoleText");
  const initialElem = document.getElementById("adminInitial");

  if (adminName) adminName.textContent = savedName;
  if (adminRole) adminRole.textContent = savedRole;
  if (initialElem && savedName.length > 0) {
    initialElem.textContent = savedName.charAt(0).toUpperCase();
  }
}

// 1. Dynamic Department Workforce Report Renderer
function renderReports() {
    const workforceContainer = document.getElementById("departmentWorkforceContainer");
    if (!workforceContainer) return;

    // Get current employees from window scope
    const employees = window.employeesData || [];
    workforceContainer.innerHTML = "";

    // Group employees by department
    const deptCounts = {};
    employees.forEach(emp => {
        const dept = emp.department || "Unassigned";
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const totalEmployees = employees.length || 1; // Prevent division by zero

    // Generate HTML for each department breakdown
    for (const [deptName, count] of Object.entries(deptCounts)) {
        const percentage = Math.round((count / totalEmployees) * 100);
        
        workforceContainer.innerHTML += `
            <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px; color: #475569;">
                    <span style="font-weight: 500">${deptName}</span>
                    <span style="font-weight: 600; color: #1e293b">${percentage}% (${count} ${count === 1 ? 'Member' : 'Members'})</span>
                </div>
                <div style="width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #4f46e5, #6366f1); border-radius: 4px;"></div>
                </div>
            </div>
        `;
    }
}

// 2. Run on Initial Page Load
document.addEventListener("DOMContentLoaded", () => {
    renderReports();
});

// 3. Trigger when switching to the Reports tab
// (Add this check inside your existing switchTab function)
function switchTab(tabName) {
    // Your existing tab-switching visibility logic goes here...
    
    // Ensure reports update dynamically when opened
    if (tabName === 'reports') {
        renderReports();
    }
}