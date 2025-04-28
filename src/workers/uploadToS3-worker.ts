import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";

const client = new S3({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_KEY as string,
    },
    endpoint: process.env.S3_ENDPOINT as string,
    region: process.env.S3_REGION as string,
    forcePathStyle: true,
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    const fileKey = `files/${Date.now()}-${file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
    )}`;

    const upload = new Upload({
        client: client,
        params: {
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentLength: file.size,
            Bucket: process.env.S3_BUCKET_NAME as string,
            ACL: "public-read"
        }
    });

    return new Promise(async (resolve, reject) => {
        try {
            await upload.done();
            resolve(`${process.env.S3_ENDPOINT as string}/${process.env.S3_BUCKET_NAME as string}/${fileKey}`);
        } catch(e) {
            reject(e);
        }
    });
};