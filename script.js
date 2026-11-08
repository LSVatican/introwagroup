// Konfigurasi Firebase (Ganti dengan kredensial Firebase Anda)
const firebaseConfig = {
  apiKey: "AIzaSyD3G0E7sRByY2K59WcIKzxTJMrpI1wXiWA",
  authDomain: "intro-wa-group.firebaseapp.com",
  projectId: "intro-wa-group",
  storageBucket: "intro-wa-group.firebasestorage.app",
  messagingSenderId: "968578541716",
  appId: "1:968578541716:web:a32bb11123672a4e5aac81"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const ADMIN_PIN = "507090";

// --- LOGIKA HALAMAN UTAMA (index.html) ---
const adminBtn = document.getElementById('adminBtn');
if (adminBtn) {
    const pinModal = document.getElementById('pinModal');
    const googleModal = document.getElementById('googleModal');
    const closePinModal = document.getElementById('closePinModal');
    const closeGoogleModal = document.getElementById('closeGoogleModal');
    const adminPinInput = document.getElementById('adminPinInput');
    const togglePin = document.getElementById('togglePin');
    const submitPinBtn = document.getElementById('submitPinBtn');
    const confirmAdminCheck = document.getElementById('confirmAdminCheck');
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    adminBtn.addEventListener('click', () => {
        pinModal.style.display = 'flex';
    });

    closePinModal.addEventListener('click', () => pinModal.style.display = 'none');
    closeGoogleModal.addEventListener('click', () => googleModal.style.display = 'none');

    togglePin.addEventListener('click', () => {
        if (adminPinInput.type === 'password') {
            adminPinInput.type = 'text';
            togglePin.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            adminPinInput.type = 'password';
            togglePin.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    submitPinBtn.addEventListener('click', () => {
        if (adminPinInput.value === ADMIN_PIN) {
            pinModal.style.display = 'none';
            adminPinInput.value = '';
            googleModal.style.display = 'flex';
        } else {
            alert('PIN Admin Salah!');
        }
    });

    confirmAdminCheck.addEventListener('change', (e) => {
        googleLoginBtn.disabled = !e.target.checked;
    });

    googleLoginBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                localStorage.setItem('isAdminLoggedIn', 'true');
                // Menyimpan nama akun Google, jika tidak ada pakai fallback "Admin"
                localStorage.setItem('adminName', result.user.displayName || 'Admin');
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                alert('Login Google Gagal: ' + error.message);
            });
    });

    const introForm = document.getElementById('introForm');
    if (introForm) {
        introForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const introData = {
                nama: document.getElementById('nama').value,
                umur: document.getElementById('umur').value,
                kelas: document.getElementById('kelas').value,
                gender: document.getElementById('gender').value,
                askot: document.getElementById('askot').value,
                hobby: document.getElementById('hobby').value,
                citacita: document.getElementById('citacita').value,
                tujuan: document.getElementById('tujuan').value
            };

            let listIntro = JSON.parse(localStorage.getItem('listIntro')) || [];
            listIntro.push(introData);
            localStorage.setItem('listIntro', JSON.stringify(listIntro));

            alert('Terima kasih! Intro kamu berhasil dikirim.');
            introForm.reset();
        });
    }
}

// --- LOGIKA HALAMAN DASHBOARD (dashboard.html) ---
if (window.location.pathname.includes('dashboard.html')) {
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'index.html';
    }

    // Menampilkan Nama Akun Google di Dashboard (bukan email)
    const emailDisplay = document.getElementById('adminEmailDisplay');
    if (emailDisplay) {
        emailDisplay.innerText = localStorage.getItem('adminName') || 'Admin';
    }

    function loadTableData() {
        const tableBody = document.getElementById('tableBody');
        let listIntro = JSON.parse(localStorage.getItem('listIntro')) || [];
        
        if (listIntro.length > 0) {
            tableBody.innerHTML = '';
            listIntro.forEach((item, index) => {
                const row = `<tr>
                    <td>${index + 1}</td>
                    <td>${item.nama}</td>
                    <td>${item.umur}</td>
                    <td>${item.kelas}</td>
                    <td>${item.gender}</td>
                    <td>${item.askot}</td>
                    <td>${item.hobby}</td>
                    <td>${item.citacita || '-'}</td>
                    <td>${item.tujuan}</td>
                    <td>
                        <button class="btn-danger btn-sm" onclick="deleteIntro(${index})">
                            <i class="fa-solid fa-trash"></i> Hapus
                        </button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center;">Belum ada data intro yang masuk.</td></tr>`;
        }
    }

    loadTableData();

    // Fungsi Hapus Satuan Data Intro
    window.deleteIntro = function(index) {
        if (confirm('Apakah Anda yakin ingin menghapus data intro ini?')) {
            let listIntro = JSON.parse(localStorage.getItem('listIntro')) || [];
            listIntro.splice(index, 1);
            localStorage.setItem('listIntro', JSON.stringify(listIntro));
            loadTableData();
        }
    };

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin logout dari halaman admin?')) {
            auth.signOut().then(() => {
                localStorage.removeItem('isAdminLoggedIn');
                localStorage.removeItem('adminName');
                window.location.href = 'index.html';
            });
        }
    });

    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const randomCodeBox = document.getElementById('randomCodeBox');
    const confirmCodeInput = document.getElementById('confirmCodeInput');
    const executeDeleteBtn = document.getElementById('executeDeleteBtn');
    let generatedCode = '';

    deleteAccountBtn.addEventListener('click', () => {
        generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        randomCodeBox.innerText = generatedCode;
        confirmCodeInput.value = '';
        deleteModal.style.display = 'flex';
    });

    closeDeleteModal.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    executeDeleteBtn.addEventListener('click', () => {
        if (confirmCodeInput.value === generatedCode) {
            const user = auth.currentUser;
            if (user) {
                user.delete().then(() => {
                    alert('Akun admin berhasil dihapus.');
                    localStorage.clear();
                    window.location.href = 'index.html';
                }).catch((error) => {
                    alert('Gagal menghapus akun: ' + error.message);
                });
            } else {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        } else {
            alert('Kode konfirmasi acak tidak sesuai!');
        }
    });
}
