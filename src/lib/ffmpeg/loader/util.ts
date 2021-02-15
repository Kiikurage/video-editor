import * as PIXI from 'pixi.js';
import { Project } from '../../../model/Project';

const BYTE_PER_PIXEL = 4; // RGBA

export function renderObject(project: Project, object: PIXI.DisplayObject): ArrayBuffer {
    const renderer = PIXI.autoDetectRenderer({
        width: project.viewport.width,
        height: project.viewport.height,
        transparent: true,
        resolution: 1,
        autoDensity: false,
        antialias: true,
    });
    renderer.render(object);

    const buffer = new Uint8Array(project.viewport.width * project.viewport.height * BYTE_PER_PIXEL);
    renderer.gl.readPixels(
        0,
        0,
        project.viewport.width,
        project.viewport.height,
        WebGLRenderingContext.RGBA,
        WebGLRenderingContext.UNSIGNED_BYTE,
        buffer
    );
    renderer.destroy();

    return buffer;
}
