# 📋 Order Management System

A modern, responsive web application for managing jewelry orders with seamless Google Sheets integration. Built with vanilla JavaScript, this system provides a complete order tracking solution with real-time synchronization to Google Sheets.

## 🌟 Features

### 📊 **Core Order Management**
- ✅ **Add, Edit, Delete Orders** - Complete CRUD operations
- 🔍 **Advanced Search & Filtering** - Filter by status, delivery, and search terms
- 📈 **Real-time Dashboard** - Analytics and order statistics
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 💾 **Local Storage** - Data persists between sessions

### 🔄 **Google Sheets Integration**
- 🔗 **JSONP Connection** - Bypasses CORS restrictions
- ⚡ **Real-time Sync** - Automatic synchronization with Google Sheets
- 📥 **Bulk Import/Export** - CSV upload/download functionality
- 🔄 **Duplicate Handling** - Smart duplicate detection and management
- 📊 **Direct Sheet Access** - One-click access to your Google Sheet

### 🎨 **Production Workflow Status**
- 🆕 **New** - Order just received
- 🎨 **Cad Done** - CAD design completed
- 📄 **RPT DONE** - Report/Documentation completed
- ⚒️ **Casting Process** - In casting/manufacturing phase
- 📦 **Ready For Delivery** - Finished, ready to ship
- ✅ **Delivered** - Successfully delivered
- ⏸️ **On HOLD** - Temporarily paused
- ❌ **Cancelled** - Order cancelled

## 🚀 Live Demo

**🌐 [Try the Live App](https://mohdahmadatwork.github.io/ordering-app/)**

No installation required! Use the deployed version directly with your own Google Sheet.

## 🛠️ Quick Setup (Using Live App)

### **Option 1: Use Live App (Recommended)**

1. **📋 Create a Google Sheet:**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Rename the first sheet to `orders`
   - Add headers in row 1: `Order Number | Party Name | Order Date | Order Status | Expected Delivery | Delivered | Contact | Image URLs`

2. **📄 Add Google Apps Script:**
   - In your Google Sheet, go to `Extensions` → `Apps Script`
   - Delete any existing code
   - Copy the entire contents of [`googlesheetscript.gs`](./googlesheetscript.gs) from this repository
   - Paste it into the Apps Script editor
   - Save the project (Ctrl+S)

3. **🚀 Deploy Apps Script:**
   - Click `Deploy` → `New Deployment`
   - Choose type: `Web app`
   - Description: `Order Management API`
   - Execute as: `Me`
   - Who has access: `Anyone`
   - Click `Deploy`
   - **Copy the Web App URL** (you'll need this)

4. **🔗 Connect to Live App:**
   - Go to **[https://github.com/mohdahmadatwork/ordering-app/](https://github.com/mohdahmadatwork/ordering-app/)**
   - Navigate to the `Google Sheets` tab
   - Paste your **Apps Script URL** in the first field
   - Paste your **Google Sheet URL** in the second field (optional)
   - Click `Connect JSONP`
   - Start managing your orders! 🎉

### **Option 2: Self-Host**

1. **📂 Clone the Repository:**
   ```bash
   git clone https://github.com/mohdahmadatwork/ordering-app.git
   cd ordering-app
   ```

2. **🌐 Serve Locally:**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **🔗 Access the App:**
   - Open `http://localhost:8000` in your browser
   - Follow the same Google Sheets setup as Option 1

## 📁 Project Structure

```
ordering-app/
├── 📄 index.html              # Main HTML file
├── 🎨 styles.css              # Application styles
├── ⚙️ app.js                  # Core application logic
├── 📜 googlesheetscript.gs    # Google Apps Script code
├── 📖 README.md               # This file
└── 📊 sample-data/            # Sample CSV files
    └── orders-sample.csv
```

## 🔧 Google Apps Script Setup

The `googlesheetscript.gs` file contains all the necessary server-side code for Google Sheets integration:

### **Key Functions:**
- `doGet(e)` - Handles all GET requests (test, read, create, update, delete)
- `testConnection()` - Tests the connection and returns sheet info
- `readData()` - Reads all orders from the sheet
- `createOrder()` - Creates a new order
- `updateOrder()` - Updates an existing order
- `deleteOrder()` - Deletes an order
- `bulkImportOrders()` - Handles bulk CSV imports
- `clearAllData()` - Clears sheet data (except headers)

### **Setup Instructions:**

1. **📊 Prepare Your Google Sheet:**
   ```
   Column A: Order Number
   Column B: Party Name
   Column C: Order Date
   Column D: Order Status
   Column E: Expected Delivery
   Column F: Delivered
   Column G: Contact
   Column H: Image URLs
   ```

2. **📄 Deploy Apps Script:**
   - Copy [`googlesheetscript.gs`](./googlesheetscript.gs) to your Apps Script project
   - Deploy as Web App with public access
   - Copy the deployment URL

3. **🔗 Connect to App:**
   - Use the deployment URL in the web app
   - Enjoy real-time synchronization!

## 🎯 Usage Guide

### **Adding Orders:**
1. Click `+ New Order`
2. Fill in the order details
3. Choose appropriate status from the workflow
4. Save - automatically syncs to Google Sheets

### **Managing Orders:**
- **Edit**: Click the edit button on any order
- **Delete**: Click delete (with confirmation)
- **Filter**: Use the search and filter options
- **Export**: Download orders as CSV

### **Google Sheets Sync:**
- **Real-time**: Changes sync automatically
- **Bulk Import**: Upload CSV files
- **Duplicate Handling**: Smart conflict resolution
- **Direct Access**: Click "Open Sheet" to view in Google Sheets

## 📊 Order Status Workflow

The system uses a production-specific workflow perfect for jewelry/manufacturing:

```
New → Cad Done → RPT DONE → Casting Process → Ready For Delivery → Delivered
                     ↓
                  On HOLD / Cancelled
```

## 🔒 Data Validation

- **Status Validation**: Only valid statuses allowed
- **Duplicate Detection**: Prevents/handles duplicate order numbers  
- **Required Fields**: Order number and party name are mandatory
- **Data Sanitization**: Automatic cleanup of invalid data

## 📱 Mobile Support

Fully responsive design works perfectly on:
- 📱 **Mobile phones** (iOS/Android)
- 📟 **Tablets** (iPad/Android tablets)
- 💻 **Desktop** (Windows/Mac/Linux)
- 🌐 **All modern browsers**

## 🚫 CORS Solution

Uses JSONP (JSON with Padding) to bypass CORS restrictions:
- ✅ **No server setup required**
- ✅ **Works with any hosting**
- ✅ **Direct Google Sheets connection**
- ✅ **No authentication complexity**

## 🔄 Sync Methods

Multiple ways to sync data:

1. **🔄 JSONP Method** (Recommended)
   - Real-time bidirectional sync
   - Automatic conflict resolution
   - No manual intervention

2. **📄 CSV Upload/Download**
   - Manual bulk operations
   - Great for backups
   - Works offline

3. **📋 Copy/Paste**
   - Quick data transfer
   - Useful for one-time imports
   - No file handling

## 🛡️ Data Security

- **Local Storage**: Data saved in browser
- **Google Sheets**: Data stored in your Google account
- **No Third-party**: No external databases
- **Privacy First**: Your data stays with you

## 🎨 Customization

### **Adding New Status:**
1. Update HTML select options in `index.html`
2. Add status to `validStatuses` array in `app.js`
3. Update CSS color classes if needed

### **Styling:**
- Modify `styles.css` for appearance changes
- CSS variables for easy theming
- Responsive breakpoints included

## 🐛 Troubleshooting

### **Common Issues:**

**❌ "Connection Failed"**
- Check Apps Script URL is correct
- Ensure Web App is deployed as "Anyone" access
- Verify Google Sheet has "orders" sheet name

**❌ "CORS Error"**
- Use JSONP method (not direct fetch)
- Ensure Apps Script returns JSONP format
- Check callback parameter is included

**❌ "No Data Syncing"**
- Verify sheet column headers match exactly
- Check Apps Script permissions
- Test connection first before syncing

### **Support:**
- 📧 Create an issue on GitHub
- 📋 Check existing issues for solutions
- 🔍 Review the Apps Script logs in Google Cloud Console

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with vanilla JavaScript for maximum compatibility
- Google Apps Script for serverless backend
- Modern CSS for responsive design
- JSONP technique for CORS handling

## 🔗 Links

- **🌐 Live Demo**: [https://mohdahmadatwork.github.io/ordering-app/](https://mohdahmadatwork.github.io/ordering-app/)
- **📚 Repository**: [https://github.com/mohdahmadatwork/ordering-app/](https://github.com/mohdahmadatwork/ordering-app/)
- **📜 Google Apps Script**: [`googlesheetscript.gs`](./googlesheetscript.gs)

---

**🚀 Ready to streamline your order management? Start with the [live demo](https://github.com/mohdahmadatwork/ordering-app/) now!**
