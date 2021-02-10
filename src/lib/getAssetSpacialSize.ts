export interface Size {
    width: number;
    height: number;
}

export async function getImageSize(filePath: string): Promise<Size> {
    return new Promise((resolve) => {
        const image = document.createElement('img');
        image.addEventListener('load', () => {
            resolve({
                width: image.naturalWidth,
                height: image.naturalHeight,
            });
        });
        image.hidden = true;
        image.src = filePath;
    });
}

export async function getVideoSize(filePath: string): Promise<Size> {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.addEventListener('loadedmetadata', () => {
            resolve({
                width: video.videoWidth,
                height: video.videoHeight,
            });
        });
        video.hidden = true;
        video.src = filePath;
    });
}
