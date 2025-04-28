import { Request } from "express";
import multer from "multer";

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback) => {
        const allowedMimes = [
            'application/pdf',
            'application/x-pdf',
            'application/x-bzpdf',
            'application/x-gzpdf',
            'application/acrobat',
            'application/vnd.pdf',
        ];

        if(allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only pdf files allowed'));
        }
};

export const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});