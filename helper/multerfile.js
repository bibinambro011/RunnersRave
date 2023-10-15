const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/uploads'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  
  }
});

const upload = multer({ storage: storage });

const cropAndUpload = (req, res) => {
  // Check if a file is provided
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  // Define the desired crop dimensions (width, height)
  const width = 300;
  const height = 300;

  // Use Sharp to resize and crop the image
  sharp(req.file.path)
    .resize(width, height)
    .toBuffer()
    .then((buffer) => {
      // Upload the cropped image (buffer) to your desired location
      // Replace the upload logic here to save the cropped image

      // Example: Save the cropped image to a new file
      const croppedFilename = 'cropped-' + req.file.filename;
      const croppedFilePath = path.join('assets/uploads', croppedFilename);
      fs.writeFileSync(croppedFilePath, buffer);

      return res.json({ message: 'Image cropped and uploaded successfully', croppedFilePath });
    })
    .catch((error) => {
      return res.status(500).json({ error: 'Error cropping the image' });
    });
};

module.exports = { upload, cropAndUpload };
