import express from "express";
import { uploadFile, validateLink, cancelLink, verifyToken, urlUploads,getAllImages} from "../controllers/docsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/upload/:linkId", uploadFile);
router.post("/validate/:linkId", validateLink);
router.post("/cancel/:linkId", cancelLink);
router.get("/verify-token/:token", verifyToken)
router.get("/uploads", authMiddleware,urlUploads)
router.get('/:folder', getAllImages);

export default router;
