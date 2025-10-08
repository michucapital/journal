// Crypto Trading Journal - Main JavaScript File
// This file handles all the app functionality: data storage, form handling, stats calculation, and CSV import/export

// ===== GLOBAL VARIABLES AND CONFIGURATION =====
class TradingJournal {
    constructor() {
        // Configuration
        this.STORAGE_KEY = 'tradingJournalData';
        this.NEXT_ID_KEY = 'tradingJournalNextId';
        this.CSV_HEADER = 'ID,Date,TradeSetup,RR,PnL,ActiveMgmt,Execution,Note';

        // Data arrays
        this.trades = [];
        this.nextId = 1;

        // Initialize the app
        this.init();
    }

    // ===== INITIALIZATION =====
    init() {
        console.log('Initializing Trading Journal...');

        // Load existing data from localStorage
        this.loadDataFromStorage();

        // Set up event listeners for all interactive elements
        this.setupEventListeners();

        // Update the display with current data
        this.updateDisplay();

        console.log('Trading Journal initialized successfully!');
    }

    // ===== DATA STORAGE FUNCTIONS =====

    // Load data from browser's localStorage
    loadDataFromStorage() {
        try {
            // Load trades array
            const storedTrades = localStorage.getItem(this.STORAGE_KEY);
            if (storedTrades) {
                this.trades = JSON.parse(storedTrades);
                console.log(`Loaded ${this.trades.length} trades from storage`);
            } else {
                this.trades = [];
                console.log('No existing trades found, starting fresh');
            }

            // Load next ID counter
            const storedNextId = localStorage.getItem(this.NEXT_ID_KEY);
            if (storedNextId) {
                this.nextId = parseInt(storedNextId);
            } else {
                // If no stored ID, calculate it from existing trades
                this.nextId = this.trades.length > 0 ? Math.max(...this.trades.map(t => t.id)) + 1 : 1;
            }

            console.log(`Next trade ID will be: ${this.nextId}`);
        } catch (error) {
            console.error('Error loading data from storage:', error);
            this.trades = [];
            this.nextId = 1;
        }
    }

    // Save data to browser's localStorage
    saveDataToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.trades));
            localStorage.setItem(this.NEXT_ID_KEY, this.nextId.toString());
            console.log(`Saved ${this.trades.length} trades to storage`);
        } catch (error) {
            console.error('Error saving data to storage:', error);
            this.showStatus('Error saving data to storage', 'error');
        }
    }

    // ===== EVENT LISTENERS SETUP =====
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('tradeForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTrade();
        });

        // R:R input validation (real-time)
        const rrInput = document.getElementById('rr');
        rrInput.addEventListener('input', () => {
            this.validateRRInput();
        });

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => {
            this.exportToCSV();
        });

        // Import file input
        const importFile = document.getElementById('importFile');
        importFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importFromCSV(e.target.files[0]);
                e.target.value = ''; // Clear file input
            }
        });

        // Clear all data button
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.addEventListener('click', () => {
            this.clearAllData();
        });
    }

    // ===== FORM VALIDATION =====
    validateRRInput() {
        const rrInput = document.getElementById('rr');
        const errorDiv = document.getElementById('rrError');
        const value = rrInput.value.trim();

        // R:R pattern: one or more digits, optional decimal, colon, then 1
        const pattern = /^\d+(\.\d+)?:1$/;

        if (value === '') {
            // Empty is okay (will be caught by required validation)
            rrInput.classList.remove('invalid', 'valid');
            errorDiv.classList.remove('show');
            return true;
        } else if (pattern.test(value)) {
            // Valid format
            rrInput.classList.remove('invalid');
            rrInput.classList.add('valid');
            errorDiv.classList.remove('show');
            return true;
        } else {
            // Invalid format
            rrInput.classList.remove('valid');
            rrInput.classList.add('invalid');
            errorDiv.textContent = 'Format must be X:1 (e.g., 1:1, 1.5:1, 2.3:1)';
            errorDiv.classList.add('show');
            return false;
        }
    }

    // ===== TRADE MANAGEMENT =====
    addTrade() {
        // Validate R:R format first
        if (!this.validateRRInput()) {
            this.showStatus('Please fix the R:R format before submitting', 'error');
            return;
        }

        // Get form data
        const formData = this.getFormData();

        // Validate required fields
        if (!this.validateFormData(formData)) {
            return;
        }

        // Create new trade object
        const newTrade = {
            id: this.nextId,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            tradeSetup: formData.tradeSetup,
            rr: formData.rr,
            pnl: parseFloat(formData.pnl),
            activeMgmt: formData.activeMgmt,
            execution: formData.execution,
            note: formData.note || ''
        };

        // Add to trades array
        this.trades.push(newTrade);
        this.nextId++;

        // Save to storage
        this.saveDataToStorage();

        // Update display
        this.updateDisplay();

        // Clear form
        this.clearForm();

        // Show success message
        this.showStatus(`Trade #${newTrade.id} added successfully!`, 'success');

        console.log('New trade added:', newTrade);
    }

    getFormData() {
        return {
            tradeSetup: document.getElementById('tradeSetup').value,
            rr: document.getElementById('rr').value.trim(),
            pnl: document.getElementById('pnl').value,
            activeMgmt: document.getElementById('activeMgmt').value,
            execution: document.getElementById('execution').value,
            note: document.getElementById('note').value.trim()
        };
    }

    validateFormData(formData) {
        const requiredFields = ['tradeSetup', 'rr', 'pnl', 'activeMgmt', 'execution'];

        for (const field of requiredFields) {
            if (!formData[field]) {
                this.showStatus(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`, 'error');
                return false;
            }
        }

        // Validate PnL is a number
        if (isNaN(parseFloat(formData.pnl))) {
            this.showStatus('PnL must be a valid number', 'error');
            return false;
        }

        return true;
    }

    clearForm() {
        document.getElementById('tradeForm').reset();

        // Remove validation classes
        const rrInput = document.getElementById('rr');
        rrInput.classList.remove('valid', 'invalid');
        document.getElementById('rrError').classList.remove('show');
    }

    // ===== DISPLAY UPDATES =====
    updateDisplay() {
        this.updateStatsDisplay();
        this.updateTradesTable();
    }

    updateStatsDisplay() {
        const stats = this.calculateStats();

        // Overall stats
        document.getElementById('totalPnl').textContent = this.formatCurrency(stats.overall.totalPnl);
        document.getElementById('totalPnl').className = `stat-value ${stats.overall.totalPnl >= 0 ? 'positive' : 'negative'}`;

        document.getElementById('totalTrades').textContent = stats.overall.totalTrades;
        document.getElementById('winRate').textContent = stats.overall.winRate + '%';
        document.getElementById('avgWin').textContent = this.formatCurrency(stats.overall.avgWin);
        document.getElementById('avgLoss').textContent = this.formatCurrency(stats.overall.avgLoss);

        // Scalp stats
        document.getElementById('scalpPnl').textContent = this.formatCurrency(stats.scalp.totalPnl);
        document.getElementById('scalpPnl').className = `stat-value ${stats.scalp.totalPnl >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('scalpTrades').textContent = stats.scalp.totalTrades;
        document.getElementById('scalpWinRate').textContent = stats.scalp.winRate + '%';

        // Swing stats
        document.getElementById('swingPnl').textContent = this.formatCurrency(stats.swing.totalPnl);
        document.getElementById('swingPnl').className = `stat-value ${stats.swing.totalPnl >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('swingTrades').textContent = stats.swing.totalTrades;
        document.getElementById('swingWinRate').textContent = stats.swing.winRate + '%';
    }

    calculateStats() {
        const allTrades = this.trades;
        const scalpTrades = allTrades.filter(t => t.tradeSetup.startsWith('Scalp:'));
        const swingTrades = allTrades.filter(t => t.tradeSetup.startsWith('Swing:'));

        return {
            overall: this.calculateStatsForTrades(allTrades),
            scalp: this.calculateStatsForTrades(scalpTrades),
            swing: this.calculateStatsForTrades(swingTrades)
        };
    }

    calculateStatsForTrades(trades) {
        if (trades.length === 0) {
            return {
                totalPnl: 0,
                totalTrades: 0,
                winRate: 0,
                avgWin: 0,
                avgLoss: 0
            };
        }

        const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
        const winningTrades = trades.filter(t => t.pnl > 0);
        const losingTrades = trades.filter(t => t.pnl < 0);

        const winRate = Math.round((winningTrades.length / trades.length) * 100);
        const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;

        return {
            totalPnl,
            totalTrades: trades.length,
            winRate,
            avgWin,
            avgLoss
        };
    }

    updateTradesTable() {
        const tbody = document.getElementById('tradesTableBody');
        const noTradesDiv = document.getElementById('noTrades');
        const table = document.getElementById('tradesTable');

        if (this.trades.length === 0) {
            table.style.display = 'none';
            noTradesDiv.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        noTradesDiv.style.display = 'none';

        // Sort trades by ID descending (newest first)
        const sortedTrades = [...this.trades].sort((a, b) => b.id - a.id);

        tbody.innerHTML = sortedTrades.map(trade => `
            <tr>
                <td>${trade.id}</td>
                <td>${trade.date}</td>
                <td>${trade.tradeSetup}</td>
                <td>${trade.rr}</td>
                <td class="${trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${this.formatCurrency(trade.pnl)}</td>
                <td>${trade.activeMgmt}</td>
                <td>${trade.execution}</td>
                <td>${trade.note}</td>
            </tr>
        `).join('');
    }

    // ===== CSV IMPORT/EXPORT =====
    exportToCSV() {
        if (this.trades.length === 0) {
            this.showStatus('No trades to export', 'error');
            return;
        }

        try {
            // Create CSV content
            let csvContent = this.CSV_HEADER + '\n';

            this.trades.forEach(trade => {
                // Escape notes that contain commas or quotes
                const escapedNote = this.escapeCSVField(trade.note);

                const row = [
                    trade.id,
                    trade.date,
                    trade.tradeSetup,
                    trade.rr,
                    trade.pnl,
                    trade.activeMgmt,
                    trade.execution,
                    escapedNote
                ].join(',');

                csvContent += row + '\n';
            });

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'trading_journal.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            this.showStatus(`Exported ${this.trades.length} trades to CSV`, 'success');
            console.log('CSV export completed');
        } catch (error) {
            console.error('Export error:', error);
            this.showStatus('Error exporting data', 'error');
        }
    }

    escapeCSVField(field) {
        if (field == null) return '';

        const stringField = String(field);

        // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
        if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
            return '"' + stringField.replace(/"/g, '""') + '"';
        }

        return stringField;
    }

    importFromCSV(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.processCSVData(e.target.result);
            } catch (error) {
                console.error('Import error:', error);
                this.showStatus('Error reading CSV file', 'error');
            }
        };

        reader.readAsText(file);
    }

    processCSVData(csvText) {
        const lines = csvText.trim().split('\n');

        if (lines.length < 2) {
            this.showStatus('CSV file appears to be empty', 'error');
            return;
        }

        // Validate header
        const header = lines[0].trim();
        if (header !== this.CSV_HEADER) {
            this.showStatus(`Invalid CSV header. Expected: ${this.CSV_HEADER}`, 'error');
            return;
        }

        const dataLines = lines.slice(1);
        let importedCount = 0;
        let skippedCount = 0;

        dataLines.forEach((line, index) => {
            if (line.trim() === '') return;

            try {
                const trade = this.parseCSVLine(line);
                if (trade) {
                    // Check for ID conflicts and reassign if necessary
                    if (this.trades.find(t => t.id === trade.id)) {
                        trade.id = this.nextId++;
                    }

                    this.trades.push(trade);

                    // Update nextId if imported ID is higher
                    if (trade.id >= this.nextId) {
                        this.nextId = trade.id + 1;
                    }

                    importedCount++;
                } else {
                    skippedCount++;
                }
            } catch (error) {
                console.error(`Error parsing line ${index + 2}:`, error);
                skippedCount++;
            }
        });

        // Save and update display
        this.saveDataToStorage();
        this.updateDisplay();

        this.showStatus(`Imported ${importedCount} trades. Skipped ${skippedCount} invalid rows.`, 'success');
        console.log(`Import completed: ${importedCount} imported, ${skippedCount} skipped`);
    }

    parseCSVLine(line) {
        // Simple CSV parser - handles quoted fields with commas
        const fields = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"' && (i === 0 || line[i-1] === ',')) {
                inQuotes = true;
            } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                fields.push(current.replace(/""/g, '"')); // Unescape quotes
                current = '';
            } else if (!(char === '"' && inQuotes && line[i+1] === '"')) {
                current += char;
            } else if (char === '"' && inQuotes && line[i+1] === '"') {
                current += char;
                i++; // Skip next quote
            }
        }
        fields.push(current.replace(/""/g, '"')); // Add last field

        if (fields.length !== 8) {
            console.error('Invalid number of fields:', fields.length);
            return null;
        }

        // Validate and create trade object
        const [id, date, tradeSetup, rr, pnl, activeMgmt, execution, note] = fields;

        // Basic validation
        if (!id || !date || !tradeSetup || !rr || !pnl || !activeMgmt || !execution) {
            console.error('Missing required fields');
            return null;
        }

        return {
            id: parseInt(id),
            date: date.trim(),
            tradeSetup: tradeSetup.trim(),
            rr: rr.trim(),
            pnl: parseFloat(pnl),
            activeMgmt: activeMgmt.trim(),
            execution: execution.trim(),
            note: note.trim()
        };
    }

    // ===== UTILITY FUNCTIONS =====
    clearAllData() {
        if (confirm('Are you sure you want to delete all trades? This cannot be undone.')) {
            this.trades = [];
            this.nextId = 1;
            this.saveDataToStorage();
            this.updateDisplay();
            this.showStatus('All data cleared', 'success');
            console.log('All data cleared');
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    showStatus(message, type = 'success') {
        const statusDiv = document.getElementById('importStatus');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusDiv.className = 'status-message';
        }, 5000);
    }
}

// ===== INITIALIZE APP WHEN PAGE LOADS =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Trading Journal...');
    window.tradingJournal = new TradingJournal();
});