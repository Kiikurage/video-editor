// import * as PIXI from 'pixi.js';
// import { AppController } from '../../../service/AppController';
//
// export class PreviewPlayerController {
//     private appController: AppController | null = null;
//     private pixiApp: PIXI.Application | null = null;
//
//     setAppController(appController: AppController): void {
//         if (this.appController !== null) {
//             this.appController.off('project.change', this.onProjectChange);
//             this.appController.off('object.select', this.onObjectSelect);
//             this.appController.previewController.off('seek', this.onPreviewSeek);
//         }
//         appController.on('project.change', this.onProjectChange);
//         appController.on('object.select', this.onObjectSelect);
//         appController.previewController.on('seek', this.onPreviewSeek);
//
//         this.forceUpdate();
//     }
//
//     forceUpdate(): void {}
//
//     setCanvas(canvas: HTMLCanvasElement): void {}
//
//     private initializePixiApp(canvas: HTMLCanvasElement) {
//         if (this.pixiApp) {
//             this.cleanUpPixiApp();
//             this.pixiApp = null;
//         }
//
//         this.pixiApp = new PIXI.Application({
//             antialias: false,
//             autoDensity: true,
//             autoStart: true,
//             backgroundColor: 0xffffff,
//             width: 1920,
//             height: 1080,
//             view: canvas,
//             resizeTo: canvas,
//         });
//     }
//
//     private cleanUpPixiApp() {
//         if (this.pixiApp === null) return;
//         this.pixiApp.destroy();
//     }
//
//     private onObjectSelect = () => {
//         this.forceUpdate();
//     };
//
//     private onProjectChange = () => {
//         this.forceUpdate();
//     };
//
//     private onPreviewSeek = () => {
//         this.forceUpdate();
//     };
// }
