export function renderColorToTexture(texture: WebGLTexture, gl: WebGL2RenderingContext) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, gl.createFramebuffer())
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
    )
}

export function renderToCanvas(gl: WebGL2RenderingContext) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}
