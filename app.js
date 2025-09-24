class OrderManagementApp {
    constructor() {
        this.orders = [];
        this.currentEditId = null;
        this.connectionStatus = 'disconnected';
        this.appsScriptUrl = '';
        
        // Load sample data and initialize
        this.loadSampleData();
        this.loadFromLocalStorage();
        this.initializeEventListeners();
        this.updateDashboard();
        this.renderOrders();
        this.showTab('dashboard');
    }

    // Load sample data if no data exists
    loadSampleData() {
        const sampleOrders = [
            {
                id: 1,
                orderNumber: "IJD101",
                partyName: "Tawfik",
                orderDate: "2024-09-17",
                orderStatus: "Delivered",
                expectedDelivery: "2024-09-25",
                delivered: "No",
                contact: "1234567890",
                imageUrls: "https://example.com/image1.jpg"
            },
            {
                id: 2,
                orderNumber: "1002", 
                partyName: "Munmun",
                orderDate: "2024-09-18",
                orderStatus: "Cancelled",
                expectedDelivery: "2024-09-22",
                delivered: "Yes",
                contact: "9876543210",
                imageUrls: "https://example.com/image2.jpg"
            },
            {
                id: 3,
                orderNumber: "1003",
                partyName: "Diamond Works", 
                orderDate: "2024-09-19",
                orderStatus: "Delivered",
                expectedDelivery: "2024-09-24",
                delivered: "No",
                contact: "1122334455",
                imageUrls: "https://example.com/image3.jpg"
            }
        ];

        // Only load sample data if no orders exist
        if (this.orders.length === 0) {
            this.orders = sampleOrders;
            this.saveToLocalStorage();
        }
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });

        // Modal controls
        document.getElementById('newOrderBtn').addEventListener('click', () => this.showOrderModal());
        document.getElementById('modalClose').addEventListener('click', () => this.hideOrderModal());
        document.getElementById('modalOverlay').addEventListener('click', () => this.hideOrderModal());
        document.getElementById('modalCancel').addEventListener('click', () => this.hideOrderModal());
        document.getElementById('modalSave').addEventListener('click', () => this.saveOrder());

        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());
        document.getElementById('settingsClose').addEventListener('click', () => this.hideSettingsModal());
        document.getElementById('settingsOverlay').addEventListener('click', () => this.hideSettingsModal());

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('deliveredFilter').addEventListener('change', () => this.applyFilters());

        // Export/Import
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportToCsv());
        document.getElementById('importCsvBtn').addEventListener('click', () => this.triggerFileImport());
        document.getElementById('csvFileInput').addEventListener('change', (e) => this.handleFileImport(e));

        // Google Sheets integration
        document.getElementById('testConnectionBtn').addEventListener('click', () => this.testConnection());
        document.getElementById('connectJsonpBtn').addEventListener('click', () => this.connectJsonp());
        document.getElementById('uploadCsvBtn').addEventListener('click', () => this.triggerFileImport());
        document.getElementById('downloadCsvBtn').addEventListener('click', () => this.exportToCsv());
        document.getElementById('importPasteBtn').addEventListener('click', () => this.importFromPaste());

        // Settings actions
        document.getElementById('clearLocalDataBtn').addEventListener('click', () => this.clearLocalData());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportToJson());
        document.getElementById('backupDataBtn').addEventListener('click', () => this.backupData());

        // Form submission
        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrder();
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideOrderModal();
                this.hideSettingsModal();
            }
        });
    }

    // Tab navigation
    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Update data when showing specific tabs
        if (tabName === 'dashboard') {
            this.updateDashboard();
        } else if (tabName === 'orders') {
            this.renderOrders();
        } else if (tabName === 'sync') {
            this.updateSyncStatus();
        }
    }

    // Dashboard updates
    updateDashboard() {
        const totalOrders = this.orders.length;
        const delivered = this.orders.filter(order => order.delivered === 'Yes').length;
        const pending = this.orders.filter(order => order.orderStatus === 'Pending').length;
        const cancelled = this.orders.filter(order => order.orderStatus === 'Cancelled').length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('deliveredOrders').textContent = delivered;
        document.getElementById('pendingOrders').textContent = pending;
        document.getElementById('cancelledOrders').textContent = cancelled;

        this.renderRecentOrders();
    }

    renderRecentOrders() {
        const recentOrders = this.orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);

        const container = document.getElementById('recentOrdersList');
        
        if (recentOrders.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No orders found</p></div>';
            return;
        }

        container.innerHTML = recentOrders.map(order => `
            <div class="recent-order-item">
                <div class="recent-order-info">
                    <h4>${order.orderNumber} - ${order.partyName}</h4>
                    <p>${this.formatDate(order.orderDate)} • ${order.orderStatus}</p>
                </div>
                <div class="status status--${this.getStatusClass(order.orderStatus)}">
                    ${order.orderStatus}
                </div>
            </div>
        `).join('');
    }

    // Orders management
    renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        const filteredOrders = this.getFilteredOrders();

        if (filteredOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <h3>No orders found</h3>
                            <p>Try adjusting your filters or add a new order</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredOrders.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.partyName}</td>
                <td>${this.formatDate(order.orderDate)}</td>
                <td>
                    <span class="status status--${this.getStatusClass(order.orderStatus)}">
                        ${order.orderStatus}
                    </span>
                </td>
                <td>${order.expectedDelivery ? this.formatDate(order.expectedDelivery) : '-'}</td>
                <td>
                    <span class="status status--${order.delivered === 'Yes' ? 'success' : 'warning'}">
                        ${order.delivered}
                    </span>
                </td>
                <td>${order.contact || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn--outline btn--sm" onclick="app.editOrder('${order.id}')">
                            Edit
                        </button>
                        <button class="btn btn--outline btn--sm" onclick="app.deleteOrder('${order.id}')" 
                                style="color: var(--color-error)">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getFilteredOrders() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const deliveredFilter = document.getElementById('deliveredFilter').value;

        return this.orders.filter(order => {
            const matchesSearch = !searchTerm || 
                order.orderNumber.toLowerCase().includes(searchTerm) ||
                order.partyName.toLowerCase().includes(searchTerm) ||
                order.contact.toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
            const matchesDelivered = !deliveredFilter || order.delivered === deliveredFilter;

            return matchesSearch && matchesStatus && matchesDelivered;
        });
    }

    applyFilters() {
        this.renderOrders();
    }

    // Order CRUD operations
    showOrderModal(order = null) {
        const modal = document.getElementById('orderModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('orderForm');

        if (order) {
            title.textContent = 'Edit Order';
            this.currentEditId = order.id;
            this.populateForm(order);
        } else {
            title.textContent = 'Add New Order';
            this.currentEditId = null;
            form.reset();
            // Set today's date as default
            document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideOrderModal() {
        document.getElementById('orderModal').classList.add('hidden');
        document.body.style.overflow = '';
        this.currentEditId = null;
    }

    populateForm(order) {
        const orderNumberInput = document.getElementById('orderNumber');
        orderNumberInput.value = order.orderNumber;
        orderNumberInput.readOnly = true;
        document.getElementById('partyName').value = order.partyName;
        document.getElementById('orderDate').value = order.orderDate[0];
        document.getElementById('orderStatus').value = order.orderStatus;
        document.getElementById('expectedDelivery').value = order.expectedDelivery || '';
        document.getElementById('delivered').value = order.delivered;
        document.getElementById('contact').value = order.contact || '';
        document.getElementById('imageUrls').value = order.imageUrls || '';
    }

    saveOrder() {
        const form = document.getElementById('orderForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const orderData = {
            orderNumber: document.getElementById('orderNumber').value,
            partyName: document.getElementById('partyName').value,
            orderDate: document.getElementById('orderDate').value,
            orderStatus: document.getElementById('orderStatus').value,
            expectedDelivery: document.getElementById('expectedDelivery').value,
            delivered: document.getElementById('delivered').value,
            contact: document.getElementById('contact').value,
            imageUrls: document.getElementById('imageUrls').value
        };
        let currentOrder;
        let userAction;
        if (this.currentEditId) {
            // Update existing order
            const orderIndex = this.orders.findIndex(o => o.id === this.currentEditId);
            this.orders[orderIndex] = { ...this.orders[orderIndex], ...orderData };
            currentOrder = this.orders[orderIndex];
            userAction='update'
        } else {
            // Prevent duplicate orderNumber
            const duplicateOrder = this.orders.find(o => o.orderNumber === orderData.orderNumber);
            if (duplicateOrder) {
                this.showMessage('Duplicate order number is not allowed.', 'error');
                return;
            }
            // Add new order
            const newOrder = {
                id: Date.now(),
                ...orderData
            };
            this.orders.push(newOrder);
            currentOrder = newOrder;
            userAction='create'
        }

        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderOrders();
        this.hideOrderModal();
        this.showMessage('Order saved successfully!', 'success');

        // Sync with Google Sheets if connected
        if (this.connectionStatus === 'connected') {
            this.syncSingleOrderToGoogleSheets(currentOrder,userAction);
        }
    }

    editOrder(id) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            this.showOrderModal(order);
        }
    }

    deleteOrder(id) {
        if (confirm('Are you sure you want to delete this order?')) {
            let currentOrder = this.orders.find(o => o.id === id);
            this.orders = this.orders.filter(o => o.id !== id);
            this.saveToLocalStorage();
            this.updateDashboard();
            this.renderOrders();
            this.showMessage('Order deleted successfully!', 'success');

            // Sync with Google Sheets if connected
            if (this.connectionStatus === 'connected') {
                this.syncSingleOrderToGoogleSheets(currentOrder,'delete');
            }
        }
    }

    // Google Sheets Integration (CORS-free methods)
    testConnection() {
        const url = document.getElementById('appsScriptUrl').value.trim();
        if (!url) {
            this.showMessage('Please enter a Google Apps Script URL', 'error');
            return;
        }

        this.updateConnectionStatus('testing');
        
        // Use JSONP to test connection
        this.makeJsonpRequest(url, { action: 'test' })
            .then(response => {
                console.log('Received response:', response);
                if (response && response.status === 'success') {
                    this.connectionStatus = 'connected';
                    this.appsScriptUrl = url;
                    this.updateConnectionStatus('connected');
                    this.showMessage('Connection successful!', 'success');
                    this.performInitialSync();
                } else {
                    throw new Error('Invalid response from server');
                }
            })
            .catch(error => {
                console.error('Connection test failed:', error);
                this.connectionStatus = 'disconnected';
                this.updateConnectionStatus('disconnected');
                this.showMessage('Connection failed. Try CSV sync instead.', 'error');
            });
    }

    connectJsonp() {
        const url = document.getElementById('appsScriptUrl').value.trim();
        if (!url) {
            this.showMessage('Please enter a Google Apps Script URL', 'error');
            return;
        }

        this.appsScriptUrl = url;
        this.testConnection();
    }

    makeJsonpRequest(url, params = {}) {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            
            // Create callback function
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                resolve(data);
            };

            // Create script element
            const script = document.createElement('script');
            const paramString = Object.keys(params)
                .map(key => `${key}=${encodeURIComponent(params[key])}`)
                .join('&');
            
            script.src = `${url}${paramString ? '?' + paramString : ''}${paramString ? '&' : '?'}callback=${callbackName}`;
            
            // Handle errors
            script.onerror = function() {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('JSONP request failed'));
            };

            // Set timeout
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    if (document.body.contains(script)) {
                        document.body.removeChild(script);
                    }
                    reject(new Error('Request timeout'));
                }
            }, 10000);

            document.body.appendChild(script);
        });
    }

    syncToGoogleSheets(userAction) {
        if (this.connectionStatus !== 'connected') {
            return;
        }

        this.makeJsonpRequest(this.appsScriptUrl, {
            action: userAction,
            data: JSON.stringify(this.orders)
        }).then(response => {
            if (response && response.status === 'success') {
                this.showMessage('Data synced to Google Sheets!', 'success');
            }
        }).catch(error => {
            console.error('Sync failed:', error);
            this.showMessage('Sync failed. Data saved locally.', 'warning');
        });
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        const statusClasses = {
            'connected': 'status--success',
            'testing': 'status--info', 
            'disconnected': 'status--error'
        };

        const statusTexts = {
            'connected': 'Connected',
            'testing': 'Testing...',
            'disconnected': 'Not Connected'
        };

        statusElement.innerHTML = `<span class="status ${statusClasses[status]}">${statusTexts[status]}</span>`;
    }

    updateSyncStatus() {
        document.getElementById('localOrderCount').textContent = this.orders.length;
        this.updateConnectionStatus(this.connectionStatus);
    }

    // CSV Import/Export
    exportToCsv() {
        if (this.orders.length === 0) {
            this.showMessage('No orders to export', 'warning');
            return;
        }

        const headers = ['Order Number', 'Party Name', 'Order Date', 'Order Status', 
                        'Expected Delivery', 'Delivered', 'Contact', 'Image URLs'];
        
        const csvContent = [
            headers.join(','),
            ...this.orders.map(order => [
                this.escapeCsv(order.orderNumber),
                this.escapeCsv(order.partyName),
                order.orderDate,
                this.escapeCsv(order.orderStatus),
                order.expectedDelivery || '',
                order.delivered,
                this.escapeCsv(order.contact || ''),
                this.escapeCsv(order.imageUrls || '')
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, 'orders.csv', 'text/csv');
        this.showMessage('Orders exported successfully!', 'success');
    }

    triggerFileImport() {
        document.getElementById('csvFileInput').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showMessage('Please select a CSV file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.importFromCsv(e.target.result);
            } catch (error) {
                console.error('Import error:', error);
                this.showMessage('Failed to import CSV. Please check the format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    importFromCsv(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header and one data row');
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const importedOrders = [];

        dataLines.forEach((line, index) => {
            try {
                const values = this.parseCsvLine(line);
                if (values.length >= 6) {
                    const order = {
                        id: Date.now() + index,
                        orderNumber: values[0] || '',
                        partyName: values[1] || '',
                        orderDate: values[2] || '',
                        orderStatus: values[3] || 'Pending',
                        expectedDelivery: values[4] || '',
                        delivered: values[5] || 'No',
                        contact: values[6] || '',
                        imageUrls: values[7] || ''
                    };
                    importedOrders.push(order);
                }
            } catch (error) {
                console.warn(`Skipping invalid line ${index + 2}:`, line);
            }
        });

        if (importedOrders.length === 0) {
            throw new Error('No valid orders found in CSV');
        }

        // Ask user if they want to replace or append
        const replace = confirm(
            `Found ${importedOrders.length} orders in CSV.\n\n` +
            'Click OK to replace existing orders, or Cancel to append to existing orders.'
        );

        if (replace) {
            this.orders = importedOrders;
        } else {
            this.orders = [...this.orders, ...importedOrders];
        }

        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderOrders();
        this.showMessage(`Successfully imported ${importedOrders.length} orders!`, 'success');

        // Reset file input
        document.getElementById('csvFileInput').value = '';
    }

    importFromPaste() {
        const textarea = document.getElementById('pasteDataTextarea');
        const csvText = textarea.value.trim();
        
        if (!csvText) {
            this.showMessage('Please paste CSV data first', 'warning');
            return;
        }

        try {
            this.importFromCsv(csvText);
            textarea.value = '';
        } catch (error) {
            console.error('Import error:', error);
            this.showMessage('Failed to import data. Please check the format.', 'error');
        }
    }

    // Settings and data management
    showSettingsModal() {
        document.getElementById('settingsModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.updateSyncStatus();
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    clearLocalData() {
        if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
            this.orders = [];
            this.saveToLocalStorage();
            this.updateDashboard();
            this.renderOrders();
            this.showMessage('All local data cleared!', 'success');
        }
    }

    exportToJson() {
        const data = {
            orders: this.orders,
            exportDate: new Date().toISOString(),
            totalOrders: this.orders.length
        };

        this.downloadFile(
            JSON.stringify(data, null, 2),
            'orders-backup.json',
            'application/json'
        );
        this.showMessage('Data exported as JSON!', 'success');
    }

    backupData() {
        this.exportToJson();
    }

    // Utility functions
    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    }

    getStatusClass(status) {
        const statusMap = {
            'Pending': 'warning',
            'Processing': 'info',
            'Delivered': 'success',
            'Cancelled': 'error',
            'On Hold': 'warning'
        };
        return statusMap[status] || 'info';
    }

    escapeCsv(value) {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    parseCsvLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message--${type}`;
        messageDiv.textContent = message;

        // Insert at the top of the main content
        const main = document.querySelector('.main .container');
        main.insertBefore(messageDiv, main.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Local storage operations
    saveToLocalStorage() {
        try {
            localStorage.setItem('orderManagementData', JSON.stringify({
                orders: this.orders,
                lastSaved: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('orderManagementData');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.orders && Array.isArray(parsed.orders)) {
                    this.orders = parsed.orders;
                }
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }

    // Sync only the current order to Google Sheets
    syncSingleOrderToGoogleSheets(orderData,userAction='create') {
        if (this.connectionStatus !== 'connected') {
            return;
        }

        // Send only the single order data (not all orders array)
        this.makeJsonpRequest(this.appsScriptUrl, {
            action: userAction,
            orderNumber: orderData.orderNumber,
            partyName: orderData.partyName,
            orderDate: orderData.orderDate,
            orderStatus: orderData.orderStatus,
            expectedDelivery: orderData.expectedDelivery,
            delivered: orderData.delivered,
            contact: orderData.contact,
            imageUrls: orderData.imageUrls
        }).then(response => {
            console.log('Sync response:', response);
            if (response && (response.success === true || response.status === 'success')) {
                this.showMessage(`Order ${orderData.orderNumber} synced to Google Sheets!`, 'success');
            } else {
                this.showMessage('Sync failed, but order '+userAction+'d locally', 'warning');
            }
        }).catch(error => {
            console.error('Sync failed:', error);
            this.showMessage('Sync failed, but order '+userAction+'d locally', 'warning');
        });
    }

    // Perform initial sync when connecting for the first time
    async performInitialSync() {
        if (this.connectionStatus !== 'connected') {
            return;
        }

        try {
            this.showMessage('Syncing local data to Google Sheets...', 'info');
            
            //Not required
            // Step 1: Upload all local orders to Google Sheets
            // if (this.orders.length > 0) {
            //     await this.uploadAllOrdersToGoogleSheets();
            // }
            
            // Step 2: Fetch all data back from Google Sheets to ensure consistency
            await this.fetchAllOrdersFromGoogleSheets();
            
            this.showMessage('Initial sync completed successfully!', 'success');
            
        } catch (error) {
            console.error('Initial sync failed:', error);
            this.showMessage('Initial sync failed, but connection is working', 'warning');
        }
    }
    // Upload all local orders to Google Sheets
    async uploadAllOrdersToGoogleSheets() {
        if (this.orders.length === 0) {
            return;
        }

        this.showMessage(`Uploading ${this.orders.length} local orders to Google Sheets...`, 'info');
        
        let successCount = 0;
        let failCount = 0;
        
        // Upload orders one by one with small delays
        for (let i = 0; i < this.orders.length; i++) {
            const order = this.orders[i];
            
            try {
                const response = await this.makeJsonpRequest(this.appsScriptUrl, {
                    action: 'create',
                    orderNumber: order.orderNumber,
                    partyName: order.partyName,
                    orderDate: order.orderDate,
                    orderStatus: order.orderStatus,
                    expectedDelivery: order.expectedDelivery,
                    delivered: order.delivered,
                    contact: order.contact,
                    imageUrls: order.imageUrls
                });
                
                if (response && (response.success === true || response.status === 'success')) {
                    successCount++;
                    console.log(`Uploaded order: ${order.orderNumber}`);
                } else {
                    failCount++;
                }
                
            } catch (error) {
                failCount++;
                console.error(`Error uploading order: ${order.orderNumber}`, error);
            }
            
            // Small delay to avoid overwhelming the API
            if (i < this.orders.length - 1) {
                await this.delay(200); // 200ms delay between requests
            }
        }
        
        if (failCount > 0) {
            this.showMessage(`Uploaded ${successCount} orders, ${failCount} failed`, 'warning');
        } else {
            this.showMessage(`Successfully uploaded all ${successCount} orders`, 'success');
        }
    }
    // Fetch all orders from Google Sheets and update local data
    async fetchAllOrdersFromGoogleSheets() {
        try {
            this.showMessage('Fetching latest data from Google Sheets...', 'info');
            
            const response = await this.makeJsonpRequest(this.appsScriptUrl, { action: 'read' });
            
            if (response && (response.success === true || response.status === 'success') && response.data) {
                // Convert Google Sheets data to app format
                const sheetsOrders = response.data.map((sheetOrder, index) => ({
                    id: sheetOrder.id || Date.now() + index, // Ensure unique ID
                    orderNumber: sheetOrder.orderNumber || '',
                    partyName: sheetOrder.partyName || '',
                    orderDate: sheetOrder.orderDate || '',
                    orderStatus: sheetOrder.orderStatus || 'Pending',
                    expectedDelivery: sheetOrder.expectedDelivery || '',
                    delivered: sheetOrder.delivered || 'No',
                    contact: sheetOrder.contact || '',
                    imageUrls: sheetOrder.imageUrls || ''
                }));
                
                // Update local data with Google Sheets data
                this.orders = sheetsOrders;
                this.saveToLocalStorage();
                
                // Update UI
                this.updateDashboard();
                this.renderOrders();
                
                this.showMessage(`Loaded ${sheetsOrders.length} orders from Google Sheets`, 'success');
                
            } else {
                this.showMessage('No data found in Google Sheets', 'info');
            }
            
        } catch (error) {
            console.error('Failed to fetch from Google Sheets:', error);
            this.showMessage('Failed to fetch data from Google Sheets', 'warning');
        }
    }

    // Helper method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }




}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new OrderManagementApp();
});

// Make app globally accessible for inline event handlers
window.app = app;