import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: 'livebez',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                    return;
                }
                resolve(result!.secure_url);
            }
        ).end(buffer);
    });
}

export async function uploadFromUrl(url: string, folder: string = 'livebez'): Promise<string> {
    try {
        const result = await cloudinary.uploader.upload(url, {
            folder: folder,
            resource_type: 'auto',
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload from URL error:', error);
        throw error;
    }
}
