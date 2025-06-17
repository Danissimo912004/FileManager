import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export enum FileType {
  FOLDER = 'folder',
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  OTHER = 'other',
  PDF = 'pdf'
}

export interface FileAttributes {
  id: string;
  name: string;
  type: FileType;
  path: string;
  size: number;
  mimeType: string;
  content?: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileCreationAttributes extends Optional<FileAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class FileModel extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: string;
  public name!: string;
  public type!: FileType;
  public path!: string;
  public size!: number;
  public mimeType!: string;
  public content?: string;
  public parentId?: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations
  public static associate() {
    FileModel.belongsTo(FileModel, {
      as: 'parent',
      foreignKey: 'parentId'
    });

    FileModel.hasMany(FileModel, {
      as: 'children',
      foreignKey: 'parentId'
    });
  }

  public static getFileType(mimeType: string): FileType {
    if (!mimeType) return FileType.OTHER;

    // Нормализуем MIME-тип
    const normalizedMime = mimeType.toLowerCase();

    // Проверяем основные типы по началу строки
    if (normalizedMime.startsWith('image/')) return FileType.IMAGE;
    if (normalizedMime.startsWith('video/')) return FileType.VIDEO;
    if (normalizedMime.startsWith('audio/')) return FileType.AUDIO;

    // Проверяем текстовые файлы
    if (normalizedMime.startsWith('text/')) return FileType.TEXT;

    // Проверяем специфические MIME-типы для текстовых файлов
    const textMimeTypes = [
      'application/json',
      'application/javascript',
      'application/typescript',
      'application/x-httpd-php',
      'application/xml',
      'application/x-yaml',
      'application/x-sql'
    ];
    if (textMimeTypes.includes(normalizedMime)) return FileType.TEXT;

    // Проверяем PDF
    if (normalizedMime === 'application/pdf') return FileType.PDF;

    // Проверяем документы
    const documentMimeTypes = [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.oasis.opendocument.text', // .odt
      'application/vnd.oasis.opendocument.spreadsheet', // .ods
      'application/vnd.oasis.opendocument.presentation', // .odp
      'application/rtf' // .rtf
    ];
    if (documentMimeTypes.includes(normalizedMime)) return FileType.DOCUMENT;

    // Video types
    const videoMimeTypes = [
      'application/mp4', // .mp4
      'video/mp4', // .mp4
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/x-ms-wmv', // .wmv
      'video/x-flv', // .flv
      'video/webm', // .webm
      'video/ogg', // .ogv
      'video/3gpp', // .3gp
      'video/3gpp2', // .3g2
      'video/mpeg', // .mpeg
      'video/mp2t', // .ts
      'video/vnd.dlna.mpeg-tts', // .m2ts
      'video/x-matroska', // .mkv
      'video/webm', // .webm
      'video/ogg', // .ogv
      'video/3gpp', // .3gp
      'video/3gpp2', // .3g2
      'video/mpeg', // .mpeg
      'video/mp2t', // .ts
      'video/vnd.dlna.mpeg-tts', // .m2ts
      'video/x-matroska', // .mkv
    ];
    if (videoMimeTypes.includes(normalizedMime)) return FileType.VIDEO;

    // Если не удалось определить тип, возвращаем OTHER
    return FileType.OTHER;
  }
}

FileModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(FileType)),
      allowNull: false
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'files',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'files',
    modelName: 'File'
  }
);

export const File = FileModel; 
