app.use(express.static('public'));
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const db = new sqlite3.Database('./mymovies.db'); // This will create a file

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    year TEXT,
    genre TEXT,
    description TEXT,
    videoUrl TEXT,
    imageUrl TEXT
)`);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'video') cb(null, 'uploads/videos/');
        else if (file.fieldname === 'image') cb(null, 'uploads/images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const upload = multer({ storage: storage });

// Upload endpoint
app.post('/api/upload', upload.fields([{ name: 'video' }, { name: 'image' }]), (req, res) => {
    const { title, year, genre, description } = req.body;
    const videoPath = req.files['video'][0].path.replace(/\\/g, '/');
    const imagePath = req.files['image'][0].path.replace(/\\/g, '/');
    db.run(
        'INSERT INTO movies (title, year, genre, description, videoUrl, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
        [title, year, genre, description, videoPath, imagePath],
        function(err) {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Get all movies
app.get('/api/movies', (req, res) => {
    db.all('SELECT * FROM movies', (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
});
// ...existing code...

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});