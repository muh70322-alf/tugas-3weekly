/* =========================================================
   HSI STUDENT MANAGEMENT - CRUD + LocalStorage
   ========================================================= */

// ---------- 1. STATE ----------
let students = [];        // Array of objects
let editingId = null;     // null = mode tambah, angka = mode edit

// ---------- 2. DOM REFERENCES ----------
const studentForm    = document.getElementById('studentForm');
const nameInput      = document.getElementById('nameInput');
const scoreInput     = document.getElementById('scoreInput');
const submitBtn      = document.getElementById('submitBtn');
const cancelEditBtn  = document.getElementById('cancelEditBtn');
const formTitle      = document.getElementById('formTitle');
const studentList    = document.getElementById('studentList');
const totalStudents  = document.getElementById('totalStudents');
const averageScore   = document.getElementById('averageScore');
const alertMessage   = document.getElementById('alertMessage');

// ---------- 3. LOCALSTORAGE ----------
const STORAGE_KEY = 'students';

/**
 * Menyimpan array students ke LocalStorage
 */
function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

/**
 * Mengambil data students dari LocalStorage
 * Jika belum ada, return array kosong
 */
function loadStudents() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// ---------- 4. RENDER ----------
/**
 * Render ulang daftar siswa + statistik ke UI
 */
function renderStudents() {
    // Kosongkan list
    studentList.innerHTML = '';

    // Jika tidak ada data
    if (students.length === 0) {
        studentList.innerHTML = '<p class="empty-message">Belum ada data siswa.</p>';
        updateStats();
        return;
    }

    // Loop data students -> buat elemen HTML
    students.forEach((student, index) => {
        const item = document.createElement('div');
        item.className = 'student-item';

        // Tentukan warna badge berdasarkan nilai
        let badgeClass = 'score-low';
        if (student.score >= 85) badgeClass = 'score-high';
        else if (student.score >= 75) badgeClass = 'score-medium';

        item.innerHTML = `
            <div class="student-info">
                <div class="student-name">${index + 1}. ${student.name}</div>
                <div class="student-score">
                    Nilai: <span class="score-badge ${badgeClass}">${student.score}</span>
                </div>
            </div>
            <div class="student-actions">
                <button class="btn-edit"   onclick="editStudent(${student.id})">✏️ Ubah</button>
                <button class="btn-delete" onclick="deleteStudent(${student.id})">🗑️ Hapus</button>
            </div>
        `;

        studentList.appendChild(item);
    });

    updateStats();
}

/**
 * Update statistik: total siswa & rata-rata nilai
 */
function updateStats() {
    const total = students.length;
    totalStudents.textContent = total;

    if (total === 0) {
        averageScore.textContent = '0';
        return;
    }

    const sum = students.reduce((acc, s) => acc + Number(s.score), 0);
    const avg = sum / total;
    averageScore.textContent = avg.toFixed(1);
}

// ---------- 5. ALERT / NOTIFICATION ----------
let alertTimeout = null;

/**
 * Menampilkan pesan alert
 * @param {string} message - pesan yang ditampilkan
 * @param {string} type    - 'success' | 'update' | 'delete'
 */
function showAlert(message, type = 'success') {
    alertMessage.textContent = message;
    alertMessage.className = `alert show ${type}`;

    // Bonus: hilang otomatis setelah 3 detik
    if (alertTimeout) clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
        alertMessage.classList.remove('show');
    }, 3000);
}

// ---------- 6. CRUD ----------
/**
 * Generate ID baru (unik)
 */
function generateId() {
    if (students.length === 0) return 1;
    return Math.max(...students.map(s => s.id)) + 1;
}

/**
 * Handle submit form (Add atau Update)
 */
function handleSubmit(event) {
    event.preventDefault(); // cegah refresh

    const name  = nameInput.value.trim();
    const score = Number(scoreInput.value);

    // Validasi sederhana
    if (!name) {
        showAlert('⚠️ Nama siswa tidak boleh kosong.', 'delete');
        return;
    }
    if (isNaN(score) || score < 0 || score > 100) {
        showAlert('⚠️ Nilai harus berupa angka 0-100.', 'delete');
        return;
    }

    if (editingId === null) {
        // ---- MODE ADD ----
        addStudent(name, score);
    } else {
        // ---- MODE UPDATE ----
        updateStudent(editingId, name, score);
    }
}

/**
 * Tambah siswa baru
 */
function addStudent(name, score) {
    const newStudent = {
        id: generateId(),
        name: name,
        score: score
    };

    students.push(newStudent);
    saveStudents();
    renderStudents();
    resetForm();

    showAlert(`✅ Data siswa ${name} berhasil ditambahkan.`, 'success');
}

/**
 * Masuk ke mode edit: isi form dengan data student
 */
function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    // Isi form
    nameInput.value  = student.name;
    scoreInput.value = student.score;

    // Ubah state & tombol
    editingId = id;
    formTitle.textContent = '✏️ Edit Siswa';
    submitBtn.textContent = '💾 Update Siswa';
    cancelEditBtn.style.display = 'inline-block';

    nameInput.focus();
}

/**
 * Update data siswa
 */
function updateStudent(id, name, score) {
    const index = students.findIndex(s => s.id === id);
    if (index === -1) return;

    students[index].name  = name;
    students[index].score = score;

    saveStudents();
    renderStudents();
    resetForm();

    showAlert(`🔄 Data siswa ${name} berhasil diperbarui.`, 'update');
}

/**
 * Hapus siswa dengan confirm dialog
 */
function deleteStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    // Confirm dialog
    const yakin = confirm(`Apakah kamu yakin ingin menghapus siswa ${student.name}?`);
    if (!yakin) return; // Cancel -> tidak ada perubahan

    // Hapus dari array
    students = students.filter(s => s.id !== id);

    // Jika sedang edit student yang dihapus, reset form
    if (editingId === id) resetForm();

    saveStudents();
    renderStudents();

    showAlert(`🗑️ Data siswa ${student.name} berhasil dihapus.`, 'delete');
}

// ---------- 7. FORM HELPERS ----------
/**
 * Reset form ke mode tambah
 */
function resetForm() {
    studentForm.reset();
    editingId = null;
    formTitle.textContent = '➕ Tambah Siswa';
    submitBtn.textContent = '➕ Tambah Siswa';
    cancelEditBtn.style.display = 'none';
}

// ---------- 8. EVENT LISTENERS ----------
studentForm.addEventListener('submit', handleSubmit);
cancelEditBtn.addEventListener('click', resetForm);

// ---------- 9. INIT ----------
/**
 * Inisialisasi aplikasi
 */
function init() {
    students = loadStudents(); // ambil dari LocalStorage
    renderStudents();          // render ke UI
}

init();