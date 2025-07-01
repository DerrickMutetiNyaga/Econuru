# CSV Import Guide for Client Management

## Overview
The CSV import feature allows you to bulk import client data into your system at `http://localhost:3000/admin/clients`. This guide explains how IDs are handled and how duplicate prevention works.

## 🔑 Key Features

### 1. **Smart ID Handling**
- **CSV ID Column is IGNORED**: Whatever ID format you have in your CSV (1, 2, 3 or CSV001, CSV002, etc.) is completely ignored
- **System Generates Unique IDs**: MongoDB automatically creates unique ObjectIDs for each new customer
- **No ID Conflicts**: You never have to worry about ID conflicts with existing customers

### 2. **Automatic Duplicate Prevention**
- **Duplicate Detection**: Based on phone number and email address
- **Auto-Skip Duplicates**: Existing customers are automatically skipped (not overwritten)
- **Detailed Reporting**: Shows exactly which records were skipped and why

## 📋 CSV Format Requirements

### Required Columns
- `ClientName` or `Client Name` - Customer's full name
- `ClientNo` or `Client No` - Phone number (used as primary identifier)

### Optional Columns
- `Email` - Customer's email address
- `ClientLocation` or `Client Location` - Customer's address
- `ID` - **IGNORED** (system generates its own IDs)

### Example CSV Format
```csv
ID,ClientName,ClientNo,Email,ClientLocation
CSV001,John Smith,+254712345678,john@email.com,Nairobi Kenya
CSV002,Mary Johnson,0722123456,mary@gmail.com,Karen Nairobi
```

## 🚀 How to Use

1. **Prepare Your CSV File**
   - Include the required columns (ClientName, ClientNo)
   - Add optional columns as needed
   - Don't worry about the ID column format

2. **Access the Import Feature**
   - Navigate to `http://localhost:3000/admin/clients`
   - Click the "Import CSV" button
   - Select your CSV file

3. **Preview and Import**
   - Review the preview of your data
   - Click "Import X Customers" to process
   - Review the results

## 📊 Import Results

After import, you'll see:
- ✅ **Imported**: Successfully added new customers
- ⚠️ **Skipped (Duplicates)**: Existing customers that were not added again
- ❌ **Errors**: Detailed list of any issues with specific rows

## 🔒 Duplicate Prevention Logic

The system prevents duplicates by checking:
1. **Primary Check**: Phone number (cleaned of spaces, dashes, parentheses)
2. **Secondary Check**: Email address (if provided)

If a customer already exists with the same phone OR email, the import will:
- Skip that record
- Show it in the "Skipped (Duplicates)" count
- Provide a detailed error message with the customer's name and phone

## 💡 Best Practices

1. **Clean Your Data**: Remove extra spaces, ensure phone numbers are properly formatted
2. **Test with Small Batches**: Start with a few records to verify the mapping
3. **Review Results**: Always check the import results for any skipped records
4. **Keep Original CSV**: In case you need to re-import or troubleshoot

## 📞 Sample Data

Two sample CSV files are provided:
- `sample-clients.csv` - Basic format with required fields
- `sample-clients-with-email.csv` - Extended format with email addresses

## 🔧 Technical Details

- **File Support**: CSV, Excel (.xlsx, .xls)
- **ID Generation**: MongoDB ObjectID (e.g., `507f1f77bcf86cd799439011`)
- **Phone Cleaning**: Removes spaces, dashes, parentheses for matching
- **Encoding**: UTF-8 supported
- **Max File Size**: Standard browser limits apply

## ❓ Troubleshooting

**Q: Why are some records being skipped?**
A: Records are skipped if they already exist (same phone/email) or are missing required fields.

**Q: Can I update existing customers?**
A: No, the import only adds new customers. Existing customers are skipped to prevent data loss.

**Q: What happens to my CSV ID column?**
A: It's completely ignored. The system generates its own unique database IDs.

**Q: How do I know which records were skipped?**
A: The results section shows a detailed list of all skipped records with reasons.

---

For technical support or questions, refer to the admin panel or contact your system administrator. 