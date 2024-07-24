const MONDAY_API_KEY = 'your MONDAY_API_KEY';'
const SHEET_ID = 'your SHEET_ID'; // Replace with your Google Sheet ID

const DISPLAY_COLUMNS = [/*list of columns to be displayed*/];


/**
 * Fetches items from the specified board on Monday.com.
 * @param {string} boardId - The ID of the board to fetch items from.
 * @returns {Object|null} The board data including items and columns or null if there's an error.
 */
function fetchBoardItems(boardId) {
  const url = 'https://api.monday.com/v2';
  let cursor = null;
  let allItems = [];
  let columns = [];
  let boardName = '';

  const fetchItemsQuery = (cursor) => `
    query {
      boards(ids: ${boardId}) {
        name
        columns {
          id
          title
        }
        items_page${cursor ? `(cursor: "${cursor}")` : ''} {
          cursor
          items {
            id
            name
            column_values {
              id
              text
            }
          }
        }
      }
    }
  `;

  do {
    const query = fetchItemsQuery(cursor);
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MONDAY_API_KEY}`,
      },
      payload: JSON.stringify({ query: query })
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const responseText = response.getContentText();
      Logger.log(responseText);

      const json = JSON.parse(responseText);
      if (json.errors) {
        Logger.log(`Error fetching items: ${JSON.stringify(json.errors)}`);
        return null;
      }

      const boardData = json.data.boards[0];
      if (!boardName) {
        boardName = boardData.name;
      }
      if (columns.length === 0) {
        columns = boardData.columns;
      }
      allItems = allItems.concat(boardData.items_page.items);
      cursor = boardData.items_page.cursor;
    } catch (error) {
      Logger.log('Error fetching items: ' + error.message);
      return null;
    }
  } while (cursor);

  return {
    name: boardName,
    columns: columns,
    items: allItems
  };
}

/**
 * Adds the items from the specified board to the Google Sheet.
 */
function addBoardItemsToSheet(boardId) {
  const boardData = fetchBoardItems(boardId);
  if (!boardData) {
    Logger.log('No board data available.');
    return;
  }

  const { name, columns, items } = boardData;

  // Create a map for quick lookup of column titles
  const columnMap = {};
  columns.forEach(column => {
    columnMap[column.id] = column.title;
  });

  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    Logger.log(`Sheet "${name}" not found. Creating it...`);
    sheet = spreadsheet.insertSheet(name);
  } else {
    sheet.clearContents();
  }

  // Filter columns to display based on DISPLAY_COLUMNS
  const filteredColumns = columns.filter(col => DISPLAY_COLUMNS.includes(col.title));

  // Create headers
  const headers = DISPLAY_COLUMNS;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Prepare data to be written to the sheet
  const data = items.map(item => [
    item.name,  // Product name
    ...filteredColumns.map(col => {
      const columnValue = item.column_values.find(cv => cv.id === col.id);
      return columnValue ? columnValue.text : '';
    })
  ]);

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  Logger.log(`Added ${data.length} items to the sheet.`);
}

/**
 * Handles the POST request from the webhook.
 */
function doPost(e) {
  const jsonString = e.postData.contents;
  const data = JSON.parse(jsonString);
  Logger.log('Received payload: ' + JSON.stringify(data));

  // Verify webhook challenge
  if (data.challenge) {
    return ContentService.createTextOutput(JSON.stringify({ challenge: data.challenge }))
                          .setMimeType(ContentService.MimeType.JSON);
  }

  const boardId = data.event.boardId;
  addBoardItemsToSheet(boardId);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
                        .setMimeType(ContentService.MimeType.JSON);
}