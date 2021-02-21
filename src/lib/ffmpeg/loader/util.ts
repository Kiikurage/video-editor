import * as PIXI from 'pixi.js';
import { Project } from '../../../model/Project';

const BYTE_PER_PIXEL = 4; // RGBA

const activeRenderer: PIXI.Renderer[] = [];

export function renderObject(project: Project, object: PIXI.DisplayObject): ArrayBuffer {
    const renderer =
        activeRenderer.pop() ??
        PIXI.autoDetectRenderer({
            transparent: true,
            resolution: 1,
            autoDensity: false,
            antialias: true,
        });

    renderer.resize(project.viewport.width, project.viewport.height);

    renderer.clear();
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
    activeRenderer.push(renderer);

    return buffer;
}
