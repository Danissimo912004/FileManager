import {
  File,
  FileType,
  FileAttributes,
  FileCreationAttributes,
} from "../models/File";
import { Op, WhereOptions } from "sequelize";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types";
import { UPLOAD_DIR } from "../config/constants";
import { AppError } from "../middleware/error.middleware";
import { Model } from "sequelize";

interface FileInstance
  extends Model<FileAttributes, FileCreationAttributes>,
    FileAttributes {}

export class FileService {
  // Initialize storage directory
  static async init() {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      console.log("Storage directory initialized at:", UPLOAD_DIR);
    } catch (error) {
      console.error("Error initializing file service:", error);
      throw error;
    }
  }

  // Get files in directory
  static async getFiles(parentId: string | null = null) {
    const where: WhereOptions<FileAttributes> = {};
    if (parentId !== null) {
      where.parentId = parentId;
    }

    return File.findAll({
      where,
      order: [
        ["type", "ASC"],
        ["name", "ASC"],
      ],
    });
  }

  // Search files
  static async searchFiles(query: string, type?: FileType) {
    const whereClause: WhereOptions<FileAttributes> = {};

    if (query) {
      whereClause.name = {
        [Op.like]: `%${query}%`,
      };
    }

    if (type) {
      whereClause.type = type;
    }

    console.log(whereClause);

    return File.findAll({
      where: whereClause,
      order: [
        ["type", "ASC"],
        ["name", "ASC"],
      ],
    });
  }

  // Create new file
  static async createFile(file: Express.Multer.File, parentId?: string | null) {
    // Ensure the file exists
    try {
      await fs.access(file.path);
    } catch (error) {
      throw new AppError(404, "Uploaded file not found");
    }

    // Decode the original filename from URI encoding if needed
    const decodedFilename = decodeURIComponent(file.originalname);

    // Move file to storage directory with a unique name
    const uniqueName = `${Date.now()}-${decodedFilename}`;
    const relativePath = parentId
      ? path.join(parentId, uniqueName)
      : uniqueName;
    const targetPath = path.join(UPLOAD_DIR, relativePath);

    try {
      // Ensure parent directory exists
      await fs.mkdir(path.dirname(targetPath), { recursive: true });

      // Move the file
      await fs.rename(file.path, targetPath);

      // Create file record
      const fileRecord = await File.create({
        name: decodedFilename,
        type: File.getFileType(file.mimetype),
        path: relativePath.replace(/\\/g, "/"), // Normalize path for storage
        size: file.size,
        mimeType: file.mimetype,
        parentId: parentId || null,
      } as FileAttributes);

      return fileRecord;
    } catch (error) {
      // Cleanup on error
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error("Error cleaning up temporary file:", unlinkError);
      }
      throw new AppError(500, "Error saving file");
    }
  }

  // Create new folder
  static async createFolder(name: string, parentId?: string | null) {
    const folder = await File.create({
      name,
      type: FileType.FOLDER,
      path: "",
      size: 0,
      mimeType: "folder",
      parentId: parentId || null,
    } as FileAttributes);

    return folder;
  }

  // Delete file or folder
  static async deleteFile(id: string): Promise<void> {
    const file = await File.findByPk(id);
    if (!file) {
      throw new AppError(404, "File not found in database");
    }

    if (file.type !== FileType.FOLDER) {
      const filePath = path.join(UPLOAD_DIR, file.path);
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    } else {
      // Delete all children recursively
      const children = await File.findAll({ where: { parentId: id } });
      for (const child of children) {
        await this.deleteFile(child.id);
      }
    }

    await file.destroy();
  }

  // Get file content
  static async getFileContent(id: string): Promise<string> {
    const file = await File.findByPk(id);
    if (!file) {
      throw new AppError(404, "File not found in database");
    }

    if (file.type === FileType.FOLDER) {
      throw new AppError(400, "Cannot read content of a folder");
    }

    const filePath = path.join(UPLOAD_DIR, file.path);
    try {
      await fs.access(filePath);
      if (file.type === FileType.TEXT) {
        const content = await fs.readFile(filePath, "utf-8");
        await file.update({ content });
        return content;
      }
      throw new AppError(400, "File type does not support content reading");
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(404, "Physical file not found");
    }
  }

  // Update file content
  static async updateFileContent(id: string, content: string): Promise<void> {
    const file = await File.findByPk(id);
    if (!file) {
      throw new AppError(404, "File not found in database");
    }

    if (file.type === FileType.FOLDER) {
      throw new AppError(400, "Cannot update content of a folder");
    }

    if (file.type !== FileType.TEXT) {
      throw new AppError(400, "Only text files can be updated");
    }

    const filePath = path.join(UPLOAD_DIR, file.path);
    try {
      await fs.access(filePath);
      await fs.writeFile(filePath, content, "utf-8");
      await file.update({ content });
    } catch (error) {
      throw new AppError(404, "Physical file not found");
    }
  }

  // Sync files between filesystem and database
  static async syncDirectory(): Promise<void> {
    try {
      // Get all files from database
      const dbFiles = await File.findAll();
      const dbFilePaths = new Set(dbFiles.map((file) => file.path));

      // Read all files from upload directory recursively
      const dirFiles = await this.readDirRecursive(UPLOAD_DIR);

      // Process each file in the directory
      for (const filePath of dirFiles) {
        const relativePath = path.relative(UPLOAD_DIR, filePath);
        const stats = await fs.stat(filePath);
        let mimeType = mime.lookup(filePath) || "application/octet-stream";
        const fileName = path.basename(filePath);
        const parentDir = path.dirname(relativePath);

        // fix mime.lookup returning application/mp4 in mime-types 3.0.1
        if (mimeType === "application/mp4") {
          mimeType = "video/mp4";
        }

        // Find or create parent folder if not in root
        let parentId: string | null = null;
        if (parentDir !== ".") {
          const parentFolder = await this.ensureFolder(parentDir);
          parentId = parentFolder.id;
        }

        // If file doesn't exist in database, create it
        if (!dbFilePaths.has(relativePath)) {
          await File.create({
            name: fileName,
            type: File.getFileType(mimeType),
            path: relativePath,
            size: stats.size,
            mimeType: mimeType,
            parentId: parentId,
          } as FileCreationAttributes);
          console.log(`Added new file to database: ${fileName} `);
        }
      }

      // Remove files from database that don't exist in directory
      for (const dbFile of dbFiles) {
        if (dbFile.type !== FileType.FOLDER) {
          const fullPath = path.join(UPLOAD_DIR, dbFile.path);
          try {
            await fs.access(fullPath);
          } catch (error) {
            // File doesn't exist in filesystem, remove from database
            await dbFile.destroy();
            console.log(`Removed file from database: ${dbFile.name}`);
          }
        }
      }

      console.log("File synchronization completed successfully");
    } catch (error) {
      console.error("Error during file synchronization:", error);
      throw error;
    }
  }

  // Helper method to ensure folder exists in database
  private static async ensureFolder(folderPath: string): Promise<FileInstance> {
    const folderName = path.basename(folderPath);
    const parentPath = path.dirname(folderPath);

    let parentId: string | null = null;
    if (parentPath !== ".") {
      const parentFolder = await this.ensureFolder(parentPath);
      parentId = parentFolder.id;
    }

    let folder = (await File.findOne({
      where: {
        name: folderName,
        type: FileType.FOLDER,
        parentId: parentId,
      },
    })) as FileInstance | null;

    if (!folder) {
      folder = (await this.createFolder(folderName, parentId)) as FileInstance;
    }

    return folder;
  }

  // Helper method to read directory recursively
  private static async readDirRecursive(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.readDirRecursive(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }
}
