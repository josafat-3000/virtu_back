import { S3Client } from '@aws-sdk/client-s3';

// Configura el cliente S3
const s3 = new S3Client({
  endpoint: 'http://localhost:8000', // URL de s3rver
  forcePathStyle: true, // Necesario para s3rver
  region: 'us-east-1', // Región para AWS SDK (puede ser cualquier región válida)
  credentials: {
    accessKeyId: 'S3RVER', // Clave de acceso ficticia
    secretAccessKey: 'S3RVER', // Clave secreta ficticia
  },
});

export default s3;
