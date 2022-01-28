import type { Size } from '../util/Size';

export function uploadTexture(unit: number, texSource: TexImageSource, gl: WebGL2RenderingContext) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    setCurrentTexParams(gl);
    gl.texImage2D(gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        texSource,
    );
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
}

export function createEmptyTexture(unit: number, size: Size, gl: WebGL2RenderingContext) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    setCurrentTexParams(gl);
    gl.texImage2D(gl.TEXTURE_2D,
        0,
        gl.RGBA,
        size.w,
        size.h,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
    );
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    return texture!;
}

function setCurrentTexParams(gl: WebGL2RenderingContext) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}
