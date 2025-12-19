/**
 * Image utility functions for avatar upload
 */

/**
 * Resize image to specified dimensions
 * @param file - Image file to resize
 * @param maxWidth - Maximum width (default 256)
 * @param maxHeight - Maximum height (default 256)
 * @returns Promise<Blob> - Resized image as blob
 */
export async function resizeImage(
    file: File,
    maxWidth: number = 256,
    maxHeight: number = 256
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                // Calculate new dimensions maintaining aspect ratio
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height
                        height = maxHeight
                    }
                }

                // Create canvas and resize
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Could not get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Could not create blob'))
                        }
                    },
                    file.type,
                    0.9 // Quality
                )
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Object with valid flag and error message
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Моля използвай JPG, PNG или WebP формат'
        }
    }

    if (file.size > MAX_SIZE) {
        return {
            valid: false,
            error: 'Файлът е твърде голям (макс 2MB)'
        }
    }

    return { valid: true }
}

/**
 * Get file extension from file type
 * @param mimeType - MIME type (e.g., 'image/jpeg')
 * @returns File extension (e.g., 'jpg')
 */
export function getFileExtension(mimeType: string): string {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
    }
    return map[mimeType] || 'jpg'
}
