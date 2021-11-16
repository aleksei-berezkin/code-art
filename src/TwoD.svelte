<canvas bind:this={ canvasEl }></canvas>
<svelte:window on:resize={ resizeHandler }/>

<script lang='ts'>
    import { onMount } from 'svelte';
    import vertexShaderSource from './shader/twoDVertex.shader';
    import fragmentShaderSource from './shader/twoDFragment.shader';
    import { createShader } from './createShader';
    import { createProgram } from './createProgram';

    let canvasEl: HTMLCanvasElement;

    function resizeHandler() {
        const canvasRect = canvasEl.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasEl.width = canvasRect.width * dpr;
        canvasEl.height = canvasRect.height * dpr;
    }

    function rect(x1: number, y1: number, x2: number, y2: number) {
        return [x1, y1,   x2, y1,   x2, y2,   x1, y1,   x1, y2,   x2, y2];
    }

    onMount(() => {
        resizeHandler();

        const gl = canvasEl.getContext('webgl2');
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vertexShader, fragmentShader);

        // ---- Push vertices to buffer ----
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

        // F
        const xThickness = .06;
        const yThickness = xThickness * 3 / 2;

        const height = .5;
        const upperLen = .14;

        const midY = .21;
        const midLen = .08;

        const fTriangles = [
            // Vertical
            ...rect(0, 0, xThickness, height),
            // Upper
            ...rect(xThickness, height, xThickness + upperLen, height - yThickness),
            // Mid
            ...rect(xThickness, midY, xThickness + midLen, midY + yThickness),
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTriangles), gl.STATIC_DRAW);
        // ---- / ----

        // ---- Pull vertices from buffer to attribute ----
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        // ---- / ----

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // ---- Create and bind color uniform ----
        const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
        gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
        // ---- / ----

        // Translate -1...+1 to:
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0.08);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Go
        gl.drawArrays(gl.TRIANGLES, 0, fTriangles.length / 2);
    });
</script>

<style>
    canvas {
        aspect-ratio: 3/2;
        max-width: 1280px;
        width: 90%;
    }
</style>
