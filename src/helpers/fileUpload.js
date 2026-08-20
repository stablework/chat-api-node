const multer  = require('multer')
const fs = require('fs');

const fileUpload = (path) => { 

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            let dest = `storage/${path}`;
            
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }

            cb(null, dest)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now()
            const originalname = file.originalname;
            const extension = originalname.split('.').pop();
            cb(null, originalname.replace(`.${extension}`, '') + '-' + uniqueSuffix + '.' + extension);
        }
    })
    
    return multer({ storage: storage })
}

module.exports = fileUpload