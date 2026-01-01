import { supabase } from './supabase'

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path within the bucket
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
    file: File,
    bucket: string = 'library-images',
    folder: string = ''
): Promise<string | null> {
    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        // Upload file
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Error uploading image:', error)
            return null
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path)

        return urlData.publicUrl
    } catch (error) {
        console.error('Error uploading image:', error)
        return null
    }
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name
 */
export async function deleteImage(
    url: string,
    bucket: string = 'library-images'
): Promise<boolean> {
    try {
        // Extract file path from URL
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`)
        if (pathParts.length < 2) return false

        const filePath = pathParts[1]

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath])

        if (error) {
            console.error('Error deleting image:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error deleting image:', error)
        return false
    }
}
