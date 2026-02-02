# Tuck Shop Preorder System

A seamless cross-device preorder system for tuck shops with real-time synchronization.

## Features

- **Real-time Sync**: Orders sync automatically across all computers
- **Offline Support**: Students can place orders even without internet
- **Admin Dashboard**: Secure admin access with real-time order monitoring
- **Cross-Device Access**: Admin can view all orders from any computer
- **Automatic Backup**: Local storage ensures orders are never lost
- **Student Preordering**: Students can select items from a menu and place orders
- **Order Validation**: Prevents duplicate orders per day per student
- **Responsive Design**: Modern Apple-inspired UI that works on all devices

## Storage Options

This system supports multiple storage backends with automatic fallback:

### 1. Firebase Firestore (Primary)
- **Pros**: Real-time sync, cross-device access, cloud backup, authentication
- **Cons**: Requires internet connection for sync, Firebase account needed
- **Browser Support**: All modern browsers with JavaScript enabled

### 2. IndexedDB (Offline Fallback)
- **Pros**: Large storage capacity, structured data, fast queries, transactional
- **Cons**: Asynchronous API, more complex implementation
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

### 3. localStorage (Offline Fallback)
- **Pros**: Simple synchronous API, wide browser support
- **Cons**: Limited storage (5-10MB), string-only data, no indexing
- **Browser Support**: All modern browsers

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database:
   - Go to "Firestore Database" in the left menu
   - Click "Create database"
   - Choose "Start in test mode" for development
4. Enable Authentication:
   - Go to "Authentication" in the left menu
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider
5. Get your Firebase config:
   - Click the gear icon → "Project settings"
   - Scroll down to "Your apps" section
   - Click "Add app" → Web app (</>)
   - Copy the config object

### 2. Update Configuration

Replace the placeholder Firebase config in these files with your actual config:

**Files to update:**
- `index.html` (lines ~115-125)
- `admin.html` (lines ~60-70)
- `js/firebase.js` (lines ~13-21)

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 3. Create Admin Account

1. In Firebase Console, go to "Authentication" → "Users"
2. Click "Add user"
3. Enter admin email and password
4. Use these credentials to log in to the admin dashboard

### 4. Deploy

The system works locally and can be deployed to any web server. For production, consider:

- Setting Firestore security rules
- Configuring proper authentication
- Setting up hosting (Firebase Hosting, Netlify, etc.)

## How It Works

### For Students
1. Visit the main page (`index.html`)
2. Add items to cart
3. Fill in details and place order
4. Orders sync automatically to the cloud
5. Orders work offline and sync when online

### For Admins
1. Visit `admin.html`
2. Log in with admin credentials
3. View all orders in real-time
4. Orders update automatically as students place them
5. Export/import functionality available for backup

## Architecture

```
├── index.html          # Main ordering interface
├── admin.html          # Admin dashboard with sync status
├── confirm.html        # Order confirmation page
├── css/
│   └── styles.css      # Modern Apple-inspired design
└── js/
    ├── firebase.js     # Firebase integration and storage
    ├── menu.js         # Menu management and cart functionality
    ├── order.js        # Order processing with unified storage
    └── admin.js        # Admin dashboard with authentication
```

## Storage Abstraction

The system uses a unified storage layer that prioritizes Firebase but falls back gracefully:

```javascript
// Unified storage with Firebase primary, local fallback
class UnifiedStorage {
  constructor() {
    this.localStorage = indexedDBSupported ? new IndexedDBStorage() : new LocalStorageFallback();
    this.firebaseAvailable = false;
  }

  async saveOrder(order) {
    // Try Firebase first, fallback to local storage
    if (this.firebaseAvailable) {
      return await firebaseStorage.saveOrder(order);
    } else {
      return await this.localStorage.saveOrder(order);
    }
  }
}
```

## Data Structure

### Order Object
```javascript
{
  id: "firebase-doc-id",          // Firebase document ID
  studentName: "John Doe",
  form: "AS",                     // AS or A2
  itemsText: "Item 1 ×2; Item 2 ×1", // Human-readable
  items: [                        // Structured data
    { name: "Item 1", qty: 2 },
    { name: "Item 2", qty: 1 }
  ],
  status: "Pending",
  createdAt: "2026-02-02T10:30:00.000Z",
  synced: true,                   // Firebase sync status
  syncedAt: "2026-02-02T10:30:05.000Z"
}
```

## Browser Compatibility

- **Firebase**: All modern browsers with JavaScript enabled
- **IndexedDB**: Chrome 24+, Firefox 16+, Safari 10+, Edge 12+
- **localStorage**: All modern browsers
- **ES6 Modules**: Chrome 61+, Firefox 60+, Safari 11+, Edge 16+

## Development

### Local Development
```bash
# Start local server
python -m http.server 8000

# Open in browser
# http://localhost:8000
```

### Admin Access
- Requires Firebase authentication
- URL: `http://localhost:8000/admin.html`

## Security Considerations

- Firebase Authentication for admin access
- Firestore security rules should be configured for production
- Orders validated client-side
- Local storage provides additional privacy layer

## Performance

- Firebase provides real-time performance
- IndexedDB provides better performance for large datasets
- localStorage suitable for smaller applications
- Automatic sync queuing for offline orders
- Real-time listeners for instant UI updates

## Troubleshooting

### Firebase Connection Issues
- Check Firebase config is correct
- Ensure Firestore is enabled
- Check browser console for errors

### Sync Not Working
- Verify internet connection
- Check Firebase project is active
- Look for console errors

### Admin Login Issues
- Verify email/password in Firebase Authentication
- Check authentication is enabled
- Ensure correct credentials

```
├── index.html          # Main ordering interface
├── admin.html          # Admin dashboard
├── confirm.html        # Order confirmation page
├── css/
│   └── styles.css      # Modern Apple-inspired design
└── js/
    ├── menu.js         # Menu management and cart functionality
    ├── order.js        # Order processing with storage abstraction
    └── admin.js        # Admin dashboard with storage abstraction
```

## Storage Abstraction

The system uses a storage abstraction layer that automatically chooses the best available storage method:

```javascript
// Storage interface
class StorageBackend {
  async saveOrder(order) { /* implementation */ }
  async getAllOrders() { /* implementation */ }
  async checkExistingOrderToday(studentName) { /* implementation */ }
}

// Automatic selection
const storage = indexedDBSupported ? new IndexedDBStorage() : new LocalStorageFallback();
```

## Data Structure

### Order Object
```javascript
{
  id: "auto-generated",           // IndexedDB auto-increment
  studentName: "John Doe",
  form: "AS",                     // AS or A2
  itemsText: "Item 1 ×2; Item 2 ×1", // Human-readable
  items: [                        // Structured data
    { name: "Item 1", qty: 2 },
    { name: "Item 2", qty: 1 }
  ],
  status: "Pending",
  createdAt: "2026-02-02T10:30:00.000Z"
}
```

## Browser Compatibility

- **IndexedDB**: Chrome 24+, Firefox 16+, Safari 10+, Edge 12+
- **localStorage**: All modern browsers
- **ES6 Modules**: Chrome 61+, Firefox 60+, Safari 11+, Edge 16+

## Development

### Local Development
```bash
# Start local server
python -m http.server 8000

# Open in browser
# http://localhost:8000
```

### Admin Access
- Password: `EdgeAdmin`
- URL: `http://localhost:8000/admin.html`

## Future Enhancements

1. **Service Worker Caching**: Offline functionality
2. **File Export**: CSV/Excel export for admin
3. **Push Notifications**: Order status updates
4. **Multi-device Sync**: Cloud synchronization
5. **Advanced Analytics**: Order trends and statistics

## Security Considerations

- Admin password is client-side only (not secure for production)
- All data stored locally in browser
- No server-side validation
- Consider implementing proper authentication for production use

## Performance

- IndexedDB provides better performance for large datasets
- localStorage suitable for smaller applications
- Cart data cached in localStorage for persistence
- Lazy loading and efficient DOM updates</content>
<parameter name="filePath">c:\Users\richa\New folder (5)\tuckshop-preorder\README.md