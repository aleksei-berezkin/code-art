export function createProgram(vertexShaderSource: string, fragmentShaderSource: string, gl: WebGL2RenderingContext) {
    const program = gl.createProgram();
    if (!program) {
        throw new Error('Cannot create program');
    }

    gl.attachShader(program, createShader(vertexShaderSource, gl.VERTEX_SHADER, gl));
    gl.attachShader(program, createShader(fragmentShaderSource, gl.FRAGMENT_SHADER, gl));
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);

    throw new Error(String(message));
}


function createShader(source: string, type: GLenum, gl: WebGL2RenderingContext) {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error('Cannot create shader');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    const msg = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);

    throw new Error(String(msg));
}
