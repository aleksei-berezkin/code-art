export function createUploadToAttribute(attrName: string, vertexSize: number, program: WebGLProgram, gl: WebGL2RenderingContext) {
    let initial = true
    let buffer: WebGLBuffer | null = null

    return function bufferData(data: Float32Array) {
        try {
            if (initial) {
                buffer = gl.createBuffer()
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

                const attrLocation = gl.getAttribLocation(program, attrName)
                gl.vertexAttribPointer(attrLocation, vertexSize, gl.FLOAT, false, 0, 0)
                gl.enableVertexAttribArray(attrLocation)

                initial = false
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
            }
        } finally {
            gl.bindBuffer(gl.ARRAY_BUFFER, null)
        }
    }
}
