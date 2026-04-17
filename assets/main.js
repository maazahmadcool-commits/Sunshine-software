// Storage helpers are provided by backend/localStorageBackend.js

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const text = toast.querySelector('#toastText, #toastTxt, #toastMsg');
  if (text) text.textContent = message;
  if (toast.classList.contains('hidden')) toast.classList.remove('hidden');
  toast.classList.add('show');
  toast.style.backgroundColor = type === 'success' ? '#16a34a' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#16a34a';
  setTimeout(() => {
    toast.classList.remove('show');
    if (!toast.classList.contains('hidden')) toast.classList.add('hidden');
  }, 3500);
}

/* Index page helpers */
function showLoginModal() { const modal = document.getElementById('loginModal'); if (modal) modal.classList.remove('hidden'); }
function hideLoginModal() { const modal = document.getElementById('loginModal'); if (modal) modal.classList.add('hidden'); }
function showRegisterModal() { const modal = document.getElementById('registerModal'); if (modal) modal.classList.remove('hidden'); }
function hideRegisterModal() { const modal = document.getElementById('registerModal'); if (modal) modal.classList.add('hidden'); }

function handleRegister() {
  const name = document.getElementById('regName')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const pass = document.getElementById('regPass')?.value.trim();
  if (!name || !email || !pass) { showToast('Please fill all fields!', 'error'); return; }
  let users = getStorage('users', {});
  if (users[email]) { showToast('Email already registered!', 'error'); return; }
  users[email] = { name, email, password: pass };
  setStorage('users', users);
  showToast('Registration successful! Please login now.');
  hideRegisterModal();
  showLoginModal();
}

function handleLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPass')?.value.trim();
  const users = getStorage('users', {});
  const user = users[email];
  if (!user || user.password !== pass) { showToast('Invalid email or password!', 'error'); return; }
  setStorage('currentUser', { name: user.name, email });
  showToast('Login successful!');
  hideLoginModal();
  checkLoggedIn();
}

function autoFillBookingForm() {
  const currentUser = getStorage('currentUser', null);
  if (!currentUser) return;
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  const phoneField = document.getElementById('phone');
  if (nameField) nameField.value = currentUser.name || '';
  if (emailField) emailField.value = currentUser.email || '';
  const savedPhone = currentUser.phone || '';
  if (phoneField && savedPhone) phoneField.value = savedPhone;
}

function handleBooking(e) {
  if (e) e.preventDefault();
  const currentUser = getStorage('currentUser', null);
  if (!currentUser) { showToast('Please login first!', 'error'); showLoginModal(); return; }
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  const phoneField = document.getElementById('phone');
  const serviceField = document.getElementById('service');
  const batchDateField = document.getElementById('batchDate');
  const name = nameField?.value.trim() || currentUser.name;
  const email = emailField?.value.trim() || currentUser.email;
  const phone = phoneField?.value.trim();
  const selected = serviceField?.value;
  const batchDate = batchDateField?.value;
  if (!selected) { showToast('Please select a course!', 'error'); return; }
  if (!batchDate) { showToast('Please select a batch date!', 'error'); return; }
  const [service, amountStr] = selected.split('|');
  const amount = Number(amountStr);
  const bookings = getBookings();
  bookings.push({ name, email, phone: phone || '-', service, price: amount, date: batchDate, status: 'Pending' });
  saveBookings(bookings);
  currentUser.phone = phone;
  setStorage('currentUser', currentUser);
  document.getElementById('bookingFormContainer')?.classList.add('hidden');
  document.getElementById('successMessage')?.classList.remove('hidden');
  showToast('Booking Successful!', 'success');
}

function quickBook(service, price) {
  if (!getStorage('currentUser', null)) { showToast('Please login first!', 'error'); showLoginModal(); return; }
  const serviceField = document.getElementById('service');
  if (serviceField) serviceField.value = service + '|' + price;
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
}

function checkLoggedInBeforeBook() {
  if (!getStorage('currentUser', null)) { showToast('Please login or register first!', 'error'); showLoginModal(); }
  else { document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }); }
}

function checkLoggedIn() {
  const user = getStorage('currentUser', null);
  const authButtons = document.getElementById('authButtons');
  if (!authButtons) return;
  if (user) {
    authButtons.innerHTML = `<span class="text-sm font-medium text-white">Hi, ${user.name}</span><button onclick="logout()" class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm transition">Logout</button>`;
  } else {
    authButtons.innerHTML = `<button onclick="showLoginModal()" class="px-5 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition text-sm">Login</button><button onclick="showRegisterModal()" class="bg-[#c9a84c] text-black px-5 py-2 rounded-lg font-semibold hover:bg-[#e8c97a] transition text-sm">Register</button>`;
  }
  autoFillBookingForm();
}

function logout() {
  removeStorageItem('currentUser');
  checkLoggedIn();
  showToast('Logged out successfully!', 'success');
}

function initIndexPage() {
  if (!document.getElementById('authButtons')) return;
  checkLoggedIn();
  setTimeout(autoFillBookingForm, 500);
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) bookingForm.addEventListener('submit', handleBooking);
  const selected = getStorage('selectedService', null);
  if (selected) {
    const serviceField = document.getElementById('service');
    if (serviceField) serviceField.value = selected.service + '|' + selected.price;
    removeStorageItem('selectedService');
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
  }
}

/* Contact page helpers */
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const cu = getStorage('currentUser', null);
  if (cu) {
    document.getElementById('cName').value = cu.name || '';
    document.getElementById('cEmail').value = cu.email || '';
    const authNav = document.getElementById('authNav');
    if (authNav) {
      authNav.innerHTML = `
        <a href="client-dashboard.html" class="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-full">Dashboard</a>`;
    }
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('cName')?.value.trim();
    const email = document.getElementById('cEmail')?.value.trim();
    const phone = document.getElementById('cPhone')?.value.trim();
    const msg = document.getElementById('cMsg')?.value.trim();
    const inquiry = document.getElementById('inquiryType')?.value;
    if (!name || !email || !msg) { showToast('Saari required fields bharo!', 'error'); return; }
    const bookings = getBookings();
    bookings.push({ type: 'Contact', service: 'Contact / Enquiry', name, email, phone: phone || '—', description: `[${inquiry}] ${msg}`, date: new Date().toLocaleDateString('en-IN'), price: 0, status: 'pending', createdAt: new Date().toISOString() });
    saveBookings(bookings);
    showToast(`Thank you, ${name}! Message mil gaya. Jaldi contact karenge. ✅`, 'success');
    form.reset();
    const btn = document.getElementById('submitBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sent ✅';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send Message';
      }, 3000);
    }
  });
}

/* Services page helpers */
function checkAuth() {
  const authSection = document.getElementById('authSection');
  if (!authSection) return;
  const user = getStorage('currentUser', null);
  if (user) {
    authSection.innerHTML = `
      <span class="text-sm font-medium text-gray-700">Hi, ${user.name}</span>
      <button onclick="logout()" class="px-5 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 text-sm transition">Logout</button>`;
  } else {
    authSection.innerHTML = `
      <button onclick="window.location.href='index.html'" class="px-5 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 text-sm transition">Login</button>
      <button onclick="window.location.href='index.html'" class="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm shadow transition">Register</button>`;
  }
}

function openBookingModal(serviceName, price) {
  const user = getStorage('currentUser', null);
  if (!user) {
    showToast('Please login first!', 'error');
    showLoginModal();
    return;
  }
  setStorage('selectedService', { service: serviceName, price });
  window.location.href = 'index.html#book';
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

function filterCards() {
  const q = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('#cardsGrid > div[data-category]');
  let visible = 0;
  cards.forEach(card => {
    const title = card.getAttribute('data-title') || '';
    const match = title.includes(q) || q === '';
    card.style.display = match ? '' : 'none';
    if (match) visible += 1;
  });
  document.getElementById('noResults')?.classList.toggle('hidden', visible > 0);
}

function filterByCategory(cat) {
  const cards = document.querySelectorAll('#cardsGrid > div[data-category]');
  cards.forEach(card => {
    const isActive = cat === 'all' || card.getAttribute('data-category') === cat;
    card.style.display = isActive ? '' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white');
    btn.classList.add('bg-gray-100', 'text-gray-600');
  });
  const active = document.getElementById('tab-' + cat);
  if (active) {
    active.classList.add('bg-blue-600', 'text-white');
    active.classList.remove('bg-gray-100', 'text-gray-600');
  }
  const visible = [...cards].filter(c => c.style.display !== 'none').length;
  document.getElementById('noResults')?.classList.toggle('hidden', visible > 0);
}

function initServicesPage() {
  if (!document.getElementById('authSection')) return;
  checkAuth();
}

/* Course page helpers */
let _cName = '';
let _cPrice = 0;

function openCourseModal(name, price) {
  const cu = getStorage('currentUser', null);
  if (!cu) { alert('Pehle login karo!'); window.location.href = 'index.html'; return; }
  _cName = name;
  _cPrice = price;
  const modal = document.getElementById('courseModal');
  if (!modal) return;
  document.getElementById('modalCourseName').textContent = name;
  document.getElementById('modalCoursePrice').textContent = 'Fee: ₹' + price.toLocaleString('en-IN');
  document.getElementById('cName').value = cu.name || '';
  document.getElementById('cEmail').value = cu.email || '';
  modal.classList.add('show');
}

function closeCourseModal() { document.getElementById('courseModal')?.classList.remove('show'); }

function submitCourseEnrollment() {
  const name = document.getElementById('cName')?.value.trim();
  const email = document.getElementById('cEmail')?.value.trim();
  const phone = document.getElementById('cPhone')?.value.trim();
  const msg = document.getElementById('cMsg')?.value.trim();
  const date = document.getElementById('cDate')?.value;
  if (!name || !email || !phone) { alert('Name, Email aur Phone zaroori hai!'); return; }
  const bookings = getBookings();
  bookings.push({ type: 'Course', service: _cName, name, email, phone, description: msg, date: date ? new Date(date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), price: _cPrice, status: 'pending', createdAt: new Date().toISOString() });
  saveBookings(bookings);
  closeCourseModal();
  const toast = document.getElementById('toast');
  if (toast) {
    document.getElementById('toastTxt')?.textContent = 'Enrollment submitted! Redirecting to dashboard...';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
  setTimeout(() => { window.location.href = 'client-dashboard.html'; }, 1500);
}

function initCoursePage() {
  const modal = document.getElementById('courseModal');
  if (!modal) return;
  const cu = getStorage('currentUser', null);
  if (cu) {
    document.getElementById('cName').value = cu.name || '';
    document.getElementById('cEmail').value = cu.email || '';
  }
  modal.addEventListener('click', function (e) { if (e.target === modal) closeCourseModal(); });
}

/* Dashboard page helpers */
let bFilter = 'all';

function getUser() { return getStorage('currentUser', null); }
function getProfile() { return getStorage('userProfile', null); }
function getMyBookings() {
  const cu = getUser();
  const all = getBookings();
  if (!cu) return all;
  return all.filter(b => !b.email || b.email.toLowerCase().trim() === (cu.email || '').toLowerCase().trim());
}

function userName() { const p = getProfile(); const u = getUser(); return (p && p.name) || (u && u.name) || 'Student'; }
function getInitials(name) { return (name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

function loadTopbar() {
  const n = userName();
  document.getElementById('topAvatar').textContent = getInitials(n);
  document.getElementById('topName').textContent = n.split(' ')[0];
  document.getElementById('welcomeName').textContent = 'Hello, ' + n.split(' ')[0] + '!';
}

function loadStats() {
  const bks = getMyBookings();
  const conf = bks.filter(b => (b.status || '').toLowerCase() === 'confirmed').length;
  const pend = bks.filter(b => (b.status || 'pending').toLowerCase() === 'pending').length;
  const tot = bks.reduce((s, b) => s + (Number(b.price) || 0), 0);
  const crs = bks.filter(b => (b.type || 'Course') === 'Course').length;
  document.getElementById('st0').textContent = bks.length;
  document.getElementById('st1').textContent = conf;
  document.getElementById('st2').textContent = pend;
  document.getElementById('st3').textContent = '₹' + tot.toLocaleString('en-IN');
  document.getElementById('st4').textContent = crs;
  document.getElementById('profCount').textContent = bks.length;
}

function makeBookingCard(b, globalIdx, showActions) {
  const st = (b.status || 'pending').toLowerCase();
  const stClass = st === 'confirmed' ? 'bc' : st === 'cancelled' ? 'bx' : 'bp';
  const stDot = st === 'confirmed' ? '🟢' : st === 'cancelled' ? '🔴' : '🟡';
  const typeKey = (b.type || 'Course').toLowerCase();
  const typeClass = typeKey === 'service' ? 'bt-service' : typeKey === 'contact' ? 'bt-contact' : 'bt-course';
  const price = Number(b.price) || 0;
  const paidPct = st === 'confirmed' ? 100 : st === 'cancelled' ? 0 : 0;
  const barColor = paidPct === 100 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#c9a84c,#e8c97a)';
  const payLabel = paidPct === 100 ? '<span style="color:#22c55e;">✅ Confirmed / Paid</span>' : st === 'cancelled' ? '<span style="color:#ef4444;">❌ Cancelled</span>' : '<span style="color:#fbbf24;">⏳ Payment Pending — Admin confirm karega</span>';
  const emojiMap = { 'website development': '💻', 'mobile app development': '📱', 'digital marketing': '📊', 'software training': '🧠', 'custom software': '🔧', 'python programming': '🐍', 'java programming': '☕', 'full stack web development': '🌐', 'ui/ux design with figma': '🎨', 'aws cloud computing': '☁️', 'cyber security fundamentals': '🔒', 'data analytics with power bi': '📈', 'contact': '📩', 'default': '📚' };
  const serviceKey = (b.service || b.type || 'default').toLowerCase();
  const emoji = emojiMap[serviceKey] || emojiMap['default'];
  const whatsappMsg = encodeURIComponent(`Hello! Mera booking #${String(globalIdx + 1).padStart(3, '0')} hai - ${b.service || b.type}. Enquiry karna tha.`);
  return `
  <div class="bcard">
    <div class="bcard-head">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:44px;height:44px;background:rgba(201,168,76,.1);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">${emoji}</div>
        <div>
          <div style="font-weight:700;font-size:14.5px;">${b.service || (b.description ? b.description.slice(0, 45) + '...' : 'Enquiry')}</div>
          <div style="font-size:11px;color:#555577;margin-top:2px;">Booking ID: #${String(globalIdx + 1).padStart(4, '0')}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <span class="badge ${typeClass}">${b.type || 'Course'}</span>
        <span class="badge ${stClass}">${stDot} ${b.status || 'Pending'}</span>
      </div>
    </div>
    <div class="bcard-body">
      <div class="dg">
        <div class="di"><label><i class="fas fa-user" style="margin-right:4px;color:#c9a84c;"></i>Student Name</label><span>${b.name || '–'}</span></div>
        <div class="di"><label><i class="fas fa-envelope" style="margin-right:4px;color:#c9a84c;"></i>Email Address</label><span style="font-size:13px;">${b.email || '–'}</span></div>
        <div class="di"><label><i class="fas fa-phone" style="margin-right:4px;color:#c9a84c;"></i>Phone Number</label><span>${b.phone || '–'}</span></div>
        <div class="di"><label><i class="fas fa-calendar-alt" style="margin-right:4px;color:#c9a84c;"></i>Batch / Date</label><span>${b.date || '–'}</span></div>
        <div class="di"><label><i class="fas fa-rupee-sign" style="margin-right:4px;color:#c9a84c;"></i>Course Fee</label><span style="color:#c9a84c;font-weight:700;font-size:15px;">${price ? '₹' + price.toLocaleString('en-IN') : '–'}</span></div>
        <div class="di"><label><i class="fas fa-tag" style="margin-right:4px;color:#c9a84c;"></i>Service Type</label><span>${b.type || 'Course'}</span></div>
        ${b.description ? `<div class="di" style="grid-column:1/-1;"><label><i class="fas fa-comment-alt" style="margin-right:4px;color:#c9a84c;"></i>Your Message / Requirement</label><span style="color:#aaa;font-size:13px;">${b.description}</span></div>` : ''}
      </div>
      <div style="margin-top:18px;padding:16px;background:rgba(255,255,255,.03);border-radius:14px;border:1px solid rgba(255,255,255,.05);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:12px;color:#8888aa;font-weight:600;"><i class="fas fa-wallet" style="margin-right:5px;color:#c9a84c;"></i>PAYMENT STATUS</span>${payLabel}</div>
        <div class="pbar-bg"><div class="pbar-fill" style="width:${paidPct}%;background:${barColor};"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:11px;color:#444466;"><span>Booked</span><span style="font-weight:600;">${paidPct}% complete</span><span>Confirmed</span></div>
      </div>
      ${showActions && st !== 'cancelled' ? `
      <div style="margin-top:14px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
        <a href="https://wa.me/919928016573?text=${whatsappMsg}" target="_blank" style="font-size:12px;background:rgba(37,211,102,.1);color:#25D366;border:1px solid rgba(37,211,102,.2);padding:7px 15px;border-radius:9px;font-weight:600;text-decoration:none;"><i class="fab fa-whatsapp" style="margin-right:4px;"></i>WhatsApp</a>
        <button onclick="cancelBooking(${globalIdx})" style="font-size:12px;background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2);padding:7px 15px;border-radius:9px;border:none;cursor:pointer;font-weight:600;"><i class="fas fa-times" style="margin-right:4px;"></i>Cancel Booking</button>
      </div>` : ''}
    </div>
  </div>`;
}

function renderRecent() {
  const bks = getMyBookings();
  const el = document.getElementById('recentList');
  if (!el) return;
  if (!bks.length) {
    el.innerHTML = `<div class="empty-box"><div class="ei">📭</div><p>Abhi koi booking nahi hai.<br><a href="services.html">Courses dekho →</a></p></div>`;
    return;
  }
  const allBks = getBookings();
  const recent = bks.slice().reverse().slice(0, 3);
  el.innerHTML = recent.map(b => {
    const gIdx = allBks.indexOf(b);
    return makeBookingCard(b, gIdx, false);
  }).join('');
}

function renderBookings() {
  let bks = getMyBookings();
  const allBks = getBookings();
  const q = (document.getElementById('searchInp')?.value || '').toLowerCase();
  if (bFilter !== 'all') bks = bks.filter(b => (b.type || 'Course') === bFilter);
  if (q) bks = bks.filter(b => (b.service || '').toLowerCase().includes(q) || (b.name || '').toLowerCase().includes(q) || (b.email || '').toLowerCase().includes(q) || (b.status || '').toLowerCase().includes(q) || (b.date || '').toLowerCase().includes(q) || (b.phone || '').toLowerCase().includes(q));
  bks = bks.slice().reverse();
  const el = document.getElementById('allBookingsList');
  if (!el) return;
  if (!bks.length) {
    el.innerHTML = `<div class="empty-box"><div class="ei">🔍</div><p>Koi booking nahi mili.</p></div>`;
    return;
  }
  el.innerHTML = bks.map(b => {
    const gIdx = allBks.indexOf(b);
    return makeBookingCard(b, gIdx, true);
  }).join('');
}

function setFilter(f, btn) {
  bFilter = f;
  document.querySelectorAll('.tbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBookings();
}

function cancelBooking(globalIdx) {
  if (!confirm('Is booking ko cancel karna chahte ho?')) return;
  const all = getBookings();
  if (all[globalIdx]) {
    all[globalIdx].status = 'Cancelled';
    saveBookings(all);
    loadStats();
    renderRecent();
    renderBookings();
    renderCourses();
    showToast('Booking cancel ho gayi.', 'success');
  }
}

function renderCourses() {
  const bks = getMyBookings().filter(b => (b.type || 'Course') === 'Course');
  const allBks = getBookings();
  const el = document.getElementById('coursesGrid');
  if (!el) return;
  if (!bks.length) {
    el.innerHTML = `<div class="empty-box" style="grid-column:1/-1;"><div class="ei">🎓</div><p>Koi course enrolled nahi hai abhi.<br><a href="services.html">Courses Browse Karo →</a></p></div>`;
    return;
  }
  const gradients = ['linear-gradient(135deg,#1d4ed8,#6366f1)', 'linear-gradient(135deg,#16a34a,#059669)', 'linear-gradient(135deg,#d97706,#ea580c)', 'linear-gradient(135deg,#7c3aed,#9333ea)', 'linear-gradient(135deg,#db2777,#e11d48)', 'linear-gradient(135deg,#0891b2,#0e7490)'];
  const emojis = { 'website development': '💻', 'mobile app development': '📱', 'digital marketing': '📊', 'software training': '🧠', 'custom software': '🔧', 'python programming': '🐍', 'java programming': '☕', 'full stack web development': '🌐' };
  el.innerHTML = bks.slice().reverse().map((b, i) => {
    const gIdx = allBks.indexOf(b);
    const gr = gradients[i % gradients.length];
    const em = emojis[(b.service || '').toLowerCase()] || '📚';
    const st = (b.status || 'pending').toLowerCase();
    const sc = st === 'confirmed' ? 'bc' : st === 'cancelled' ? 'bx' : 'bp';
    return `
      <div style="background:#13131f;border:1px solid rgba(255,255,255,.07);border-radius:18px;overflow:hidden;transition:all .25s;cursor:default;" onmouseover="this.style.borderColor='rgba(201,168,76,.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,.07)';">
        <div style="height:88px;background:${gr};display:flex;align-items:center;justify-content:center;font-size:2.8rem;">${em}</div>
        <div style="padding:16px 18px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:8px;line-height:1.3;">${b.service || 'Course'}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><span style="font-size:11.5px;color:#8888aa;">📅 ${b.date || '–'}</span><span class="badge ${sc}" style="font-size:10.5px;">${b.status || 'Pending'}</span></div>
          <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px 12px;margin-bottom:10px;"><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11.5px;color:#8888aa;">Course Fee</span><span style="font-size:15px;font-weight:700;color:#c9a84c;">${b.price ? '₹' + Number(b.price).toLocaleString('en-IN') : '–'}</span></div></div>
          <div style="font-size:11.5px;color:#8888aa;margin-bottom:3px;"><i class="fas fa-envelope" style="margin-right:5px;width:12px;"></i>${b.email || '–'}</div>
          <div style="font-size:11.5px;color:#8888aa;"><i class="fas fa-phone" style="margin-right:5px;width:12px;"></i>${b.phone || '–'}</div>
        </div>
      </div>`;
  }).join('');
}

function loadProfileForm() {
  const cu = getUser();
  const p = getProfile();
  const name = (p && p.name) || (cu && cu.name) || '';
  const email = (p && p.email) || (cu && cu.email) || '';
  const phone = (p && p.phone) || '';
  const city = (p && p.city) || '';
  const pName = document.getElementById('pName');
  const pEmail = document.getElementById('pEmail');
  const pPhone = document.getElementById('pPhone');
  const pCity = document.getElementById('pCity');
  if (pName) pName.value = name;
  if (pEmail) pEmail.value = email;
  if (pPhone) pPhone.value = phone;
  if (pCity) pCity.value = city;
  document.getElementById('bigAvatar')?.textContent = getInitials(name);
  document.getElementById('profName')?.textContent = name || '–';
  document.getElementById('profEmail')?.textContent = email || '–';
}

function saveProfile() {
  const name = document.getElementById('pName')?.value.trim();
  const email = document.getElementById('pEmail')?.value.trim();
  const phone = document.getElementById('pPhone')?.value.trim();
  const city = document.getElementById('pCity')?.value.trim();
  if (!name || !email) { showToast('Name aur email required hai!', 'error'); return; }
  setStorage('userProfile', { name, email, phone, city });
  const cu = getUser();
  if (cu) { cu.name = name; cu.email = email; setStorage('currentUser', cu); }
  loadTopbar();
  loadProfileForm();
  loadStats();
  showToast('Profile save ho gayi! ✅', 'success');
}

function showSec(key, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + key)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  const titles = { overview: 'Overview', bookings: 'My Bookings', courses: 'My Courses', profile: 'My Profile' };
  document.getElementById('pageTitle').textContent = titles[key] || key;
  closeSidebar();
  if (key === 'bookings') renderBookings();
  if (key === 'courses') renderCourses();
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebarOverlay')?.classList.toggle('show');
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('show');
}

function doLogout() {
  removeStorageItem('currentUser');
  window.location.href = 'index.html';
}

function initDashboardPage() {
  if (!document.getElementById('sec-overview')) return;
  const cu = getUser();
  if (!cu) {
    window.location.href = 'index.html';
    return;
  }
  loadTopbar();
  loadStats();
  renderRecent();
  renderBookings();
  renderCourses();
  loadProfileForm();
  if (window.innerWidth <= 768) document.getElementById('menuBtn')?.style.display = 'block';
}

/* Admin page helpers */
let adminLoggedIn = false;
let aFilter = 'all';

function updateStatus(idx, status) {
  const bookings = getBookings();
  if (bookings[idx]) {
    bookings[idx].status = status;
    saveBookings(bookings);
    refreshDashboard();
    renderAdminBookings();
    renderClients();
    showToast('Status updated to ' + status, 'success');
  }
}

function deleteBooking(idx) {
  if (!confirm('Delete this booking permanently?')) return;
  const bookings = getBookings();
  bookings.splice(idx, 1);
  saveBookings(bookings);
  refreshDashboard();
  renderAdminBookings();
  renderClients();
  renderRevenue();
  showToast('Booking deleted.', 'success');
}

function detailRow(label, val) {
  return `<div style="display:flex;gap:12px;"><span style="color:#555577;min-width:120px;">${label}</span><span style="color:#e8e8f0;font-weight:500;">${val}</span></div>`;
}

function viewDetail(idx) {
  const b = getBookings()[idx];
  if (!b) return;
  document.getElementById('modalContent').innerHTML = `
      <div style="display:grid;gap:12px;font-size:13px;">
        ${detailRow('Name', b.name)}
        ${detailRow('Email', b.email)}
        ${detailRow('Phone', b.phone || '–')}
        ${detailRow('Course/Service', b.service || b.message || '–')}
        ${detailRow('Type', b.type || 'Course')}
        ${detailRow('Batch / Date', b.date || '–')}
        ${detailRow('Price', b.price ? '₹' + Number(b.price).toLocaleString('en-IN') : '–')}
        ${detailRow('Status', b.status || 'Pending')}
        ${b.description ? detailRow('Message', b.description) : ''}
      </div>`;
  document.getElementById('detailModal')?.classList.add('show');
}

function closeAdminModal() {
  document.getElementById('detailModal')?.classList.remove('show');
}

function getStatusClass(status) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'confirmed') return 'confirmed';
  if (s === 'cancelled') return 'cancelled';
  return 'pending';
}

function buildRow(b, realIdx, dispIdx) {
  return `
      <tr>
        <td style="color:#444466;font-size:12px;">${dispIdx + 1}</td>
        <td style="font-weight:500;">${b.name || '–'}</td>
        <td style="color:#8888aa;font-size:12px;">${b.email || '–'}</td>
        <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.service || b.message?.slice(0,30) || '–'}</td>
        <td><span class="badge badge-${(b.type || 'course').toLowerCase()}">${b.type || 'Course'}</span></td>
        <td style="color:#8888aa;font-size:12px;">${b.date || '–'}</td>
        <td style="color:#c9a84c;font-weight:600;">${b.price ? '₹' + Number(b.price).toLocaleString('en-IN') : '–'}</td>
        <td><span class="badge badge-${getStatusClass(b.status)}">${b.status || 'Pending'}</span></td>
        <td><select class="status-sel" onchange="updateStatus(${realIdx}, this.value)"><option ${(b.status || 'Pending') === 'Pending' ? 'selected' : ''}>Pending</option><option ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option><option ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option></select></td>
      </tr>`;
}

function buildAdminRow(b, realIdx, dispIdx) {
  return `
      <tr>
        <td style="color:#444466;font-size:12px;">${dispIdx + 1}</td>
        <td style="font-weight:500;">${b.name || '–'}</td>
        <td style="color:#8888aa;font-size:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.email || '–'}</td>
        <td style="color:#8888aa;font-size:12px;">${b.phone || '–'}</td>
        <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.service || b.message?.slice(0,30) || '–'}</td>
        <td><span class="badge badge-${(b.type || 'course').toLowerCase()}">${b.type || 'Course'}</span></td>
        <td style="color:#8888aa;font-size:12px;">${b.date || '–'}</td>
        <td style="color:#c9a84c;font-weight:600;">${b.price ? '₹' + Number(b.price).toLocaleString('en-IN') : '–'}</td>
        <td><select class="status-sel" onchange="updateStatus(${realIdx}, this.value)"><option ${(b.status || 'Pending') === 'Pending' ? 'selected' : ''}>Pending</option><option ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option><option ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option></select></td>
        <td><button onclick="deleteBooking(${realIdx})" style="background:rgba(239,68,68,0.1);color:#ef4444;border:none;padding:5px 10px;border-radius:8px;font-size:11px;cursor:pointer;"><i class="fas fa-trash"></i></button></td>
        <td><button onclick="viewDetail(${realIdx})" style="background:rgba(201,168,76,0.1);color:#c9a84c;border:none;padding:5px 10px;border-radius:8px;font-size:11px;cursor:pointer;"><i class="fas fa-eye"></i></button></td>
      </tr>`;
}

function refreshDashboard() {
  const bookings = getBookings();
  const revenue = bookings.reduce((s, b) => s + (Number(b.price) || 0), 0);
  const emails = [...new Set(bookings.map(b => b.email).filter(Boolean))];
  const pending = bookings.filter(b => (b.status || 'pending').toLowerCase() === 'pending').length;
  const confirmed = bookings.filter(b => (b.status || '').toLowerCase() === 'confirmed').length;
  document.getElementById('aStatTotal')?.textContent = bookings.length;
  document.getElementById('aStatRevenue')?.textContent = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('aStatClients')?.textContent = emails.length;
  document.getElementById('aStatPending')?.textContent = pending;
  document.getElementById('aStatConfirmed')?.textContent = confirmed;
  renderDashRecent();
}

function renderDashRecent() {
  const bookings = getBookings().slice().reverse().slice(0, 10);
  const tbody = document.getElementById('dashRecentBody');
  if (!tbody) return;
  if (!bookings.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="icon">📭</div><p>No bookings yet</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = bookings.map((b, i) => buildRow(b, getBookings().length - 1 - i, i)).join('');
}

function renderAdminBookings() {
  let bookings = getBookings().slice().reverse();
  const search = (document.getElementById('aSearchBox')?.value || '').toLowerCase();
  if (aFilter === 'pending') bookings = bookings.filter(b => (b.status || 'pending').toLowerCase() === 'pending');
  else if (aFilter === 'confirmed') bookings = bookings.filter(b => (b.status || '').toLowerCase() === 'confirmed');
  else if (aFilter !== 'all') bookings = bookings.filter(b => (b.type || 'Course') === aFilter);
  if (search) bookings = bookings.filter(b => (b.name || '').toLowerCase().includes(search) || (b.email || '').toLowerCase().includes(search) || (b.service || '').toLowerCase().includes(search) || (b.phone || '').toLowerCase().includes(search));
  const tbody = document.getElementById('adminBookingsBody');
  if (!tbody) return;
  if (!bookings.length) {
    tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><div class="icon">🔍</div><p>No bookings found</p></div></td></tr>`;
    return;
  }
  const all = getBookings();
  tbody.innerHTML = bookings.map((b, i) => {
    const realIdx = all.indexOf(b);
    return buildAdminRow(b, realIdx, i);
  }).join('');
}

function adminFilter(type, btn) {
  aFilter = type;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAdminBookings();
}

function renderClients() {
  const bookings = getBookings();
  const map = {};
  bookings.forEach(b => {
    const key = b.email || b.name || '(Unknown)';
    if (!map[key]) map[key] = { name: b.name || '–', email: b.email || '–', phone: b.phone || '–', count: 0, total: 0, last: '–' };
    map[key].count++;
    map[key].total += Number(b.price) || 0;
    map[key].last = b.date || map[key].last;
    if (b.phone) map[key].phone = b.phone;
  });
  const clients = Object.values(map);
  const tbody = document.getElementById('clientsBody');
  if (!tbody) return;
  if (!clients.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon">👥</div><p>No clients yet</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = clients.map((c, i) => `
      <tr>
        <td style="color:#444466;font-size:12px;">${i + 1}</td>
        <td style="font-weight:600;">${c.name}</td>
        <td style="color:#8888aa;font-size:12px;">${c.email}</td>
        <td style="color:#8888aa;font-size:12px;">${c.phone}</td>
        <td style="text-align:center;"><span style="background:rgba(59,130,246,0.12);color:#60a5fa;padding:3px 10px;border-radius:40px;font-size:12px;font-weight:600;">${c.count}</span></td>
        <td style="color:#22c55e;font-weight:600;">₹${c.total.toLocaleString('en-IN')}</td>
        <td style="color:#8888aa;font-size:12px;">${c.last}</td>
      </tr>`).join('');
}

function renderRevenue() {
  const bookings = getBookings();
  const total = bookings.reduce((s, b) => s + (Number(b.price) || 0), 0);
  const fromCourse = bookings.filter(b => b.type === 'Course').reduce((s, b) => s + (Number(b.price) || 0), 0);
  const fromService = bookings.filter(b => b.type === 'Service').reduce((s, b) => s + (Number(b.price) || 0), 0);
  const avg = bookings.length ? Math.round(total / bookings.length) : 0;
  document.getElementById('revTotal')?.textContent = '₹' + total.toLocaleString('en-IN');
  document.getElementById('revCourse')?.textContent = '₹' + fromCourse.toLocaleString('en-IN');
  document.getElementById('revService')?.textContent = '₹' + fromService.toLocaleString('en-IN');
  document.getElementById('revAvg')?.textContent = '₹' + avg.toLocaleString('en-IN');
  const breakdown = {};
  bookings.forEach(b => {
    const key = b.service || 'Other';
    if (!breakdown[key]) breakdown[key] = { count: 0, rev: 0 };
    breakdown[key].count++;
    breakdown[key].rev += Number(b.price) || 0;
  });
  const rows = Object.entries(breakdown).sort((a, b) => b[1].rev - a[1].rev);
  const tbody = document.getElementById('revenueBreakBody');
  if (!tbody) return;
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">📊</div><p>No data</p></div></td></tr>`; return; }
  tbody.innerHTML = rows.map(([name, d], i) => `
      <tr>
        <td style="color:#444466;font-size:12px;">${i + 1}</td>
        <td style="font-weight:600;">${name}</td>
        <td style="text-align:center;"><span style="background:rgba(59,130,246,0.1);color:#60a5fa;padding:3px 10px;border-radius:40px;font-size:12px;font-weight:600;">${d.count}</span></td>
        <td style="color:#22c55e;font-weight:700;">₹${d.rev.toLocaleString('en-IN')}</td>
        <td>
          <div style="background:rgba(255,255,255,0.05);border-radius:40px;height:8px;width:100%;overflow:hidden;">
            <div style="background:linear-gradient(90deg,#c9a84c,#e8c97a);height:100%;border-radius:40px;width:${total ? Math.round(d.rev / total * 100) : 0}%;"></div>
          </div>
          <span style="font-size:11px;color:#8888aa;">${total ? Math.round(d.rev / total * 100) : 0}%</span>
        </td>
      </tr>`).join('');
}

function exportCSV() {
  const bookings = getBookings();
  if (!bookings.length) { showToast('No data to export!', 'error'); return; }
  const headers = ['Name', 'Email', 'Phone', 'Course/Service', 'Type', 'Date', 'Price', 'Status'];
  const rows = bookings.map(b => [b.name || '', b.email || '', b.phone || '', b.service || b.message?.slice(0,40) || '', b.type || 'Course', b.date || '', b.price || '', b.status || 'Pending']);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'clientbook_bookings_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('CSV exported successfully!', 'success');
}

function clearAllData() {
  if (!confirm('⚠️ This will DELETE all booking data permanently. Are you sure?')) return;
  if (!confirm('Second confirm: Really delete everything?')) return;
  removeStorageItem('bookings');
  refreshDashboard();
  renderAdminBookings();
  renderClients();
  renderRevenue();
  showToast('All data cleared.', 'success');
}

function adminLogin() {
  const u = document.getElementById('adminUser')?.value.trim();
  const p = document.getElementById('adminPass')?.value.trim();
  if (u === 'admin' && p === 'admin123') {
    adminLoggedIn = true;
    document.getElementById('loginScreen')?.style.display = 'none';
    document.getElementById('adminPanel')?.style.display = 'block';
    initAdminPage();
  } else {
    showToast('Invalid credentials!', 'error');
  }
}

function initAdminPage() {
  const loginScreen = document.getElementById('loginScreen');
  if (!loginScreen) return;
  if (window.innerWidth <= 768) document.getElementById('menuBtn')?.style.display = 'block';
  refreshDashboard();
  renderAdminBookings();
  renderClients();
  renderRevenue();
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !adminLoggedIn) adminLogin();
  });
}

function initPageScripts() {
  checkLoggedIn();
  initIndexPage();
  initContactPage();
  initServicesPage();
  initCoursePage();
  initDashboardPage();
  initAdminPage();
}

document.addEventListener('DOMContentLoaded', initPageScripts);
