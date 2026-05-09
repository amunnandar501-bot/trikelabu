/* =============================================
   ELAINA WEBSITE — Interactive JS
   ============================================= */

// ---- CUSTOM CURSOR ----
const cursorStar = document.getElementById('cursorStar');
document.addEventListener('mousemove', (e) => {
  if (cursorStar) {
    cursorStar.style.left = e.clientX + 'px';
    cursorStar.style.top  = e.clientY + 'px';
  }
});

// ---- PARTICLE CANVAS ----
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const SYMBOLS = ['✦', '✧', '⋆', '·', '★', '✩'];

function makeParticle() {
  return {
    x:     Math.random() * W,
    y:     Math.random() * H + H,
    vx:    (Math.random() - 0.5) * 0.4,
    vy:    -(Math.random() * 0.8 + 0.2),
    size:  Math.random() * 12 + 6,
    alpha: Math.random() * 0.5 + 0.1,
    sym:   SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    hue:   Math.random() > 0.5 ? '#a78bfa' : '#fbbf24',
  };
}

for (let i = 0; i < 70; i++) {
  const p = makeParticle();
  p.y = Math.random() * H; // start scattered
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  for (let p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle   = p.hue;
    ctx.font        = `${p.size}px serif`;
    ctx.fillText(p.sym, p.x, p.y);
    ctx.restore();
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -20) {
      Object.assign(p, makeParticle());
    }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ---- MUSIC PLAYER ----
const bgMusic   = document.getElementById('bgMusic');
const musicBtn  = document.getElementById('musicBtn');
const musicDisc = document.getElementById('musicDisc');
let isPlaying   = false;

// Try to restore music preference
if (localStorage.getItem('elaina_music') === 'on') {
  bgMusic.volume = 0.4;
  bgMusic.play().then(() => {
    isPlaying = true;
    musicBtn.textContent  = '⏸';
    musicDisc.classList.add('playing');
  }).catch(() => {});
}

function toggleMusic() {
  if (!isPlaying) {
    bgMusic.volume = 0.4;
    bgMusic.play().catch(() => {});
    musicBtn.textContent  = '⏸';
    musicDisc.classList.add('playing');
    isPlaying = true;
    localStorage.setItem('elaina_music', 'on');
  } else {
    bgMusic.pause();
    musicBtn.textContent = '▶';
    musicDisc.classList.remove('playing');
    isPlaying = false;
    localStorage.setItem('elaina_music', 'off');
  }
}

// ---- LOVE COUNTER ----
let loveCount = parseInt(localStorage.getItem('elaina_love') || '0');
updateLoveUI();

function updateLoveUI() {
  const el1 = document.getElementById('loveCount');
  const el2 = document.getElementById('loveBig');
  if (el1) el1.textContent = loveCount;
  if (el2) el2.textContent = loveCount.toLocaleString();
}

function addLove() {
  loveCount++;
  localStorage.setItem('elaina_love', loveCount);
  updateLoveUI();

  const heart = document.getElementById('heartIcon');
  if (heart) {
    heart.textContent = '💜';
    setTimeout(() => { heart.textContent = '💜'; }, 300);
  }

  // Burst effect at cursor position
  spawnHeartBurst();
  showToast('💜 +1 Cinta untuk Elaina!');
}

function spawnHeartBurst() {
  const el = document.createElement('div');
  el.className   = 'heart-burst';
  el.textContent = ['💜','💜','✨','⭐'][Math.floor(Math.random()*4)];
  el.style.left  = (Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1) + 'px';
  el.style.top   = (window.innerHeight * 0.6) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// ---- VISITOR COUNTER ----
let visitors = parseInt(localStorage.getItem('elaina_visitors') || '0') + 1;
localStorage.setItem('elaina_visitors', visitors);
const visitorEl = document.getElementById('visitorCount');
if (visitorEl) visitorEl.textContent = visitors.toLocaleString();

// ---- TOAST ----
let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('elaina-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id        = 'elaina-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---- GUESTBOOK ----
const GB_KEY = 'elaina_guestbook';

function getMessages() {
  try { return JSON.parse(localStorage.getItem(GB_KEY) || '[]'); }
  catch(e) { return []; }
}

function saveMessages(msgs) {
  localStorage.setItem(GB_KEY, JSON.stringify(msgs.slice(-50))); // max 50
}

const AVATARS = ['🧙‍♀️','🌟','💜','🪄','✨','🌙','⭐','🦋','🌸','🔮'];
function getAvatar(name) {
  let hash = 0;
  for (let c of name) hash += c.charCodeAt(0);
  return AVATARS[hash % AVATARS.length];
}

function timeAgo(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60)   return 'baru saja';
  if (d < 3600) return Math.floor(d/60) + ' menit lalu';
  if (d < 86400)return Math.floor(d/3600) + ' jam lalu';
  return Math.floor(d/86400) + ' hari lalu';
}

function renderMessages() {
  const grid = document.getElementById('messagesGrid');
  if (!grid) return;
  const msgs = getMessages().slice().reverse(); // newest first
  if (!msgs.length) {
    grid.innerHTML = '<div class="empty-msg">✦ Belum ada pesan. Jadilah yang pertama! ✦</div>';
    return;
  }
  grid.innerHTML = msgs.map(m => `
    <div class="msg-card">
      <div class="msg-header">
        <div class="msg-avatar">${getAvatar(m.name)}</div>
        <div>
          <div class="msg-name">${escapeHtml(m.name)}</div>
          <div class="msg-time">${timeAgo(m.ts)}</div>
        </div>
      </div>
      <div class="msg-text">${escapeHtml(m.msg)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function submitMessage() {
  const nameEl = document.getElementById('gbName');
  const msgEl  = document.getElementById('gbMsg');
  if (!nameEl || !msgEl) return;

  const name = nameEl.value.trim();
  const msg  = msgEl.value.trim();

  if (!name) { showToast('⚠️ Masukin nama kamu dulu!'); nameEl.focus(); return; }
  if (!msg)  { showToast('⚠️ Pesannya kosong nih!'); msgEl.focus(); return; }

  const msgs = getMessages();
  msgs.push({ name, msg, ts: Date.now() });
  saveMessages(msgs);

  nameEl.value = '';
  msgEl.value  = '';
  updateCharCount();
  renderMessages();
  showToast('💌 Pesan terkirim, makasih!');
}

// Char counter
const gbMsg = document.getElementById('gbMsg');
const charCountEl = document.getElementById('charCount');
function updateCharCount() {
  if (!gbMsg || !charCountEl) return;
  const len = (gbMsg.value || '').length;
  charCountEl.textContent = len + '/150';
  charCountEl.style.color = len > 130 ? '#f472b6' : 'rgba(255,255,255,0.3)';
}
if (gbMsg) gbMsg.addEventListener('input', updateCharCount);

// Enter to submit name
const gbName = document.getElementById('gbName');
if (gbName) gbName.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('gbMsg')?.focus(); });
if (gbMsg)  gbMsg.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.ctrlKey) submitMessage(); });

// ---- INIT ----
loadKomentarFirebase();

// Auto-refresh messages every 10s (simulates multi-user)
setInterval(() => {
  loadKomentarFirebase();
  const visEl = document.getElementById('visitorCount');
  if (visEl) visEl.textContent = parseInt(localStorage.getItem('elaina_visitors')||'0').toLocaleString();
}, 10000);

// Scroll reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.style.animationPlayState = 'running';
  });
}, { threshold: 0.1 });

document.querySelectorAll('.love-card, .msg-card, .fact-item, .contact-card').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// Tambahkan di akhir file app.js kamu
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDt8fxm0xyJlGlgPaKfSst5gkoQxaJ3oeg",
    authDomain: "trikelabu.firebaseapp.com",
    projectId: "trikelabu",
    storageBucket: "trikelabu.firebasestorage.app",
    messagingSenderId: "211864611486",
    appId: "1:211864611486:web:cd8a9e31d7fd836912a98f",
    measurementId: "G-95WNVNBSJE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function loadKomentarFirebase() {
    const grid = document.getElementById('messagesGrid');
    if (!grid) return;

    const querySnapshot = await getDocs(collection(db, "komentar"));

    let html = '';

    querySnapshot.forEach((doc) => {
        const data = doc.data();

        html += `
        <div class="msg-card">
            <div class="msg-header">
                <div class="msg-avatar">✨</div>
                <div>
                    <div class="msg-name">${data.nama || 'Tanpa Nama'}</div>
                </div>
            </div>
            <div class="msg-text">${data.isi || ''}</div>
        </div>
        `;
    });

    grid.innerHTML = html;
}

// Fungsi Kirim Pesan (Buku Tamu)
// Pastikan di index.html kamu ada: <button id="btnKirim">
const btnKirim = document.getElementById('btnKirim');
if(btnKirim) {
    btnKirim.addEventListener('click', async () => {
        const nama = document.getElementById('inputNama').value;
        const pesan = document.getElementById('inputPesan').value;

        try {
            await addDoc(collection(db, "komentar"), {
                nama: nama,
                isi: pesan,
                waktu: serverTimestamp()
            });
            loadKomentarFirebase();
          alert("Pesan berhasil dikirim! ✨");
        } catch (e) {
            console.error("Error: ", e);
            alert("Gagal kirim pesan.");
        }
    });
}