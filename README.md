# Monday.com to Google Sheets Exporter

This Google Apps Script fetches items from a specified Monday.com board, including their column values, and exports them to a Google Sheet. It supports pagination to handle boards with a large number of items. Users can specify which columns to display in the Google Sheet.

## Features

- Fetches all items from a specified Monday.com board.
- Handles pagination for large boards.
- Exports items and their column values to a Google Sheet.
- Allows users to specify which columns to display.

## Prerequisites

- A Monday.com API Key.
- A Google Sheet to export the data.

## Installation

1. **Set Up Google Apps Script:**
   - Open your Google Sheet.
   - Go to `Extensions` > `Apps Script`.
   - Delete any code in the script editor and paste the provided script code.

2. **Configure Script:**
   - Replace `MONDAY_API_KEY` with your Monday.com API key.
   - Replace `SHEET_ID` with the ID of your Google Sheet.
   - Update `DISPLAY_COLUMNS` to include the column titles you want to display in the Google Sheet.

3. **Deploy Web App:**
   - Click on `Deploy` > `New deployment`.
   - Select `Web app`.
   - Set `Who has access` to `Anyone`.

4. **Set Up Monday.com Webhook:**
   - Create a webhook in Monday.com to trigger the Google Apps Script.

## Usage

1. **Fetch and Export Data:**
   - The script will fetch data from the specified Monday.com board and export it to the Google Sheet whenever the webhook is triggered.
