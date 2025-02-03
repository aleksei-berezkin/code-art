import { delay } from '../util/delay'

type CachedProgram = {
    program: WebGLProgram,
    vertexShaderSource: string,
    vertexShader: WebGLShader,
    fragmentShaderSource: string,
    fragmentShader: WebGLShader,
    gl: WebGL2RenderingContext,
}

const cachedPrograms: CachedProgram[] = []

export async function createProgram(vertexShaderSource: string, fragmentShaderSource: string, gl: WebGL2RenderingContext) {
    const cachedProgram = cachedPrograms.find(p => p.vertexShaderSource === vertexShaderSource && p.fragmentShaderSource === fragmentShaderSource && p.gl === gl)
    if (cachedProgram) {
        const {program} = cachedProgram
        if (gl.getProgramParameter(cachedProgram.program, gl.LINK_STATUS)) {
            return program
        }

        cachedPrograms.splice(cachedPrograms.indexOf(cachedProgram), 1)
    }

    const program = gl.createProgram()
    if (!program) {
        throw new Error('cannot create WebGLProgram')
    }

    const vertexShader = createShader(vertexShaderSource, gl.VERTEX_SHADER, gl)
    const fragmentShader = createShader(fragmentShaderSource, gl.FRAGMENT_SHADER, gl)

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    const ext = gl.getExtension('KHR_parallel_shader_compile')
    if (ext) {
        while (!gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
            await delay()
        }
    } else {
        await delay(100)
    }

    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) {
        cachedPrograms.push({
            program,
            vertexShaderSource,
            vertexShader,
            fragmentShaderSource,
            fragmentShader,
            gl,
        })
        return program
    }

    [vertexShader, fragmentShader].forEach(shader => {
        logCompileError(shader, gl)
        gl.deleteShader(shader)
    })

    const message = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(String(message))
}

function createShader(source: string, type: GLenum, gl: WebGL2RenderingContext) {
    const shader = gl.createShader(type)
    if (!shader) {
        throw new Error('Cannot create WebGLShader')
    }

    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
}

function logCompileError(shader: WebGLShader, gl: WebGL2RenderingContext) {
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!success) {
        console.error(gl.getShaderInfoLog(shader))
    }
}
