/**
 * ImproveFlow - Logistics Backend API (Updated)
 * 3-User Workflow: Requester -> Coordinator -> Transporter
 */

const props = PropertiesService.getScriptProperties();
const SPREADSHEET_ID = props.getProperty('SPREADSHEET_ID');
const LINE_NOTIFY_TOKEN = props.getProperty('LINE_NOTIFY_TOKEN');
const SHEET_JOBS = 'Jobs';

/**
 * Run this function once to set up your keys, or set them in 
 * Project Settings > Script Properties in the GAS UI.
 */
function setupProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    'SPREADSHEET_ID': 'YOUR_REAL_SPREADSHEET_ID_HERE',
    'LINE_NOTIFY_TOKEN': 'YOUR_REAL_LINE_NOTIFY_TOKEN_HERE'
  });
  console.log('Properties have been set!');
}

// --- API Entry Points ---

function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'getJobs') {
      return jsonResponse(getJobs());
    } else if (action === 'getJobDetails') {
      return jsonResponse(getJobDetails(e.parameter.id));
    }
    return jsonResponse({ error: 'Invalid action' }, 400);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  
  try {
    switch (action) {
      case 'user1_submit':
        return jsonResponse(submitJob(body.data));
      case 'user2_assign':
        return jsonResponse(assignPosition(body.id, body.dropoffPosition));
      case 'user3_start':
        return jsonResponse(startJob(body.id));
      case 'user3_complete':
        return jsonResponse(completeJob(body.id, body.photoUrl));
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// --- Workflow Logic ---

/**
 * Step 1: User 1 Submits Job
 */
function submitJob(data) {
  const sheet = getSheet(SHEET_JOBS);
  const jobId = 'JOB-' + new Date().getTime();
  const timestamp = new Date().toISOString();
  
  sheet.appendRow([
    jobId,
    timestamp,
    data.batchNumber,
    data.itemNumber,
    data.itemName,
    data.storagePosition,
    '', // dropoffPosition (empty)
    '', // startTime (empty)
    '', // endTime (empty)
    '', // photoUrl (empty)
    'Pending', // status
    data.uid // uid
  ]);
  
  // TODO: Send Line Notify to User 2
  // sendLineNotify("มีการแจ้งงานใหม่: " + jobId + "\nรอการกำหนดจุดลงสินค้า");
  
  return { success: true, id: jobId };
}

/**
 * Step 2: User 2 Assigns Drop-off Position
 */
function assignPosition(id, dropoffPosition) {
  const sheet = getSheet(SHEET_JOBS);
  const rowIndex = findRowById(sheet, id);
  
  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 7).setValue(dropoffPosition); // Column G
    sheet.getRange(rowIndex, 11).setValue('Assigned'); // Column K
    
    // TODO: Send Line Notify to User 3
    // sendLineNotify("งาน " + id + " กำหนดจุดลงแล้ว: " + dropoffPosition + "\nเริ่มรับงานได้เลย");
    
    return { success: true };
  }
  throw new Error('Job not found');
}

/**
 * Step 3.1: User 3 Starts Work
 */
function startJob(id) {
  const sheet = getSheet(SHEET_JOBS);
  const rowIndex = findRowById(sheet, id);
  
  if (rowIndex > -1) {
    const startTime = new Date().toISOString();
    sheet.getRange(rowIndex, 8).setValue(startTime); // Column H
    sheet.getRange(rowIndex, 11).setValue('Picking'); // Column K
    return { success: true };
  }
  throw new Error('Job not found');
}

/**
 * Step 3.2: User 3 Completes Work & Uploads Photo
 */
function completeJob(id, photoUrl) {
  const sheet = getSheet(SHEET_JOBS);
  const rowIndex = findRowById(sheet, id);
  
  if (rowIndex > -1) {
    const endTime = new Date().toISOString();
    sheet.getRange(rowIndex, 9).setValue(endTime); // Column I
    sheet.getRange(rowIndex, 10).setValue(photoUrl); // Column J
    sheet.getRange(rowIndex, 11).setValue('Delivered'); // Column K
    
    // TODO: Send Line Notify back to User 2
    // sendLineNotify("งาน " + id + " ส่งสินค้าเรียบร้อยแล้ว\nรูปภาพ: " + photoUrl);
    
    return { success: true };
  }
  throw new Error('Job not found');
}

// --- Utilities ---

function getJobs() {
  const sheet = getSheet(SHEET_JOBS);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
}

function getJobDetails(id) {
  const jobs = getJobs();
  const job = jobs.find(j => j.id === id);
  if (!job) throw new Error('Job not found');
  return job;
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" not found. Please create it.');
  return sheet;
}

function findRowById(sheet, id) {
  const data = sheet.getRange("A:A").getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) return i + 1;
  }
  return -1;
}

function jsonResponse(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper to send Line Notify (Requires Token)
 */
function sendLineNotify(message) {
  if (!LINE_NOTIFY_TOKEN) {
    console.warn('LINE_NOTIFY_TOKEN is not set in Script Properties.');
    return;
  }
  const options = {
    'method': 'post',
    'headers': { 'Authorization': 'Bearer ' + LINE_NOTIFY_TOKEN },
    'payload': { 'message': message }
  };
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', options);
}
