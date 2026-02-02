// Google Apps Script code for handling tuck shop orders
// Deploy this as a web app with "Execute as: Me" and "Who has access: Anyone"

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Student Name', 'Form', 'Items', 'Status', 'Created At']);
    }

    // Format items
    const itemsText = data.items.map(item => `${item.name} ×${item.qty}`).join('; ');

    // Add order
    sheet.appendRow([
      new Date().toLocaleString(),
      data.studentName,
      data.form,
      itemsText,
      data.status,
      new Date(data.createdAt).toLocaleString()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Convert to JSON format
    const orders = [];
    for (let i = 1; i < data.length; i++) { // Skip header row
      orders.push({
        timestamp: data[i][0],
        studentName: data[i][1],
        form: data[i][2],
        itemsText: data[i][3],
        status: data[i][4],
        createdAt: data[i][5]
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify(orders))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}