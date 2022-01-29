import { delay } from '../util/delay';

const cache: Map<string, WebGLProgram> = new Map();

export async function createProgram(vertexShaderSource: string, fragmentShaderSource: string, gl: WebGL2RenderingContext) {
    const cacheKey = vertexShaderSource + fragmentShaderSource;
    if (cache.has(cacheKey)) {
        const cachedProg = cache.get(cacheKey)!;
        try {
            // Old program won't work for new gl context which is possible to happen in hot-reload
            if (gl.getProgramParameter(cachedProg, gl.LINK_STATUS)) {
                return cachedProg;
            }
        } catch (_ignored) {
        }
    }

    const program = gl.createProgram();
    if (!program) {
        throw new Error('Cannot create program');
    }

    const vertexShader = createShader(vertexShaderSource, gl.VERTEX_SHADER, gl);
    const fragmentShader = createShader(fragmentShaderSource, gl.FRAGMENT_SHADER, gl);

    await Promise.all([awaitCompileStatus(vertexShader, gl), awaitCompileStatus(fragmentShader, gl)]);

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // TODO async
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        cache.set(cacheKey, program);
        return program;
    }

    const message = gl.getProgramInfoLog(program);
    // TODO consistent cleanup
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
    return shader;
}

async function awaitCompileStatus(shader: WebGLShader, gl: WebGL2RenderingContext) {
    await delay(20);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return;
    }

    const msg = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);

    throw new Error(String(msg));
}

