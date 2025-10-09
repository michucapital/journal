// Crypto Trading Journal - Main JavaScript File
class TradingJournal {
    constructor() {
        this.STORAGE_KEY = 'tradingJournalData';
        this.NEXT_ID_KEY = 'tradingJournalNextId';
        this.CSV_HEADER = 'ID,Date,TradeSetup,RR,PnL,ActiveMgmt,Execution,Note';
        this.editId = null;
        this.trades = [];
        this.nextId = 1;
        this.init();
    }

    init() {
        this.loadDataFromStorage();
        this.setupEventListeners();
        this.updateDisplay();
    }

    loadDataFromStorage() {
        try {
            const storedTrades = localStorage.getItem(this.STORAGE_KEY);
            this.trades = storedTrades ? JSON.parse(storedTrades) : [];
            const storedNextId = localStorage.getItem(this.NEXT_ID_KEY);
            this.nextId = storedNextId ? parseInt(storedNextId) : (this.trades.length > 0 ? Math.max(...this.trades.map(t => t.id)) + 1 : 1);
        } catch (error) {
            this.trades = [];
            this.nextId = 1;
        }
    }

    loadTradeForEdit(id) {
        const trade = this.trades.find(t => t.id === id);
        if (!trade) return this.showStatus('Selected trade not found', 'error');
        this.editId = id;
        document.getElementById('tradeSetup').value = trade.tradeSetup;
        document.getElementById('rr').value = trade.rr;
        document.getElementById('pnl').value = trade.pnl;
        document.getElementById('activeMgmt').value = trade.activeMgmt;
        document.getElementById('execution').value = trade.execution;
        document.getElementById('note').value = trade.note;
        document.getElementById('ticker').value = trade.ticker || '';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        document.querySelector('.submit-btn').textContent = 'Update Trade';
    }

    cancelEdit() {
        this.editId = null;
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.querySelector('.submit-btn').textContent = 'Add Trade';
        this.clearForm();
        this.showStatus('Edit cancelled, new trades will be added', 'info');
    }

    saveDataToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.trades));
            localStorage.setItem(this.NEXT_ID_KEY, this.nextId.toString());
        } catch (error) {
            this.showStatus('Error saving data to storage', 'error');
        }
    }

    getFormData() {
        return {
            tradeSetup: document.getElementById('tradeSetup').value,
            ticker: document.getElementById('ticker').value.trim(),
            rr: document.getElementById('rr').value.trim(),
            pnl: document.getElementById('pnl').value,
            activeMgmt: document.getElementById('activeMgmt').value.trim(), // Now raw string
            execution: document.getElementById('execution').value,
            note: document.getElementById('note').value.trim(),
        };
    }

    validateFormData(formData) {
        const requiredFields = ['tradeSetup', 'ticker', 'rr', 'pnl', 'activeMgmt', 'execution'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                this.showStatus(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`, 'error');
                return false;
            }
        }
        if (isNaN(parseFloat(formData.pnl))) {
            this.showStatus('PnL must be a valid number', 'error');
            return false;
        }
        // Accept any input for ActiveMgmt (number or N/A)
        return true;
    }

    setupEventListeners() {
        document.getElementById('tradeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTrade();
        });
        document.getElementById('rr').addEventListener('input', () => {
            this.validateRRInput();
        });
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });
        document.getElementById('importFile').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importFromCSV(e.target.files[0]);
                e.target.value = '';
            }
        });
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.cancelEdit();
        });
        document.getElementById('tradesTableBody').addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('edit-btn')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                this.loadTradeForEdit(id);
            }
            if (e.target && e.target.classList.contains('delete-btn')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                this.deleteTrade(id);
            }
        });
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllData();
        });
    }

    validateRRInput() {
        const rrInput = document.getElementById('rr');
        const errorDiv = document.getElementById('rrError');
        const value = rrInput.value.trim();
        const pattern = /^\d+(\.\d+)?:1$/;
        if (value === '') {
            rrInput.classList.remove('invalid', 'valid');
            errorDiv.classList.remove('show');
            return true;
        } else if (pattern.test(value)) {
            rrInput.classList.remove('invalid');
            rrInput.classList.add('valid');
            errorDiv.classList.remove('show');
            return true;
        } else {
            rrInput.classList.remove('valid');
            rrInput.classList.add('invalid');
            errorDiv.textContent = 'Format must be X:1 (e.g., 1:1, 1.5:1, 2.3:1)';
            errorDiv.classList.add('show');
            return false;
        }
    }

    addTrade() {
        if (!this.validateRRInput()) {
            this.showStatus('Please fix the R:R format before submitting', 'error');
            return;
        }
        const formData = this.getFormData();
        if (!this.validateFormData(formData)) return;
        if (this.editId !== null) {
            const tradeIndex = this.trades.findIndex(t => t.id === this.editId);
            if (tradeIndex === -1) return this.showStatus('Error updating trade: not found', 'error');
            this.trades[tradeIndex] = {
                id: this.editId,
                date: this.trades[tradeIndex].date,
                tradeSetup: formData.tradeSetup,
                ticker: formData.ticker,
                rr: formData.rr,
                pnl: parseFloat(formData.pnl),
                activeMgmt: formData.activeMgmt, // raw value, can be number or N/A
                execution: formData.execution,
                note: formData.note || '',
            };
            this.showStatus(`Trade #${this.editId} updated successfully!`, 'success');
            this.editId = null;
            document.querySelector('.submit-btn').textContent = 'Add Trade';
            document.getElementById('cancelEditBtn').style.display = 'none';
        } else {
            const newTrade = {
                id: this.nextId,
                date: new Date().toISOString().split('T')[0],
                tradeSetup: formData.tradeSetup,
                ticker: formData.ticker,
                rr: formData.rr,
                pnl: parseFloat(formData.pnl),
                activeMgmt: formData.activeMgmt, // raw value, can be number or N/A
                execution: formData.execution,
                note: formData.note || '',
            };
            this.trades.push(newTrade);
            this.nextId++;
            this.showStatus(`Trade #${newTrade.id} added successfully!`, 'success');
        }
        this.saveDataToStorage();
        this.updateDisplay();
        this.clearForm();
    }

    deleteTrade(id) {
        const index = this.trades.findIndex(t => t.id === id);
        if (index !== -1) {
            if (confirm(`Delete trade #${id}? This cannot be undone.`)) {
                this.trades.splice(index, 1);
                this.saveDataToStorage();
                this.updateDisplay();
                this.showStatus(`Trade #${id} deleted.`, 'success');
            }
        } else {
            this.showStatus('Trade not found for deletion.', 'error');
        }
    }

    updateDisplay() {
        this.updateStatsDisplay();
        this.updateTradesTable();
    }

    updateStatsDisplay() {
        const stats = this.calculateStats();
        document.getElementById('totalPnl').textContent = this.formatCurrency(stats.overall.totalPnl);
        document.getElementById('totalPnl').className = `stat-value ${stats.overall.totalPnl >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('totalTrades').textContent = stats.overall.totalTrades;
        document.getElementById('winRate').textContent = stats.overall.winRate + '%';
        document.getElementById('avgWin').textContent = this.formatCurrency(stats.overall.avgWin);
        document.getElementById('avgLoss').textContent = this.formatCurrency(stats.overall.avgLoss);
        document.getElementById('scalpPnl').textContent = this.formatCurrency(stats.scalp.totalPnl);
        document.getElementById('scalpPnl').className = `stat-value ${stats.scalp.totalPnl >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('scalpTrades').textContent = stats.scalp.totalTrades;
        document.getElementById('scalpWinRate').textContent = stats.scalp.winRate + '%';
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
        const sortedTrades = [...this.trades].sort((a, b) => b.id - a.id);
        tbody.innerHTML = sortedTrades.map(trade => `
          <tr>
            <td>${trade.id}</td>
            <td>${trade.date}</td>
            <td>${trade.ticker || ''}</td>
            <td>${trade.tradeSetup}</td>
            <td>${trade.rr}</td>
            <td class="${trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${this.formatCurrency(trade.pnl)}</td>
            <td>${trade.activeMgmt}</td>
            <td>${trade.execution}</td>
            <td>${trade.note}</td>
            <td>
                <button class="edit-btn" data-id="${trade.id}">Edit</button>
                <button class="delete-btn" data-id="${trade.id}">Delete</button>
            </td>
          </tr>
        `).join('');
    }

    exportToCSV() {
        if (this.trades.length === 0) {
            this.showStatus('No trades to export', 'error');
            return;
        }
        try {
            let csvContent = this.CSV_HEADER + '\n';
            this.trades.forEach(trade => {
                const escapedNote = this.escapeCSVField(trade.note);
                const row = [
                    trade.id,
                    trade.date,
                    trade.tradeSetup,
                    trade.rr,
                    trade.pnl,
                    this.escapeCSVField(trade.activeMgmt),
                    trade.execution,
                    escapedNote
                ].join(',');
                csvContent += row + '\n';
            });
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
        } catch (error) {
            this.showStatus('Error exporting data', 'error');
        }
    }

    escapeCSVField(field) {
        if (field == null) return '';
        const stringField = String(field);
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
                    if (this.trades.find(t => t.id === trade.id)) {
                        trade.id = this.nextId++;
                    }
                    this.trades.push(trade);
                    if (trade.id >= this.nextId) {
                        this.nextId = trade.id + 1;
                    }
                    importedCount++;
                } else {
                    skippedCount++;
                }
            } catch (error) {
                skippedCount++;
            }
        });
        this.saveDataToStorage();
        this.updateDisplay();
        this.showStatus(`Imported ${importedCount} trades. Skipped ${skippedCount} invalid rows.`, 'success');
    }

    parseCSVLine(line) {
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
                fields.push(current.replace(/""/g, '"'));
                current = '';
            } else if (!(char === '"' && inQuotes && line[i+1] === '"')) {
                current += char;
            } else if (char === '"' && inQuotes && line[i+1] === '"') {
                current += char;
                i++;
            }
        }
        fields.push(current.replace(/""/g, '"'));
        if (fields.length !== 8) {
            return null;
        }
        const [id, date, tradeSetup, rr, pnl, activeMgmt, execution, note] = fields;
        if (!id || !date || !tradeSetup || !rr || !pnl || !activeMgmt || !execution) {
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

    clearAllData() {
        if (confirm('Are you sure you want to delete all trades? This cannot be undone.')) {
            this.trades = [];
            this.nextId = 1;
            this.saveDataToStorage();
            this.updateDisplay();
            this.showStatus('All data cleared', 'success');
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
        setTimeout(() => {
            statusDiv.className = 'status-message';
        }, 5000);
    }

    clearForm() {
        document.getElementById('tradeSetup').value = '';
        document.getElementById('rr').value = '';
        document.getElementById('pnl').value = '';
        document.getElementById('activeMgmt').value = '';
        document.getElementById('execution').value = '';
        document.getElementById('note').value = '';
        document.getElementById('ticker').value = '';
        document.getElementById('rrError').textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tradingJournal = new TradingJournal();
});
