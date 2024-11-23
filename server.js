const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

let codes = require('./db.json');

// Validate and mark code as used
app.post('/validate-code', (req, res) => {
    const { code } = req.body;

    const codeEntry = codes.find(entry => entry.code === code);

    if (!codeEntry) {
        return res.status(404).json({ valid: false, error: 'Code not found' });
    }

    if (codeEntry.used) {
        return res.status(400).json({ valid: false, error: 'Code already used' });
    }

    codeEntry.used = true;
    fs.writeFileSync('./db.json', JSON.stringify(codes, null, 2));
    res.json({ valid: true });
});

// Admin endpoint to get stats
app.get('/admin/stats', (req, res) => {
    const usedCount = codes.filter(c => c.used).length;
    const unusedCount = codes.length - usedCount;
    res.json({ total: codes.length, used: usedCount, unused: unusedCount });
});

// Admin endpoint to add a code
app.post('/admin/add-code', (req, res) => {
    const { code } = req.body;
    if (!code || codes.some(c => c.code === code)) {
        return res.status(400).json({ error: 'Invalid or duplicate code' });
    }

    codes.push({ code, used: false });
    fs.writeFileSync('./db.json', JSON.stringify(codes, null, 2));
    res.json({ success: true, message: 'Code added' });
});

// Admin endpoint to delete a code
app.delete('/admin/delete-code', (req, res) => {
    const { code } = req.body;
    codes = codes.filter(c => c.code !== code);
    fs.writeFileSync('./db.json', JSON.stringify(codes, null, 2));
    res.json({ success: true, message: 'Code deleted' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});