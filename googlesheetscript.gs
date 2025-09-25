function doGet(e) {
  var action = e.parameter.action || 'test';
  var callback = e.parameter.callback || e.parameter.jsonp;
  var result;
  
  // Handle different actions
  if (action === 'test') {
    result = testConnection();
  } else if (action === 'read') {
    result = readData();
  } else if(action === 'create'){
    var orderData = {
      orderNumber: e.parameter.orderNumber || '',
      partyName: e.parameter.partyName || '',
      orderDate: e.parameter.orderDate || '',
      orderStatus: e.parameter.orderStatus || 'Pending',
      expectedDelivery: e.parameter.expectedDelivery || '',
      delivered: e.parameter.delivered || 'No',
      contact: e.parameter.contact || '',
      imageUrls: e.parameter.imageUrls || ''
    };
    result = createOrder(orderData);
  } else if (action === 'update') {
    var orderData = {
      orderNumber: e.parameter.orderNumber || '',
      partyName: e.parameter.partyName || '',
      orderDate: e.parameter.orderDate || '',
      orderStatus: e.parameter.orderStatus || 'Pending',
      expectedDelivery: e.parameter.expectedDelivery || '',
      delivered: e.parameter.delivered || 'No',
      contact: e.parameter.contact || '',
      imageUrls: e.parameter.imageUrls || ''
    };
    result = updateOrder(orderData);
  }  else if (action === 'delete') {
    var orderData = {
      orderNumber: e.parameter.orderNumber || '',
      partyName: e.parameter.partyName || '',
      orderDate: e.parameter.orderDate || '',
      orderStatus: e.parameter.orderStatus || 'Pending',
      expectedDelivery: e.parameter.expectedDelivery || '',
      delivered: e.parameter.delivered || 'No',
      contact: e.parameter.contact || '',
      imageUrls: e.parameter.imageUrls || ''
    };
    result = deleteOrder(orderData);
  } else if (action === 'bulkImport') {
    // NEW: Handle bulk import
    try {
      var orderDataArray = JSON.parse(e.parameter.data || '[]');
      var updateDuplicates = e.parameter.updateDuplicates === 'true';
      result = bulkImportOrders(orderDataArray, updateDuplicates);
    } catch (error) {
      result = { error: 'Invalid bulk import data: ' + error.toString(), success: false };
    }
  } else {
    result = {
      error: 'Invalid Get action',
      success: false
    };
  }
  
  // Return JSONP if callback parameter provided
  if (callback) {
    var jsonpResponse = callback + '(' + JSON.stringify(result) + ');';
    return ContentService
      .createTextOutput(jsonpResponse)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  // Return regular JSON
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  var result;
  
  if (action === 'create') {
    result = createOrder(data);
  } else if (action === 'update') {
    result = updateOrder(data);
  } else if (action === 'delete') {
    result = deleteOrder(data);
  } else {
    result = {
      error: 'Invalid POST action',
      success: false
    };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function testConnection() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('orders');
    
    if (!sheet) {
      sheet = ss.insertSheet('orders');
      var headers = ['Order Number', 'Party Name', 'Order Date', 'Order Status', 'Expected Delivery', 'Delivered', 'Contact', 'Image URLs'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    return {
      status:"success",
      success: true,
      message: 'Connection successful! Google Apps Script is working with JSONP support.',
      sheetName: sheet.getName(),
      rowCount: sheet.getLastRow(),
      columnCount: sheet.getLastColumn(),
      timestamp: new Date().toISOString(),
      spreadsheetId: ss.getId(),
      jsonpEnabled: true
    };
    
  } catch (error) {
    return {
      error: error.toString(),
      success: false
    };
  }
}

function readData() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
    
    if (!sheet) {
      return {
        error: 'orders sheet not found',
        success: false
      };
    }
    
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return {
        success: true,
        data: [],
        count: 0,
        message: 'No data found'
      };
    }
    
    var data = sheet.getRange(1, 1, lastRow, 8).getValues();
    var rows = data.slice(1); // Skip header row
    
    var orders = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      
      // Skip empty rows
      if (!row[0] && !row[1]) {
        continue;
      }
      
      orders.push({
        id: 'order_' + (i + 1),
        orderNumber: row[0] ? row[0].toString() : '',           // Column A
        partyName: row[1] ? row[1].toString() : '',             // Column B  
        orderDate: row[2] ? formatDate(row[2]) : '',            // Column C
        orderStatus: row[3] ? row[3].toString() : '',           // Column D
        expectedDelivery: row[4] ? formatDate(row[4]) : '',     // Column E
        delivered: row[5] ? row[5].toString() : '',             // Column F
        contact: row[6] ? row[6].toString() : '',               // Column G
        imageUrls: row[7] ? row[7].toString() : ''              // Column H
      });
    }
    
    return {
      success: true,
      data: orders,
      count: orders.length,
      message: 'Data loaded successfully',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      error: error.toString(),
      success: false
    };
  }
}





function createOrder(orderData) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
    
    if (!sheet) {
      return {
        error: 'orders not found',
        success: false
      };
    }
    
    if (!orderData.orderNumber || !orderData.partyName) {
      return {
        error: 'Order Number and Party Name are required',
        success: false
      };
    }
    
    // Check for duplicate order numbers
    var existingData = sheet.getDataRange().getValues();
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][0] && existingData[i][0].toString() === orderData.orderNumber.toString()) {
        return {
          error: 'Order number ' + orderData.orderNumber + ' already exists',
          success: false
        };
      }
    }
    
    var newRow = [
      orderData.orderNumber || '',
      orderData.partyName || '',
      orderData.orderDate || '',
      orderData.orderStatus || 'Pending',
      orderData.expectedDelivery || '',
      orderData.delivered || 'No',
      orderData.contact || '',
      orderData.imageUrls || ''
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      message: 'Order ' + orderData.orderNumber + ' created successfully',
      orderNumber: orderData.orderNumber,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      error: error.toString(),
      success: false
    };
  }
}

function updateOrder(orderData) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
    
    if (!sheet) {
      return {
        error: 'orders not found',
        success: false
      };
    }
    
    if (!orderData.orderNumber) {
      return {
        error: 'Order Number is required',
        success: false
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString() === orderData.orderNumber.toString()) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return {
        error: 'Order ' + orderData.orderNumber + ' not found',
        success: false
      };
    }
    
    var updatedRow = [
      orderData.orderNumber,
      orderData.partyName || data[rowIndex],
      orderData.orderDate || data[rowIndex],
      orderData.orderStatus || data[rowIndex],
      orderData.expectedDelivery || data[rowIndex],
      orderData.delivered || data[rowIndex],
      orderData.contact || data[rowIndex],
      orderData.imageUrls || data[rowIndex]
    ];
    
    sheet.getRange(rowIndex + 1, 1, 1, 8).setValues([updatedRow]);
    
    return {
      success: true,
      message: 'Order ' + orderData.orderNumber + ' updated successfully',
      orderNumber: orderData.orderNumber,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      error: error.toString(),
      success: false
    };
  }
}

function deleteOrder(orderData) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
    
    if (!sheet) {
      return {
        error: 'orders not found',
        success: false
      };
    }
    
    if (!orderData.orderNumber) {
      return {
        error: 'Order Number is required',
        success: false
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString() === orderData.orderNumber.toString()) {
        rowIndex = i; 
        break;
      }
    }
    
    if (rowIndex === -1) {
      return {
        error: 'Order ' + orderData.orderNumber + ' not found',
        success: false
      };
    }
    
    sheet.deleteRow(rowIndex + 1);
    
    return {
      success: true,
      message: 'Order ' + orderData.orderNumber + ' deleted successfully',
      orderNumber: orderData.orderNumber,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      error: error.toString(),
      success: false
    };
  }
}

function formatDate(date) {
  try {
    if (date instanceof Date) {
      return date.toISOString().split('T');
    }
    if (typeof date === 'string' && date.trim() !== '') {
      var parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T');
      }
    }
    return date ? date.toString() : '';
  } catch (error) {
    return date ? date.toString() : '';
  }
}

function bulkImportOrders(orderDataArray, updateDuplicates) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orders');
    
    if (!sheet) {
      return { error: 'orders sheet not found', success: false };
    }
    
    if (!orderDataArray || orderDataArray.length === 0) {
      return { error: 'No orders provided for bulk import', success: false };
    }
    
    // Get existing data to check for duplicates
    var existingData = sheet.getDataRange().getValues();
    var existingOrderNumbers = {};
    
    // Build lookup for existing order numbers
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][0]) {
        existingOrderNumbers[existingData[i][0].toString()] = i + 1; // Store row number
      }
    }
    
    var imported = 0;
    var updated = 0;
    var skipped = 0;
    var errors = [];
    
    // Process each order
    for (var i = 0; i < orderDataArray.length; i++) {
      var order = orderDataArray[i];
      
      if (!order.orderNumber) {
        errors.push('Order at index ' + i + ' missing order number');
        continue;
      }
      
      var orderRow = [
        order.orderNumber,
        order.partyName || '',
        order.orderDate || '',
        order.orderStatus || 'Pending',
        order.expectedDelivery || '',
        order.delivered || 'No',
        order.contact || '',
        order.imageUrls || ''
      ];
      
      var existingRowNumber = existingOrderNumbers[order.orderNumber.toString()];
      
      if (existingRowNumber) {
        // Order exists
        if (updateDuplicates) {
          // Update existing order
          sheet.getRange(existingRowNumber, 1, 1, 8).setValues([orderRow]);
          updated++;
        } else {
          // Skip duplicate
          skipped++;
        }
      } else {
        // New order - append to sheet
        sheet.appendRow(orderRow);
        imported++;
      }
    }
    
    var message = 'Bulk import completed: ';
    if (imported > 0) message += imported + ' imported, ';
    if (updated > 0) message += updated + ' updated, ';
    if (skipped > 0) message += skipped + ' skipped, ';
    if (errors.length > 0) message += errors.length + ' errors';
    
    // Remove trailing comma and space
    message = message.replace(/, $/, '');
    
    return {
      success: true,
      message: message,
      imported: imported,
      updated: updated,
      skipped: skipped,
      errors: errors,
      total: orderDataArray.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return { 
      error: 'Bulk import failed: ' + error.toString(), 
      success: false 
    };
  }
}


// Test function to verify JSONP support
function testJsonp() {
  try {
    var result = testConnection();
    console.log('JSONP test result:', result);
    return 'JSONP support test successful!';
  } catch (error) {
    console.error('JSONP test failed:', error);
    return 'JSONP test failed: ' + error.toString();
  }
}
