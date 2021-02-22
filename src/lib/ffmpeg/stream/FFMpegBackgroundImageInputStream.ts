import { promises as fs } from 'fs';
import * as path from 'path';
import * as PIXI from 'pixi.js';
import { Project } from '../../../model/Project';
import { assert } from '../../util';
import { scale } from '../filters/FFMpegScaleFilter';
import { input } from './FFMpegInputStream';
import { FFMpegStream } from './FFMpegStream';

export async function backgroundImageInput(project: Project, workspacePath: string): Promise<FFMpegStream> {
    const blob = await renderBackground(project);
    assert(blob !== null, 'Failed to get image from canvas');
    const backgroundImagePath = path.resolve(workspacePath, `./background.png`);
    await fs.writeFile(backgroundImagePath, new Uint8Array(await blob.arrayBuffer()));

    let stream = input(backgroundImagePath, { loop: true, type: 'v' });
    stream = scale(stream, { width: project.viewport.width, height: project.viewport.height });

    return stream;
}

async function renderBackground(project: Project): Promise<Blob | null> {
    const app = new PIXI.Application({
        width: project.viewport.width,
        height: project.viewport.height,
        backgroundColor: project.viewport.backgroundColor,
    });
    app.render();

    const blob = await new Promise<Blob | null>((resolve) => app.view.toBlob(resolve));
    app.destroy(true);

    return blob;
}
