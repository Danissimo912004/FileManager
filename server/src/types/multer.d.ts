import { Request } from 'express';

declare module 'multer' {
  interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface StorageEngine {
    _handleFile(req: Request, file: MulterFile, callback: (error?: any, info?: Partial<MulterFile>) => void): void;
    _removeFile(req: Request, file: MulterFile, callback: (error: Error) => void): void;
  }

  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: MulterFile, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: MulterFile, callback: (error: Error | null, filename: string) => void) => void;
  }

  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    preservePath?: boolean;
  }

  interface Instance {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{ name: string; maxCount?: number }>): any;
    none(): any;
    any(): any;
  }

  interface Multer {
    (options?: Options): Instance;
    diskStorage(options: DiskStorageOptions): StorageEngine;
  }

  const multer: Multer;
  export = multer;
} 