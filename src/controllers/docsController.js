import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import fsPromise from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { sendDigestPost, sendDigestPostFormData } from "../utils/digest.js";
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const linkId = req.params.linkId; // obtenemos el token (linkId) de los parámetros de la ruta
    const folderPath = path.join('uploads', linkId); // ruta de la carpeta con el token

    // Creamos la carpeta si no existe
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true }); // creamos la carpeta recursivamente si es necesario
    }

    cb(null, folderPath); // pasamos la carpeta de destino a Multer
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`); // nombre del archivo con timestamp y nombre original
  }
});

// Configuración de Multer para múltiples archivos
const upload = multer({ storage }).fields([
  { name: 'file1', maxCount: 1 },
  { name: 'file2', maxCount: 1 }
]);

export const uploadFile = async (req, res) => {
  const { linkId } = req.params;

  try {
    const link = await prisma.uploadLink.findUnique({ where: { id: linkId } });

    if (!link) {
      return res.status(404).json({ error: "Link no encontrado." });
    }

    if (link.used) {
      return res.status(403).json({ error: "Este link ya ha sido utilizado o cancelado." });
    }

    upload(req, res, async function (err) {
      if (err) {
        return res.status(500).json({ error: "Error al subir archivos", err });
      }

      const file1 = req.files['file1']?.[0];
      const file2 = req.files['file2']?.[0];

      if (!file1 || !file2) {
        return res.status(400).json({ error: "Ambos archivos son obligatorios." });
      }

      const employeeNo = uuidv4();
      const { beginTime, endTime, visitId } = req.body;

      // filePath guarda solo la carpeta
      const folderPath = path.join('uploads', linkId);

      await prisma.uploadLink.update({
        where: { id: linkId },
        data: {
          used: true,
          filePath: folderPath,
          employeeNo,
          beginTime: beginTime ? new Date(beginTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          visitId: visitId ? Number(visitId) : undefined
        },
      });

      return res.status(200).json({
        message: 'Proceso completado con éxito.',
        employeeNo,
        beginTime,
        endTime,
        visitId,
        filesUploaded: 2
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error del servidor." });
  }
};

export const validateLink = async (req, res) => {
  const { linkId } = req.params;
  console.log("Validando linkId:", linkId);
  try {
    const link = await prisma.uploadLink.findUnique({
      where: { id: linkId },
      include: { visit: true }
    });

    if (!link || link.validated) {
      return res.status(400).json({ error: "Link inválido o ya usado." });
    }

    // Marcar el link como validado
    await prisma.uploadLink.update({
      where: { id: linkId },
      data: { validated: true },
    });

    // Si el link está asociado a una visita, marcar la visita como validada
    if (link.visitId) {
      await prisma.visits.update({
        where: { id: link.visitId },
        data: { validated: true }
      });
    }

    let hikvisionUserResponse = null;
    let hikvisionFaceResponse = null;

    // Crear usuario en Hikvision después de validar
    try {
      const employeeNo = link.employeeNo || `VIS-${link.visitId}`;
      const name = link.visit?.visitor_name || "Visitante";
      const beginTime = link.beginTime?.toISOString() || new Date().toISOString();
      const endTime = link.endTime?.toISOString() || new Date(Date.now() + 24*60*60*1000).toISOString();

      const uri = `/ISAPI/AccessControl/UserInfo/Record?format=json&devIndex=${process.env.HIKVISION_DEVICE_INDEX}`;
      const url = process.env.HIKVISION_BASE_URL + uri;

      const bodyData = {
        UserInfo: [
          {
            employeeNo,
            name,
            userType: "visitor",
            maxOpenDoorTime: 3,
            Valid: {
              enable: true,
              beginTime,
              endTime,
              timeType: "local"
            }
          }
        ]
      };

      hikvisionUserResponse = await sendDigestPost({
        username: process.env.HIKVISION_USERNAME,
        password: process.env.HIKVISION_PASSWORD,
        method: "POST",
        uri,
        url,
        bodyData
      });

      console.log(`Usuario visitante ${employeeNo} creado en Hikvision exitosamente.`);

      // Vincular foto (captura_2 es la cara/selfie)
      try {
        // Buscar archivos con patrón captura_2
        const files = fs.readdirSync(link.filePath);
        const faceFile = files.find(f => f.includes('captura_2'));

        if (faceFile) {
          const faceImagePath = path.join(link.filePath, faceFile);

          if (fs.existsSync(faceImagePath)) {
            const imageBuffer = fs.readFileSync(faceImagePath);
            const imageName = faceFile;

            const faceUri = `/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json&devIndex=${process.env.HIKVISION_DEVICE_INDEX}`;
            const faceUrl = process.env.HIKVISION_BASE_URL + faceUri;

            const jsonData = {
              employeeNo
            };

            hikvisionFaceResponse = await sendDigestPostFormData({
              username: process.env.HIKVISION_USERNAME,
              password: process.env.HIKVISION_PASSWORD,
              method: "POST",
              uri: faceUri,
              url: faceUrl,
              jsonData,
              imageBuffer,
              imageName
            });

            console.log(`Foto de rostro ${imageName} vinculada a ${employeeNo} exitosamente.`);
          }
        }
      } catch (faceError) {
        console.error("Error vinculando foto:", faceError.message);
      }

    } catch (hikvisionError) {
      console.error("Error en Hikvision:", hikvisionError.message);
    }

    res.status(200).json({
      message: "Link validado correctamente, usuario registrado en Hikvision.",
      hikvisionUser: hikvisionUserResponse ? "Creado" : "Error o no disponible",
      hikvisionFace: hikvisionFaceResponse ? "Vinculada" : "No vinculada"
    });
  } catch (error) {
    console.error("Error al validar:", error);
    res.status(500).json({ error: "Error al validar el link." });
  }
};

export const cancelLink = async (req, res) => {
  const { linkId } = req.params;

  try {
    const link = await prisma.uploadLink.findUnique({ where: { id: linkId } });

    if (!link || link.used) {
      return res.status(400).json({ error: "Link inválido o ya usado." });
    }

    await prisma.uploadLink.update({
      where: { id: linkId },
      data: { used: true },
    });

    res.status(200).json({ message: "Link cancelado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar el link." });
  }
};

export const verifyToken = async (req, res) => {
  const { token } = req.params;  // Obtenemos el token desde los parámetros de la URL
  try {
    // Buscar el linkId en la base de datos
    const tokenRecord = await prisma.uploadLink.findUnique({
      where: { id: token },
    });

    // Si el token no existe
    if (!tokenRecord) {
      return res.status(404).json({ message: 'Token no encontrado' });
    }

    // Verificar si el token ya ha sido utilizado
    if (tokenRecord.used) {
      return res.status(200).json({ message: 'Este token ya ha sido utilizado', used: true });
    }

    // Si el token es válido y no ha sido usado
    return res.status(200).json({ message: 'Token válido', used: false });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al verificar el token' });
  }
};

export const urlUploads = async (req, res) =>{
  try {
    const uploads = await prisma.uploadLink.findMany({
      where: { createdById: req.user.id },
      include: {
        visit: true, // Incluye la relación con visitas si es necesario
      },
    });
    res.json(uploads)
  } catch (error){
    console.error(error);
    return res.status(500).json({message: "Error al obtener urls"})
  }
}

export const getAllImages = async (req, res) => {
  try {
    const { folder } = req.params;
    const dirPath = path.join(process.cwd(), 'uploads', folder);

    const files = await fsPromise.readdir(dirPath);

    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });

    const images = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const data = await fsPromise.readFile(filePath);
        const base64 = `data:image/${path.extname(file).slice(1)};base64,${data.toString('base64')}`;
        return {
          name: file,
          base64
        };
      })
    );

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'Error al obtener las imágenes' });
  }
};

export const createHikvisionUser = async (req, res) => {
  try {
    const { visitId } = req.body;

    if (!visitId) {
      return res.status(400).json({ error: "visitId es requerido." });
    }

    // Fetch visit and upload link data
    const uploadLink = await prisma.uploadLink.findFirst({
      where: { visitId: Number(visitId) },
      include: { visit: true }
    });

    if (!uploadLink) {
      return res.status(404).json({ error: "No se encontró el registro de carga para esta visita." });
    }

    if (!uploadLink.visit) {
      return res.status(404).json({ error: "Visita no encontrada." });
    }

    const visit = uploadLink.visit;
    const employeeNo = uploadLink.employeeNo || `VIS-${visitId}`;
    const name = visit.visitor_name;
    const beginTime = uploadLink.beginTime?.toISOString() || new Date().toISOString();
    const endTime = uploadLink.endTime?.toISOString() || new Date(Date.now() + 24*60*60*1000).toISOString();

    const uri = `/ISAPI/AccessControl/UserInfo/Record?format=json&devIndex=${process.env.HIKVISION_DEVICE_INDEX}`;
    const url = process.env.HIKVISION_BASE_URL + uri;

    const bodyData = {
      UserInfo: [
        {
          employeeNo,
          name,
          userType: "visitor",
          maxOpenDoorTime: 3,
          Valid: {
            enable: true,
            beginTime,
            endTime,
            timeType: "local"
          }
        }
      ]
    };

    const response = await sendDigestPost({
      username: process.env.HIKVISION_USERNAME,
      password: process.env.HIKVISION_PASSWORD,
      method: "POST",
      uri,
      url,
      bodyData
    });

    // Update uploadLink with Hikvision status
    await prisma.uploadLink.update({
      where: { id: uploadLink.id },
      data: { validated: true }
    });

    res.status(200).json({
      message: "Usuario visitante creado en Hikvision exitosamente.",
      employeeNo,
      name,
      beginTime,
      endTime,
      hikvisionResponse: response
    });

  } catch (error) {
    console.error("Error creando usuario visitante en Hikvision:", error);
    res.status(500).json({
      error: "Error al crear usuario visitante en Hikvision.",
      details: error.message
    });
  }
};