const multer = require('multer');
const uuid = require('uuid');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueid = uuid.v4();
        const fileExtension = file.originalname.split('.').pop();
        const filename = `${uniqueid}.${fileExtension}`;
        cb(null,filename);
    }
})
module.exports = {uploadFiles: multer({storage: storage}).single('image')};
// export const uploadFiles = multer({ storage:storage }).single("image");