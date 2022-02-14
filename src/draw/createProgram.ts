import { delay } from '../util/delay';

type CachedProgram = {
    program: WebGLProgram,
    vertexShaderSource: string,
    vertexShader: WebGLShader,
    fragmentShaderSource: string,
    fragmentShader: WebGLShader,
}

const cachedPrograms: CachedProgram[] = [];
const maxCachedPrograms = 3;

export async function createProgram(vertexShaderSource: string, fragmentShaderSource: string, gl: WebGL2RenderingContext) {
    const cachedIndex = cachedPrograms.findIndex(p => p.vertexShaderSource === vertexShaderSource && p.fragmentShaderSource === fragmentShaderSource);
    if (cachedIndex !== -1) {
        try {
            const cachedProgram = cachedPrograms[cachedIndex];
            // Old program won't work for new gl context which is possible to happen in hot-reload
            if (gl.getProgramParameter(cachedProgram.program, gl.LINK_STATUS)) {
                cachedPrograms
                    .splice(cachedIndex, 1)
                    .forEach(p => cachedPrograms.push(p));
                return cachedProgram.program;
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

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const ext = gl.getExtension('KHR_parallel_shader_compile');
    if (ext) {
        while (!gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
            await delay();
        }
    } else {
        await delay(100);
    }

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        cachedPrograms.push({
            program,
            vertexShaderSource,
            vertexShader,
            fragmentShaderSource,
            fragmentShader,
        });
        cachedPrograms
            .splice(0, cachedPrograms.length - maxCachedPrograms)
            .forEach(cachedProgram => {
                gl.deleteShader(cachedProgram.vertexShader);
                gl.deleteShader(cachedProgram.fragmentShader);
                gl.deleteProgram(cachedProgram.program);
            });
        return program;
    }

    [vertexShader, fragmentShader].forEach(shader => {
        logCompileError(shader, gl);
        gl.deleteShader(shader);
    })

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
    return shader;
}

function logCompileError(shader: WebGLShader, gl: WebGL2RenderingContext) {
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
    }
}
