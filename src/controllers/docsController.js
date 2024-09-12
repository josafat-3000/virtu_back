// controllers/uploadController.js
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../../s3client.js'; // Importa el cliente S3 configurado

// Configura Multer para usar S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'test-bucket', // Nombre del bucket en s3rver
    acl: 'public-read', // Configura el acceso al archivo
    key: (req, file, cb) => {
      cb(null, file.originalname); // Nombre del archivo en el bucket
    }
  })
});

// Controlador para manejar la carga de archivos
export const uploadFile = (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).send(`Error uploading file: ${err.message}`);
    }
    res.send(`File uploaded successfully: ${req.file.location}`);
  });
};