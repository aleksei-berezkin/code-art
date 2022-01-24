export function uploadArrayToAttribute(attrName: string, array: Float32Array, itemSize: number, program: WebGLProgram, gl: WebGL2RenderingContext) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    const attrLocation = gl.getAttribLocation(program, attrName);
    gl.vertexAttribPointer(attrLocation, itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(attrLocation);
}
