const multer = require("multer");
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination : (request, file, callback) => {
        const destinationPath = path.join(__dirname, '../public/{ tableName }');
        if (!fs.existsSync(destinationPath)) fs.mkdirSync(destinationPath, { recursive: true });
        callback(null, destinationPath);
    },
    filename : (request, file, callback) => {
        callback(null, Date.now() + path.extname(file.originalname))
    }
});

{ imageString }