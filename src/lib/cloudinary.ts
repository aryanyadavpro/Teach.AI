import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Parse CLOUDINARY_URL and configure
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
    // CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
    const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (match) {
        const [, apiKey, apiSecret, cloudName] = match;
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
        });
        console.log('[Cloudinary] Configured with cloud:', cloudName);
    } else {
        console.error('[Cloudinary] Failed to parse CLOUDINARY_URL');
    }
}

export default cloudinary;

export const uploadToCloudinary = async (
    file: Buffer,
    options: {
        folder?: string;
        resourceType?: 'auto' | 'image' | 'video' | 'raw';
        publicId?: string;
        context?: Record<string, string>;
    } = {}
): Promise<{
    url: string;
    publicId: string;
    format: string;
    bytes: number;
}> => {
    return new Promise((resolve, reject) => {
        // Build context string from metadata
        let contextStr = '';
        if (options.context) {
            contextStr = Object.entries(options.context)
                .map(([k, v]) => `${k}=${v.replace(/[|=]/g, '')}`)
                .join('|');
        }

        const uploadOptions: any = {
            folder: options.folder || 'learnify/resources',
            resource_type: options.resourceType || 'auto',
            public_id: options.publicId,
            context: contextStr || undefined
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: any, result: UploadApiResponse | undefined) => {
                if (error) {
                    console.error('[Cloudinary] Upload error:', error);
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format || '',
                        bytes: result.bytes
                    });
                } else {
                    reject(new Error('Upload failed - no result'));
                }
            }
        );

        uploadStream.end(file);
    });
};

export const deleteFromCloudinary = async (publicId: string, resourceType: string = 'raw') => {
    try {
        return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('[Cloudinary] Delete error:', error);
        throw error;
    }
};
