# Tuck Shop Preorder System

A modern web application for school tuck shop preordering with real-time synchronization and a responsive dark theme.

## Features

- **Student Ordering**: Easy-to-use interface with autocomplete name selection
- **Real-time Cart**: Add/remove items with live quantity updates
- **Admin Dashboard**: Password-protected order management with filtering
- **Cross-device Sync**: Orders synced in real-time via Firebase
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern dark UI with blue and green accents
- **LocalStorage**: Cart persists between sessions

## Setup for Firebase

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database (Start in Test mode for development)
4. Create two collections: `orders` and `menu`
5. Copy your Firebase config from Project Settings

### 2. Update Configuration

1. Open `js/firebase.js`
2. Replace the `firebaseConfig` object with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Admin Password

Update the hash in `js/config.js` if needed:

```javascript
export const ADMIN_PW_SALT = 'tuckshop_salt_v1';
export const ADMIN_PW_HASH = '2256c0e57453ea111041438ac71c8d13211aea4a762db7c1e9b4a4ba1209f0a5';
```

Default password: `EdgeAdmin`

### 4. Deploy to GitHub Pages

1. Push this code to a GitHub repository
2. Go to repository **Settings > Pages**
3. Set source to **Deploy from a branch**
4. Select **main** branch and **/(root)** folder
5. Click **Save**

Your site will be available at `https://yourusername.github.io/repository-name/`

## Usage

### For Students
- Go to [account.html](account.html) to **register** with your email, password, name, and form
- **Login** with your credentials
- Browse menu items and adjust quantities
- Submit your order (auto-filled with your name and form)
- Cart data saves locally; orders sync to Firebase in real-time
- **Logout** when done

### For Admins
- Visit [admin.html](admin.html)
- Enter password: `EdgeAdmin`
- View all orders in real-time
- Filter by form (All/AS/A2)
- See price summary per order
- Export/import orders as JSON
- See totals and per-student summaries

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+ modules)
- **Backend**: Firebase Firestore (realtime)
- **Storage**: Firestore (orders, menu) + LocalStorage (cart)
- **Styling**: Modern dark theme with responsive grid layout
- **Security**: Salted SHA-256 password hashing (frontend)
- **Fonts**: Inter + Roboto (Google Fonts)

## File Structure

```
├── index.html              # Student ordering page (requires login)
├── account.html            # Account registration/login page
├── admin.html              # Admin dashboard (password protected)
├── confirm.html            # Order confirmation page
├── orders.json             # Sample order data
├── css/
│   ├── styles.css          # Main stylesheet
│   └── styles.theme.css    # Backup theme file
├── js/
│   ├── config.js           # Configuration & constants
│   ├── firebase.js         # Firebase setup & Firestore helpers
│   ├── menu.js             # Menu rendering & cart logic
│   ├── order.js            # Order submission (requires login)
│   ├── account.js          # User registration & login
│   ├── auth-utils.js       # Authentication utilities
│   ├── admin.js            # Admin authentication & dashboard
│   └── cart-drawer.js      # Cart drawer UI interactions
├── google-apps-script.js   # Legacy Apps Script (optional)
├── server.js               # Local Node server (optional)
├── serve.py                # Local Python server (optional)
└── README.md               # This file
```

## Customization

- **Menu Items**: Edit hardcoded menu array in `js/menu.js` (lines 19-50)
- **Student Names**: Update datalist in `index.html` (lines 35-95)
- **Admin Password**: Change in `js/config.js` and regenerate hash
- **Colors**: Update CSS variables in `css/styles.css` (`:root` block)
  - `--accent-1`: Primary blue (#0693e3)
  - `--accent-2`: Accent green (#48f0b7)
  - `--bg`: Background (#000000)
  - `--card`: Card background (#071628)

## Local Development

### Using Node.js
```bash
npm install
npm start
# Open http://localhost:8000
```

### Using Python
```bash
python serve.py
# Open http://localhost:8000
```

## Troubleshooting

- **Orders not syncing**: Check Firebase Firestore rules allow read/write
- **Admin login fails**: Verify password hash matches in `js/config.js`
- **CORS errors**: Firebase should handle this automatically
- **Cart not persisting**: Check browser allows localStorage
- **Menu not loading**: Verify Firebase config is correct and Firestore has `menu` collection

## Security Notes

- ⚠️ **Frontend password hashing** is not production-secure. For production, implement backend authentication.
- Firestore rules should be properly configured to prevent unauthorized access.
- Do not expose sensitive config in client-side code (use Firebase security rules instead).

## Account System Details

### User Data Structure (Firestore)
```javascript
{
  email: "student@school.com",
  passwordHash: "SHA256(email + password)",
  name: "Student Name",
  form: "AS",
  createdAt: Timestamp,
  accountBalance: 0,
  isActive: true
}
```

### Order Data Structure (Firestore)
```javascript
{
  userId: "user_id_ref",
  studentName: "Student Name",
  email: "student@school.com",
  form: "AS",
  itemsText: "Item1 ×2; Item2 ×1",
  status: "Pending",
  createdAt: Timestamp
}
```

### Session Storage
- `tuckshopUserId`: Unique user ID from Firestore
- `tuckshopUserEmail`: User's email address
- `tuckshopUserName`: User's full name
- `tuckshopUserForm`: User's form (AS/A2)

## License

This project is open source and available under the MIT License.