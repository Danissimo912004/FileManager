import { Request, Response } from "express";
import { FileService } from "../services/fileService";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../types/auth";
import { File, FileType } from "../models/File";
import path from "path";
import fs from "fs/promises";
import { UPLOAD_DIR } from "../config/constants";
import { RequestHandler } from "express";
import { WhereOptions } from "sequelize";
import { FileAttributes } from "../models/File";
import { File } from "buffer";

export class FileController {
  public getFiles: RequestHandler = async (req, res) => {
    const where: WhereOptions<FileAttributes> = {};

    if (req.query.folderId) {
      where.parentId = req.query.folderId as string;
    } else {
      where.parentId = null;
    }

    if (req.query.type) {
      where.type = req.query.type as FileType;
    }

    const files = await File.findAll({ where });
    res.json(files);
  };

  public getFile: RequestHandler = async (req, res) => {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      res.status(404).send("File not found");
      return;
    }
    res.json(file);
  };

  public uploadFile: RequestHandler = async (req, res) => {
    if (!req.file) {
      throw new AppError(400, "No file uploaded");
    }

    const { parentId } = req.body;
    const file = await FileService.createFile(req.file, parentId);
    res.status(201).json(file);
  };

  public createFolder: RequestHandler = async (req, res) => {
    const { name, parentId } = req.body;
    if (!name) {
      throw new AppError(400, "Folder name is required");
    }

    const folder = await FileService.createFolder(name, parentId);
    res.status(201).json(folder);
  };

  public deleteFile: RequestHandler = async (req, res) => {
    await FileService.deleteFile(req.params.id);
    res.status(204).send();
  };

  public searchFiles: RequestHandler = async (req, res) => {
    const query = req.query;

    const files = await FileService.searchFiles(
      query.q as string,
      query.type as FileType,
    );
    res.json(files);
  };

  public getFileContent: RequestHandler = async (req, res) => {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      throw new AppError(404, "File not found in database");
    }

    if (file.type === FileType.FOLDER) {
      throw new AppError(400, "Cannot read content of a folder");
    }

    const filePath = path.join(UPLOAD_DIR, file.path);
    try {
      await fs.access(filePath);
      const content = await FileService.getFileContent(req.params.id);
      res.json({ content });
    } catch (error) {
      throw new AppError(404, "Physical file not found");
    }
  };

  public updateFileContent: RequestHandler = async (req, res) => {
    const { content } = req.body;
    if (!content) {
      throw new AppError(400, "Content is required");
    }

    await FileService.updateFileContent(req.params.id, content);
    res.status(204).send();
  };

  public downloadFile: RequestHandler = async (req, res) => {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      throw new AppError(404, "File not found in database");
    }

    if (file.type === FileType.FOLDER) {
      throw new AppError(400, "Cannot download a folder");
    }

    const filePath = path.join(UPLOAD_DIR, file.path);
    try {
      await fs.access(filePath);
      res.download(filePath, file.name);
    } catch (error) {
      throw new AppError(404, "Physical file not found");
    }
  };

  public getPublicFile: RequestHandler = async (req, res) => {
    const file = await File.findByPk(req.params.id);
    if (!file) {
      throw new AppError(404, "File not found");
    }

    if (file.type === FileType.FOLDER) {
      throw new AppError(400, "Cannot access a folder");
    }

    const filePath = path.join(UPLOAD_DIR, file.path);
    res.sendFile(filePath);
  };

  public getFileStats: RequestHandler = async (req, res) => {
    const stats = await File.findAll({
      attributes: [
        "type",
        [File.sequelize!.fn("COUNT", File.sequelize!.col("id")), "count"],
        [File.sequelize!.fn("SUM", File.sequelize!.col("size")), "totalSize"],
      ],
      group: ["type"],
    });
    res.json(stats);
  };

  public syncFiles: RequestHandler = async (req, res) => {
    await FileService.syncDirectory();
    res.status(204).send();
  };
}
