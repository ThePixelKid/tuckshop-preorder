// Authentication Utilities

/**
 * Get current logged-in user info
 */
export function getCurrentUser() {
  const userId = sessionStorage.getItem('tuckshopUserId');
  const email = sessionStorage.getItem('tuckshopUserEmail');
  const name = sessionStorage.getItem('tuckshopUserName');
  const form = sessionStorage.getItem('tuckshopUserForm');

  if (!userId) return null;

  return { userId, email, name, form };
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return !!sessionStorage.getItem('tuckshopUserId');
}

/**
 * Logout user
 */
export function logout() {
  sessionStorage.removeItem('tuckshopUserId');
  sessionStorage.removeItem('tuckshopUserEmail');
  sessionStorage.removeItem('tuckshopUserName');
  sessionStorage.removeItem('tuckshopUserForm');
  window.location.href = 'account.html';
}

/**
 * Update user display in header
 */
export function updateUserDisplay() {
  const user = getCurrentUser();
  const userDisplay = document.getElementById('userDisplay');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginLink = document.getElementById('loginLink');

  if (user && userDisplay) {
    userDisplay.textContent = `${user.name} (${user.form})`;
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (loginLink) loginLink.style.display = 'none';
  } else {
    if (userDisplay) userDisplay.textContent = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (loginLink) loginLink.style.display = 'inline-block';
  }
}
