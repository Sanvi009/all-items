// Initialize Firebase (config is in firebase-config.js)
const db = firebase.database();
const itemsRef = db.ref('lost_and_found');

// DOM Elements
const itemsGrid = document.getElementById('itemsGrid');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');

// Listen for real-time updates
itemsRef.on('value', (snapshot) => {
  const items = snapshot.val();
  renderItems(items);
});

// Render items to the grid
function renderItems(items) {
  itemsGrid.innerHTML = ''; // Clear existing cards

  if (!items) {
    itemsGrid.innerHTML = '<p>No items found.</p>';
    return;
  }

  // Convert object to array and sort by timestamp (newest first)
  const itemsArray = Object.entries(items).map(([id, data]) => ({ id, ...data }));
  itemsArray.sort((a, b) => b.timestamp - a.timestamp);

  // Filter and search logic
  const searchTerm = searchInput.value.toLowerCase();
  const typeValue = typeFilter.value;
  const statusValue = statusFilter.value;

  itemsArray.forEach((item) => {
    // Apply filters
    if (typeValue !== 'all' && item.item_type !== typeValue) return;
    if (statusValue !== 'all' && item.status !== statusValue) return;
    if (searchTerm && !matchesSearch(item, searchTerm)) return;

    // Create card
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${item.image_url ? `<img src="${item.image_url}" alt="${item.item_name}" class="card-img">` : '<div class="card-img" style="background: #eee; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>'}
      <div class="card-content">
        <h3 class="item-name">${item.item_name}</h3>
        <p class="description">${item.description}</p>
        <p class="detail"><i>📍</i> ${item.location}</p>
        <div class="badges">
          <span class="badge ${item.item_type}">${item.item_type}</span>
          <span class="badge ${item.status}">${item.status}</span>
        </div>
        <div class="meta">
          <p class="detail"><i>🆔</i> ${item.id}</p>
          <p class="detail"><i>👤</i> ${item.telegram_user_id}</p>
          <p class="timestamp">${formatTime(item.timestamp)}</p>
        </div>
      </div>
    `;
    itemsGrid.appendChild(card);
  });
}

// Helper: Check if item matches search term
function matchesSearch(item, term) {
  return (
    item.item_name.toLowerCase().includes(term) ||
    item.location.toLowerCase().includes(term) ||
    item.description.toLowerCase().includes(term)
  );
}

// Helper: Format timestamp (e.g., "2 hours ago")
function formatTime(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// Event listeners for search/filters
searchInput.addEventListener('input', () => itemsRef.once('value', (snapshot) => renderItems(snapshot.val())));
typeFilter.addEventListener('change', () => itemsRef.once('value', (snapshot) => renderItems(snapshot.val())));
statusFilter.addEventListener('change', () => itemsRef.once('value', (snapshot) => renderItems(snapshot.val())));