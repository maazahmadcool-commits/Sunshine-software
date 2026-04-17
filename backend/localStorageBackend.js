function getStorage(key, defaultValue = null) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : defaultValue;
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function appendStorageItem(key, item) {
  const list = getStorage(key, []);
  list.push(item);
  setStorage(key, list);
}

function removeStorageItem(key) {
  localStorage.removeItem(key);
}

function saveBookings(bookings) {
  setStorage('bookings', bookings);
}

function getBookings() {
  return getStorage('bookings', []);
}
