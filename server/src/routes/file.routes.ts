import { Router } from "express";
import multer from "multer";
import { UPLOAD_DIR } from "../config/constants";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import { FileController } from "../controllers/file.controller";

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

const router = Router();
const fileController = new FileController();

/**
 * @swagger
 * /api/files/public/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Get public file by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 */
router.get("/public/:id", fileController.getPublicFile);

/**
 * @swagger
 * /api/files/download/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Download file by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 */
router.get("/download/:id", fileController.downloadFile);

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload a file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               parentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 */
router.post("/upload", upload.single("file"), fileController.uploadFile);

/**
 * @swagger
 * /api/files/folder:
 *   post:
 *     tags: [Files]
 *     summary: Create a new folder
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 */
router.post("/folder", fileController.createFolder);

/**
 * @swagger
 * /api/files/search:
 *   get:
 *     tags: [Files]
 *     summary: Search files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 */
router.get("/search", fileController.searchFiles);

/**
 * @swagger
 * /api/files:
 *   get:
 *     tags: [Files]
 *     summary: Get all files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 */
router.get("/", fileController.getFiles);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Get file by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 */
router.get("/:id", fileController.getFile);

/**
 * @swagger
 * /api/files/{id}/content:
 *   get:
 *     tags: [Files]
 *     summary: Get file content
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File content
 */
router.get("/:id/content", fileController.getFileContent);

/**
 * @swagger
 * /api/files/{id}/content:
 *   put:
 *     tags: [Files]
 *     summary: Update file content
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       204:
 *         description: File content updated successfully
 *       404:
 *         description: File not found
 */
router.put("/:id/content", fileController.updateFileContent);

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     tags: [Files]
 *     summary: Download file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 */
router.get("/:id/download", fileController.downloadFile);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete file by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
router.delete("/:id", fileController.deleteFile);

// Admin routes
/**
 * @swagger
 * /api/files/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get file statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File statistics
 */
router.use(
  "/admin",
  adminMiddleware,
  Router()
    .get("/stats", fileController.getFileStats)
    .post("/sync", fileController.syncFiles),
);

export const fileRouter = router;
