# Tuck Shop Preorder System

A modern web application for school tuck shop preordering with cross-device synchronization.

## Features

- **Student Ordering**: Easy-to-use interface with autocomplete name selection
- **Real-time Cart**: Add/remove items with live quantity updates
- **Time-based Ordering**: Automatically opens at 5 PM and closes at 9 PM
- **Admin Dashboard**: Password-protected order management with date grouping
- **Cross-device Sync**: Orders stored centrally and accessible from any device
- **Responsive Design**: Works on desktop, tablet, and mobile

## Setup for GitHub Pages

### 1. Google Sheets Setup

1. Create a new Google Sheet
2. Go to **Extensions > Apps Script**
3. Replace the default code with the content from `google-apps-script.js`
4. Save the script
5. Click **Deploy > New deployment**
6. Select type **Web app**
7. Set **Execute as**: Me
8. Set **Who has access**: Anyone
9. Click **Deploy**
10. **Copy the web app URL** - you'll need this for the next step

### 2. Configuration

1. Open `js/config.js`
2. Replace `YOUR_SCRIPT_ID` with your Google Apps Script deployment URL

```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### 3. Deploy to GitHub Pages

1. Push this code to a GitHub repository
2. Go to repository **Settings > Pages**
3. Set source to **Deploy from a branch**
4. Select **main** branch and **/(root)** folder
5. Click **Save**

Your site will be available at `https://yourusername.github.io/repository-name/`

## Usage

### For Students
- Visit the main page during ordering hours (5-9 PM)
- Select your name from the autocomplete field
- Choose your form (AS/A2)
- Browse menu items and adjust quantities
- Submit your order

### For Admins
- Visit `admin.html`
- Enter password: `EdgeAdmin`
- View orders grouped by date
- Filter by form (All/AS/A2)
- See total quantities needed

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Google Apps Script (serverless)
- **Storage**: Google Sheets
- **Styling**: Modern glassmorphism design with blue/gold theme
- **Security**: Basic password protection for admin access

## File Structure

```
├── index.html          # Student ordering page
├── admin.html          # Admin dashboard
├── confirm.html        # Order confirmation
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   ├── config.js       # API configuration
│   ├── menu.js         # Menu and cart logic
│   ├── order.js        # Order submission
│   └── admin.js        # Admin dashboard logic
├── google-apps-script.js # Server-side code
└── README.md           # This file
```

## Customization

- **Menu Items**: Edit the hardcoded menu in `js/menu.js`
- **Student Names**: Update the datalist in `index.html`
- **Ordering Hours**: Modify `ORDER_OPEN` and `ORDER_CLOSE` in `js/order.js`
- **Admin Password**: Change in `js/admin.js`
- **Colors**: Update CSS variables in `css/styles.css`

## Troubleshooting

- **Orders not saving**: Check that your Google Apps Script URL is correct in `config.js`
- **CORS errors**: Ensure the Apps Script is deployed with "Anyone" access
- **Time issues**: Check that your device's time zone is correct for ordering hours

## License

This project is open source and available under the MIT License.