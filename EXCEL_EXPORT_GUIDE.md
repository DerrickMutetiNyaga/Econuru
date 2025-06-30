# Excel Export Guide - Admin Reports

## Overview
The admin reports page (`http://localhost:3000/admin/reports`) now includes a comprehensive Excel export feature that creates a multi-sheet workbook with detailed business data.

## Export Options

### 1. Export as Excel (Recommended)
**File Format:** `.xlsx`  
**Description:** Comprehensive report with multiple sheets containing complete lists and analytics

#### Excel Sheets Included:

##### Sheet 1: Summary
- Executive summary with key metrics
- Total revenue, orders, customers, expenses
- Net profit and profit margin calculations
- Unpaid orders summary
- Payment status breakdown
- Top 10 services overview

##### Sheet 2: All Expenses
- Complete list of every expense in the date range
- Columns: Date, Description, Category, Amount, Created Date, ID
- Total expenses summary at the top
- Sorted by date (newest first)

##### Sheet 3: All Income
- Complete list of every order/income in the date range
- Columns: Order Number, Customer Details, Status, Payment Status, Amounts, Services, Dates
- Total income summary at the top
- Shows gross revenue, pick & drop charges, discounts, net amounts
- Sorted by order date (newest first)

##### Sheet 4: Unpaid Laundry
- Complete list of all unpaid and partially paid orders
- Columns: Order details, Customer info, Payment status, Amounts due, Days pending, Priority
- Total unpaid amount summary at the top
- Priority levels: HIGH (>30 days), MEDIUM (>14 days), LOW (≤14 days)
- Sorted by days pending (highest first)

##### Sheet 5: Analytics
- Detailed business analytics and breakdowns
- Monthly revenue trends with pick & drop and discounts
- Order status distribution with revenue
- Expense category breakdown
- Top customers with spending analysis
- Service performance metrics

### 2. Export as CSV
**File Format:** `.csv`  
**Description:** Business summary report suitable for spreadsheet applications

### 3. Export as JSON
**File Format:** `.json`  
**Description:** Raw data export for developers and advanced analysis

## Key Features

### Unpaid Orders Tracking
- Shows all unpaid and partially paid orders
- Calculates total unpaid amount automatically
- Includes days pending for each order
- Priority classification for follow-up actions

### Complete Financial Picture
- All expenses listed individually with categories
- All income/orders with detailed breakdowns
- Pick & drop charges tracked separately
- Discount amounts clearly shown
- Net profit calculations

### Business Analytics
- Monthly trends and patterns
- Customer spending analysis
- Service performance metrics
- Payment status distributions

## How to Use

1. Go to **Admin → Reports** (`http://localhost:3000/admin/reports`)
2. Select your desired date range (7, 30, 90, or 365 days)
3. Click the **Export** dropdown button
4. Select **"Export as Excel (Complete Lists)"**
5. The Excel file will download automatically

## File Naming
Files are automatically named with the current date:
- Format: `econuru-comprehensive-report-YYYY-MM-DD.xlsx`
- Example: `econuru-comprehensive-report-2025-01-30.xlsx`

## Business Benefits

### For Accounting
- Complete expense tracking for tax purposes
- Income statements with detailed breakdowns
- Payment status for cash flow management

### For Operations
- Unpaid orders list for follow-up actions
- Service performance for inventory planning
- Customer analysis for retention strategies

### For Management
- Executive summary for quick decision making
- Profit margin analysis
- Trend identification and forecasting

## Data Accuracy
- All data is real-time from your MongoDB database
- Amounts are formatted in Kenyan Shillings (KES)
- Dates are formatted for Kenyan locale
- Calculations are performed server-side for accuracy

## Technical Notes
- Uses the `xlsx` library for reliable Excel file generation
- Multiple sheets provide organized data structure
- Responsive to date range selections
- Error handling for missing or invalid data
- Toast notifications confirm successful exports

## Troubleshooting

### If Export Fails
1. Ensure you're logged in as an admin
2. Wait for the reports to fully load before exporting
3. Check your browser's download settings
4. Refresh the page and try again

### Missing Data
- Check the selected date range
- Verify that data exists for the selected period
- Ensure proper admin permissions

## Future Enhancements
- Email delivery of reports
- Scheduled automatic exports
- Custom date range selection
- Additional analytics sheets
- Chart exports within Excel

---

**Note:** This Excel export feature provides the most comprehensive business reporting available in the Econuru admin system. 