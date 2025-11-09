import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyByxIQKLvLfKATJicWtacdTJG8nb5hsVCI",
  authDomain: "realtime-database-7e415.firebaseapp.com",
  databaseURL: "https://realtime-database-7e415-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "realtime-database-7e415",
  storageBucket: "realtime-database-7e415.appspot.com",
  messagingSenderId: "817516970962",
  appId: "1:817516970962:web:YOUR_APP_ID_IF_AVAILABLE"
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Database + Auth
const database = getDatabase(app);
const auth = getAuth(app);

class StudentRegistrationSystem {
  constructor() {
    this.students = [];
    this.database = database;
    this.auth = auth;
    this.initializeAuth();
    this.initializeEventListeners();
    this.studentsByDate = {};
    this.todayStr = this.getTodayString();
    this.setupDatePicker();
  }

  // Add: Helper to get `yyyy-mm-dd` for current day
  getTodayString() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  // Setup the calendar date picker logic
  setupDatePicker() {
    const picker = document.getElementById('studentsDatePicker');
    if (!picker) return;
    const todayStr = this.getTodayString();
    picker.value = todayStr;
    picker.max = todayStr;
    picker.addEventListener('change', (e) => {
        const selDate = e.target.value;
        this.renderStudentsForDay(selDate);
    });
  }

  initializeAuth() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log("[v9] User authenticated:", user.uid);
        this.loadStudentsFromFirebase();
      } else {
        console.log("[v9] No user, signing in anonymously...");
        this.signInAnonymously();
      }
    });
  }

  async signInAnonymously() {
    try {
      await signInAnonymously(this.auth);
      this.showToast("Connected to database!", "success");
    } catch (error) {
      console.error("Anonymous sign-in error:", error);
      this.showToast("Failed to connect to database", "error");
    }
  }
  
  initializeEventListeners() {
    document.getElementById("studentForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleFormSubmission()
    })

    const strandSelect = document.getElementById("strandSelect")
    console.log("[v0] Strand select element found:", strandSelect)

    strandSelect.addEventListener("change", (e) => {
      console.log("[v0] STRAND CHANGE EVENT FIRED!")
      console.log("[v0] Event target:", e.target)
      console.log("[v0] Selected value:", e.target.value)
      console.log("[v0] Selected text:", e.target.options[e.target.selectedIndex].text)
      this.updateGradeOptions(e.target.value)
    })

    document.getElementById("studentNumber").addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11)
    })

    document.getElementById("studentName").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        document.getElementById("studentNumber").focus()
      }
    })
  }

  updateGradeOptions(selectedStrand) {
    console.log("[v0] ===== UPDATE GRADE OPTIONS START =====")
    console.log("[v0] Input parameter:", selectedStrand)

    const gradeSelect = document.getElementById("gradeSelect")
    console.log("[v0] Grade select element:", gradeSelect)

    console.log("[v0] Clearing existing options...")
    gradeSelect.innerHTML = ""
    gradeSelect.disabled = true

    const defaultOption = document.createElement("option")
    defaultOption.value = ""
    defaultOption.textContent = "Select Grade/Year"
    gradeSelect.appendChild(defaultOption)
    console.log("[v0] Added default option")

    if (!selectedStrand || selectedStrand === "") {
      console.log("[v0] No strand selected, keeping disabled")
      console.log("[v0] ===== UPDATE GRADE OPTIONS END =====")
      return
    }

    let options = []
    console.log("[v0] Checking strand value:", `"${selectedStrand}"`)

    if (selectedStrand === "CA") {
      console.log("[v0] Matched CA - Culinary Arts")
      options = ["Grade 11", "Grade 12"]
    } else if (selectedStrand === "GAS") {
      console.log("[v0] Matched GAS - General Academic Strand")
      options = ["Grade 11", "Grade 12"]
    } else if (selectedStrand === "HUMSS") {
      console.log("[v0] Matched HUMSS")
      options = ["Grade 11", "Grade 12"]
    } else if (selectedStrand === "ITMAWD") {
      console.log("[v0] Matched ITMAWD")
      options = ["Grade 11", "Grade 12"]
    } else if (selectedStrand === "STEM") {
      console.log("[v0] Matched STEM")
      options = ["Grade 11", "Grade 12"]
    } else if (selectedStrand === "TO") {
      console.log("[v0] Matched TO")
      options = ["Grade 11", "Grade 12"]
    } else if (selectedStrand === "BSHM") {
      console.log("[v0] Matched BSHM")
      options = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    } else if (selectedStrand === "BSCPE") {
      console.log("[v0] Matched BSCPE")
      options = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    } else if (selectedStrand === "BSIT") {
      console.log("[v0] Matched BSIT")
      options = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    } else {
      console.log("[v0] NO MATCH FOUND for strand:", selectedStrand)
      console.log("[v0] Available strands: CA, GAS, HUMSS, ITMAWD, STEM, TO, BSHM, BSCPE, BSIT")
    }

    console.log("[v0] Grade options to add:", options)

    if (options.length > 0) {
      options.forEach((option, index) => {
        const optionElement = document.createElement("option")
        optionElement.value = option
        optionElement.textContent = option
        gradeSelect.appendChild(optionElement)
        console.log(`[v0] Added option ${index + 1}:`, option)
      })
      gradeSelect.disabled = false
      console.log("[v0] Grade select ENABLED with", options.length, "options")
    } else {
      console.log("[v0] NO OPTIONS ADDED - Grade select remains disabled")
    }

    console.log("[v0] Final dropdown state:")
    console.log("[v0] - Children count:", gradeSelect.children.length)
    console.log("[v0] - Disabled:", gradeSelect.disabled)
    console.log("[v0] - HTML:", gradeSelect.innerHTML)
    console.log("[v0] ===== UPDATE GRADE OPTIONS END =====")
  }

  async handleFormSubmission() {
    const formData = new FormData(document.getElementById("studentForm"))
    const studentData = {
      name: formData.get("studentName").trim(),
      studentNumber: formData.get("studentNumber").trim(),
      strand: formData.get("strand"),
      grade: formData.get("grade"),
      dateAdded: this.getTodayString(), // Save date for registration!
    }

    console.log("[v0] Form submission data:", studentData)

    if (!this.validateStudentData(studentData)) {
      return
    }

    // Check if student already exists
    if (this.students.some((student) => student.studentNumber === studentData.studentNumber)) {
      this.showToast("Student number already exists!", "error")
      return
    }

    try {
      await this.saveStudentToFirebase(studentData)

      this.students.unshift({ ...studentData }) // dateAdded will exist
      this.buildStudentsByDate()
      this.renderStudentsForDay(studentData.dateAdded) // Update today's tab
      this.updateStudentsList()
      this.updateStudentCount()
      this.clearForm()
      this.showToast("Student added successfully!", "success")
    } catch (error) {
      console.error("Error saving student:", error)
      this.showToast("Error saving student data: " + error.message, "error")
    }
  }

  validateStudentData(data) {
    if (!data.name || !data.studentNumber || !data.strand || !data.grade) {
      this.showToast("Please fill in all fields correctly", "error")
      return false
    }

    if (data.studentNumber.length !== 11) {
      this.showToast("Student number must be exactly 11 digits!", "error")
      return false
    }

    if (!/^\d{11}$/.test(data.studentNumber)) {
      this.showToast("Student number must contain only numbers!", "error")
      return false
    }

    return true
  }

  async loadStudentsFromFirebase() {
    try {
      const studentsRef = ref(this.database, "Students");
      const snapshot = await get(studentsRef);

      if (snapshot.exists()) {
        const studentsData = snapshot.val();
        // Spread dateAdded field if present, or fallback to unknown
        this.students = Object.keys(studentsData).map((studentNumber) => {
          const obj = studentsData[studentNumber];
          return {
            ...obj,
            dateAdded: obj.dateAdded || this.getTodayString(),
          };
        });
        this.buildStudentsByDate();
        this.renderStudentsForDay(this.getTodayString()); // Default: today
        this.updateStudentCount();
        this.updateStudentsList(); // (full unfiltered list)
        this.showToast("Student data loaded successfully!", "success");
      } else {
        this.students = [];
        this.studentsByDate = {};
        this.renderStudentsForDay(this.getTodayString());
        this.updateStudentCount();
        this.showToast("No existing student data found", "info");
      }
    } catch (error) {
      console.error("Error loading students:", error);
      this.showToast("Error loading student data: " + error.message, "error");
    }
  }

  // Map (cache) students grouped by date
  buildStudentsByDate() {
    this.studentsByDate = {};
    for (const student of this.students) {
      const d = (student.dateAdded||"").substring(0, 10); // yyyy-mm-dd
      if (!this.studentsByDate[d]) this.studentsByDate[d] = [];
      this.studentsByDate[d].push(student);
    }
    this.renderStudentsPerDaySummary();
  }

  // Render summary under the calendar: x students per date
  renderStudentsPerDaySummary() {
    const sumDiv = document.getElementById("studentsPerDaySummary");
    if (!sumDiv) return;
    const dates = Object.keys(this.studentsByDate).sort().reverse(); // latest first
    if (dates.length === 0) {
      sumDiv.innerHTML = '<p style="color:#6b7280;font-size:0.95em;padding:0.2em 0;">No registration activity yet.</p>';
      return;
    }
    // Find which date has the max count for highlight
    let maxCount = 0, maxDate = '';
    for(const d of dates) { if(this.studentsByDate[d].length > maxCount) { maxCount = this.studentsByDate[d].length; maxDate = d; } }
    sumDiv.innerHTML = dates.map(d => {
      const n = this.studentsByDate[d].length;
      const c = d === maxDate ? 'highlight-max' : '';
      return `<div class="${c}" data-summary-date="${d}" title="Show students for this date"><b>${d}</b>: <span style=\"background:#1e3a8a0b;padding:2px 9px 2px 8px;border-radius:7px;font-variant-numeric:tabular-nums;color:#1e3a8a;font-weight:500;\">${n}</span> student${n===1?"":"s"}</div>`;
    }).join("");
    // Add click listeners: jump to date & update calendar
    Array.from(sumDiv.querySelectorAll('[data-summary-date]')).forEach(div => {
      div.addEventListener('click', (e) => {
        const d = div.getAttribute('data-summary-date');
        const picker = document.getElementById('studentsDatePicker');
        if (picker) picker.value = d;
        this.renderStudentsForDay(d);
      });
    });
  }

  // When calendar/date selected or after a new registration, show per-day students
  renderStudentsForDay(dayStr = "") {
    dayStr = dayStr || this.getTodayString();
    const students = this.studentsByDate[dayStr] || [];
    const container = document.getElementById("studentsForDayContainer");
    if (!container) return;
    if (students.length === 0) {
      container.innerHTML = `<div class=\"empty-state\"><i class=\"fas fa-users\"></i><p>No students registered for this day</p></div>`;
      return;
    }
    container.innerHTML = students
      .slice(0, 10)
      .map((student) => `
        <div class=\"student-card\">
         <div class=\"student-name\">${student.name}</div>
         <div class=\"student-details\">
           <span><i class=\"fas fa-id-card\"></i> ${student.studentNumber}</span>
           <span><i class=\"fas fa-book\"></i> ${student.strand}</span>
           <span><i class=\"fas fa-layer-group\"></i> ${student.grade}</span>
         </div>
        </div>
      `).join("");
  }

  updateStudentsList() {
    const container = document.getElementById("studentsContainer")

    if (this.students.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No students added yet</p>
                </div>
            `
      return
    }

    container.innerHTML = this.students
      .slice(0, 10)
      .map(
        (student) => `
            <div class="student-card">
                <div class="student-name">${student.name}</div>
                <div class="student-details">
                    <span><i class="fas fa-id-card"></i> ${student.studentNumber}</span>
                    <span><i class="fas fa-book"></i> ${student.strand}</span>
                    <span><i class="fas fa-layer-group"></i> ${student.grade}</span>
                </div>
            </div>
        `,
      )
      .join("")
  }

  updateStudentCount() {
    document.getElementById("studentCount").textContent =
      `${this.students.length} student${this.students.length !== 1 ? "s" : ""}`
  }

  getShortStrand(fullStrand) {
    return fullStrand.includes(" - ") ? fullStrand.split(" - ")[0] : fullStrand
  }

  clearForm() {
    document.getElementById("studentForm").reset()
    const gradeSelect = document.getElementById("gradeSelect")
    gradeSelect.innerHTML = ""
    const defaultOption = document.createElement("option")
    defaultOption.value = ""
    defaultOption.textContent = "Select Grade/Year"
    gradeSelect.appendChild(defaultOption)
    gradeSelect.disabled = true
    console.log("[v0] Form cleared and grade select reset")
  }

  async saveStudentToFirebase(studentData) {
    const studentRef = ref(this.database, `Students/${studentData.studentNumber}`);
    const firebaseStudentData = {
      name: studentData.name,
      studentNumber: studentData.studentNumber,
      strand: studentData.strand,
      grade: studentData.grade,
      sessions: {},
      dateAdded: studentData.dateAdded || this.getTodayString()
    };
    console.log("[v0] Saving to Firebase:", firebaseStudentData)
    await set(studentRef, firebaseStudentData)
    console.log("[v0] Successfully saved to Firebase")
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toast")
    const icon = toast.querySelector(".toast-icon")
    const messageEl = toast.querySelector(".toast-message")

    messageEl.textContent = message

    if (type === "success") {
      icon.className = "toast-icon fas fa-check-circle"
      toast.className = "toast success"
    } else if (type === "info") {
      icon.className = "toast-icon fas fa-info-circle"
      toast.className = "toast info"
    } else {
      icon.className = "toast-icon fas fa-exclamation-circle"
      toast.className = "toast error"
    }

    toast.classList.add("show")

    setTimeout(() => {
      toast.classList.remove("show")
    }, 3000)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new StudentRegistrationSystem()
})
