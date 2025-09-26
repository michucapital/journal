# Crypto Trading Journal

A professional, lightweight web application for tracking crypto trading performance with a focus on process KPIs and disciplined execution.

## Features

### Core Functionality
- **Fast Trade Entry**: Streamlined form for rapid logging during active trading sessions
- **Persistent Storage**: All data saved locally in your browser (no external servers)
- **Real-time Statistics**: Automatic calculation of key performance metrics
- **CSV Export/Import**: Full data portability and backup capabilities
- **Process Tracking**: Focus on execution quality and active management decisions

### Trade Data Model
Each trade contains:
- **ID**: Auto-generated unique identifier
- **Date**: Automatically captured when trade is entered
- **Trade Setup**: Combined type and strategy code
  - Scalp: W (Wall Frontrun), T (Technical), V (Velodata)
  - Swing: PB (Pattern Break), N (Narrative), I (Inspired)
- **R:R Ratio**: Risk-to-reward ratio (format: X:1, e.g., 1.5:1)
- **PnL**: Profit/Loss in USD (positive or negative)
- **Active Management**: +EV (helpful), -EV (harmful), N/A (passive)
- **Execution Quality**: A (excellent), B (minor issues), C (mistakes made)
- **Notes**: Optional qualitative observations

### Statistics Dashboard
The app automatically calculates and displays:

**Overall Performance:**
- Total PnL (sum of all trades)
- Total trade count
- Win rate (percentage of profitable trades)
- Average win (mean profit of winning trades)
- Average loss (mean loss of losing trades)

**Separate Scalp vs Swing Analysis:**
- Individual PnL tracking
- Trade counts for each strategy type
- Win rates for scalp and swing approaches

## How to Use

### Adding Trades
1. Select your trade setup from the dropdown (Scalp: W/T/V or Swing: PB/N/I)
2. Enter the R:R ratio in X:1 format (e.g., 1.3:1)
3. Input your PnL in USD (use negative numbers for losses)
4. Rate your active management decisions (+EV, -EV, or N/A)
5. Assess your execution quality (A, B, or C)
6. Optionally add notes for context
7. Click "Add Trade"

The form will validate your input and clear automatically after successful submission.

### Data Management
- **Export CSV**: Download all your trades in a standardized format
- **Import CSV**: Upload previously exported data or migrate from other systems
- **Clear All Data**: Remove all trades (with confirmation prompt)

### Review and Analysis
- Monitor your statistics in real-time as you add trades
- Use the trade history table to review past performance
- Export data for external analysis or backup purposes
- Focus on process metrics (execution quality, active management effectiveness)

## CSV Schema

When exporting or importing data, the CSV format is:
```
ID,Date,TradeSetup,RR,PnL,ActiveMgmt,Execution,Note
```

### Field Specifications
- **ID**: Integer, unique identifier
- **Date**: YYYY-MM-DD format
- **TradeSetup**: Exact text from dropdown options
- **RR**: Text in X:1 format (e.g., "1.5:1")
- **PnL**: Numeric value (positive or negative)
- **ActiveMgmt**: One of "+EV", "-EV", "N/A"
- **Execution**: One of "A", "B", "C"
- **Note**: Text (commas and quotes automatically escaped)

### Import Guidelines
- Ensure your CSV has the exact header row shown above
- Required fields: ID, Date, TradeSetup, RR, PnL, ActiveMgmt, Execution
- Notes field is optional (can be empty)
- If imported trade IDs conflict with existing data, new IDs will be automatically assigned
- Invalid rows will be skipped with a summary report

## Technical Details

### Browser Compatibility
- Modern browsers with localStorage support
- Chrome, Firefox, Safari, Edge (recent versions)
- Responsive design works on desktop, tablet, and mobile

### Data Storage
- All data stored locally using browser localStorage
- No external servers or accounts required
- Data persists between browser sessions
- Clearing browser data will remove all trades

### Security and Privacy
- No data transmitted over the internet
- All processing happens locally in your browser
- No tracking, analytics, or external dependencies
- Your trading data remains completely private

## Business Logic Notes

### Execution Quality Codes
- **A**: Trade was well-planned and executed flawlessly according to your process
- **B**: Minor execution or planning issues that didn't significantly impact the trade
- **C**: Notable mistakes occurred (sizing errors, emotional decisions, poor timing)

### Active Management Assessment
- **+EV**: Your active management decisions (early exit, adding size, etc.) were beneficial
- **-EV**: Active management decisions hurt the trade outcome
- **N/A**: Trade was managed passively according to original plan

### Setup Code Meanings
**Scalp Setups:**
- **W (Wall Frontrun)**: Order book wall-based entries with microstructure edge
- **T (Technical)**: Technical confluence trades (support/resistance, patterns, indicators)
- **V (Velodata)**: Trades based on options flow, funding rates, or liquidation data

**Swing Setups:**
- **PB (Pattern Break)**: Higher timeframe pattern breakouts with structural significance
- **N (Narrative)**: Early-phase trades based on fundamental narratives or sector rotation
- **I (Inspired)**: Trades influenced by respected traders but independently validated

## Weekly Review Protocol

### Recommended Review Process (Every 10-25 trades)
1. **Calculate Performance Metrics**
   - Win rate for scalps vs swings
   - Average win/loss ratios
   - Net PnL by setup type
   - Active vs passive management impact

2. **Analyze Execution Quality**
   - Percentage of A-grade executions
   - Correlation between execution grade and PnL
   - Identify patterns in B and C-grade trades

3. **Process Improvement**
   - Set one behavioral target for next review period
   - Focus on adherence to sizing rules and time-of-day filters
   - Track improvement in execution consistency

4. **Setup Performance Analysis**
   - Compare individual setup codes (W, T, V, PB, N, I)
   - Identify highest and lowest performing strategies
   - Adjust focus based on statistical significance

### Sample Size Guidelines
- Minimum 100 scalp trades before drawing statistical conclusions
- Minimum 10 swing trades for initial assessment
- Focus on process adherence over short-term outcome metrics

## Troubleshooting

### Common Issues
- **Trades disappearing**: Check if browser is clearing localStorage
- **Export not working**: Ensure browser allows file downloads
- **Import failing**: Verify CSV header format matches exactly
- **Form not submitting**: Check R:R format is X:1 (numbers only)

### Data Recovery
- Export data regularly as backup
- Browser incognito/private mode may not persist data
- Clearing browser data will remove all trades permanently

## Files Included
- `index.html` - Main application structure
- `styles.css` - Professional dark theme styling
- `script.js` - Complete application functionality
- `README.md` - This documentation file

## Deployment
This is a client-side only application. Simply upload all files to any web hosting service (Vercel, Netlify, GitHub Pages, etc.) and open index.html in your browser.