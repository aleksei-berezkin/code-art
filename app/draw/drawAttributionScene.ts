import type { SceneParams } from '../model/generateSceneParams';
import { createProgram } from './createProgram';
import { uploadTexture } from './uploadTexture';
import { createUploadToAttribute } from './createUploadToAttribute';
import { renderToCanvas } from './renderColorToTexture';
import type { ColorScheme } from '../model/colorSchemes';
import { dpr } from '../util/dpr';
import { ceilToOdd } from '../util/ceilToOdd';
import { delay } from '../util/delay';
import type { AttributionPos } from '../model/attributionPos';
import { noAttribution } from '../model/attributionPos';
import { getShaderText } from './getShaderText';

export async function drawAttributionScene(
    sceneParams: SceneParams,
    mainTexture: WebGLTexture,
    colorScheme: ColorScheme,
    codeCanvasEl: HTMLCanvasElement,
    attributionCanvasEl: HTMLCanvasElement,
    selfAttrCanvasEl: HTMLCanvasElement,
) {
    const gl = codeCanvasEl.getContext('webgl2')!;

    const blurRadius = sceneParams.imgParams.font.size.val * dpr() *.06;
    const kSize = ceilToOdd(blurRadius * 2, 25);

    const fragmentShaderSourceProcessed = (await getShaderText('attributionFragment'))
        .replaceAll('_K_SIZE_', String(kSize));
    const program = await createProgram(
        (await getShaderText('attributionVertex')),
        fragmentShaderSourceProcessed,
        gl
    );

    createUploadToAttribute('a_position', 2, program, gl)(new Float32Array([1, 1,   1, -1,   -1, 1,   -1, -1]));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mainTexture);

    uploadTexture(1, attributionCanvasEl, gl);
    uploadTexture(2, selfAttrCanvasEl, gl);

    gl.useProgram(program);

    await delay();

    gl.uniform1i(gl.getUniformLocation(program, 'u_main'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_attr'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'u_selfAttr'), 2);

    gl.uniform2fv(gl.getUniformLocation(program, 'u_mainSizePx'), [codeCanvasEl.width, codeCanvasEl.height]);
    gl.uniform2fv(gl.getUniformLocation(program, 'u_attrSizePx'), [attributionCanvasEl.width, attributionCanvasEl.height]);
    gl.uniform2fv(gl.getUniformLocation(program, 'u_selfAttrSizePx'), [selfAttrCanvasEl.width, selfAttrCanvasEl.height]);

    const attrPos: AttributionPos = sceneParams.imgParams['output image'].attribution.val as AttributionPos;

    gl.uniform2fv(gl.getUniformLocation(program, 'u_attrFromPx'),
        attrPos === 'top 1' ? [0, 0]
            : attrPos === 'top 2' ? [codeCanvasEl.width - attributionCanvasEl.width, 0]
            : attrPos === 'bottom 1' ? [0, codeCanvasEl.height - attributionCanvasEl.height]
            : attrPos === 'bottom 2' ? [codeCanvasEl.width - attributionCanvasEl.width, codeCanvasEl.height - attributionCanvasEl.height]
            : attrPos === noAttribution ? [codeCanvasEl.width + 100, codeCanvasEl.height + 100]
            : undefined as never
    );
    gl.uniform2fv(gl.getUniformLocation(program, 'u_selfAttrFromPx'),
        attrPos === 'top 2' ? [0, 0]
            : attrPos === 'top 1' ? [codeCanvasEl.width - selfAttrCanvasEl.width, 0]
            : attrPos === 'bottom 2' ? [0, codeCanvasEl.height - selfAttrCanvasEl.height]
            : attrPos === 'bottom 1' ? [codeCanvasEl.width - selfAttrCanvasEl.width, codeCanvasEl.height - selfAttrCanvasEl.height]
            : attrPos === noAttribution ? [codeCanvasEl.width + 100, codeCanvasEl.height + 100]
            : undefined as never
    );
    gl.uniform2fv(gl.getUniformLocation(program, 'u_blurRadiiPx'), [blurRadius, blurRadius]);
    gl.uniform3fv(gl.getUniformLocation(program, 'u_bg'), colorScheme.background);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    renderToCanvas(gl);

    await delay();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
