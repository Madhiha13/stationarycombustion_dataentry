const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File to store data entries
const DATA_FILE = 'dataEntries.json';

// Function to read data entries from the file
const readDataEntries = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

// Function to write data entries to the file
const writeDataEntries = (entries) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf8');
};


// POST endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).send({ fileUrl });
  } else {
    res.status(400).send('No file uploaded');
  }
});


// POST endpoint for data entry
app.post('/dataentry', (req, res) => {
  const { year, month, facilityCode, facilityName, EmissionSource, fuelType, quantity, siUnits, fileUrl } = req.body;
  
  const newDataEntry = {
    year,
    month,
    facilityCode,
    facilityName,
    EmissionSource,
    fuelType,
    quantity,
    siUnits,
    fileUrl,
  };

  const dataEntries = readDataEntries();
  dataEntries.push(newDataEntry);
  writeDataEntries(dataEntries);

  res.status(200).send(newDataEntry);
});

// GET endpoint to fetch all data entries
app.get('/dataentry', (req, res) => {
  const dataEntries = readDataEntries();
  res.status(200).send(dataEntries);
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
console.log("your endpoint will be: http://localhost:5000/dataentry");