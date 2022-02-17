import type { SceneParams } from '../model/generateSceneParams';
import vertexShaderSource from '../shader/attributionVertex.shader';
import fragmentShaderSource from '../shader/attributionFragment.shader';
import { createProgram } from './createProgram';
import { uploadTexture } from './uploadTexture';
import { uploadArrayToAttribute } from './uploadArrayToAttribute';
import { renderToCanvas } from './renderColorToTexture';
import type { ColorScheme } from '../model/colorSchemes';
import { dpr } from '../util/dpr';
import { ceilToOdd } from '../util/ceilToOdd';
import { delay } from '../util/delay';
import type { AttributionPos } from '../model/attributionPos';
import { noAttribution } from '../model/attributionPos';

export async function drawAttributionScene(
    sceneParams: SceneParams,
    mainTexture: WebGLTexture,
    colorScheme: ColorScheme,
    codeCanvasEl: HTMLCanvasElement,
    attributionCanvasEl: HTMLCanvasElement,
) {
    const gl = codeCanvasEl.getContext('webgl2')!;

    const blurRadius = sceneParams.imgParams.font.size.val * dpr *.06;
    const kSize = ceilToOdd(blurRadius * 2, 25);

    const fragmentShaderSourceProcessed = fragmentShaderSource
        .replaceAll('_K_SIZE_', String(kSize));
    const prog = await createProgram(vertexShaderSource, fragmentShaderSourceProcessed, gl);

    uploadArrayToAttribute('a_position', new Float32Array([1, 1,   1, -1,   -1, 1,   -1, -1]), 2, prog, gl);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mainTexture);

    uploadTexture(1, attributionCanvasEl, gl);

    gl.useProgram(prog);

    await delay();

    gl.uniform1i(gl.getUniformLocation(prog, 'u_main'), 0);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_attr'), 1);

    gl.uniform2fv(gl.getUniformLocation(prog, 'u_mainSizePx'), [codeCanvasEl.width, codeCanvasEl.height]);
    const attrPos = sceneParams.imgParams['output image'].attribution.val as AttributionPos;
    gl.uniform2fv(gl.getUniformLocation(prog, 'u_attrFromPx'),
        attrPos === 'top left' ? [0, 0]
            : attrPos === 'top right' ? [codeCanvasEl.width - attributionCanvasEl.width, 0]
            : attrPos === 'bottom left' ? [0, codeCanvasEl.height - attributionCanvasEl.height]
            : attrPos === 'bottom right' ? [codeCanvasEl.width - attributionCanvasEl.width, codeCanvasEl.height - attributionCanvasEl.height]
            : attrPos === noAttribution ? [codeCanvasEl.width + 100, codeCanvasEl.height + 100]
            : undefined as never
    );
    gl.uniform2fv(gl.getUniformLocation(prog, 'u_attrSizePx'), [attributionCanvasEl.width, attributionCanvasEl.height]);
    gl.uniform2fv(gl.getUniformLocation(prog, 'u_blurRadiiPx'), [blurRadius, blurRadius]);
    gl.uniform3fv(gl.getUniformLocation(prog, 'u_bg'), colorScheme.background);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    renderToCanvas(gl);

    await delay();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
