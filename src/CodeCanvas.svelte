<canvas bind:this={ canvasEl }></canvas>
<svelte:window on:resize={ resizeHandler }/>

<script lang='ts'>
    import { onMount } from 'svelte';
    import vertexShaderSource from './shader/vertex.shader';
    import fragmentShaderSource from './shader/fragment.shader';
    import { createShader } from './createShader';
    import { createProgram } from './createProgram';

    let canvasEl: HTMLCanvasElement;

    function resizeHandler() {
        const canvasRect = canvasEl.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasEl.width = canvasRect.width * dpr;
        canvasEl.height = canvasRect.height * dpr;
    }

    onMount(() => {
        resizeHandler();

        const gl = canvasEl.getContext('webgl2');
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vertexShader, fragmentShader);

        // ---- Push vertices to buffer ----
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

        const x1 = Math.random() * gl.canvas.width;
        const y1 = Math.random() * gl.canvas.height;
        const x2 = Math.random() * gl.canvas.width;
        const y2 = Math.random() * gl.canvas.height;

        // Rectangle
        const twoTriangles = [
            x1, y1,
            x1, y2,
            x2, y1,
            x1, y2,
            x2, y1,
            x2, y2,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(twoTriangles), gl.STATIC_DRAW);
        // ---- / ----

        // ---- Pull vertices from buffer to attribute ----
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        // ---- / ----

        // ---- Push color to buffer ----
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

        const [r1, g1, b1, r2, g2, b2] = Array.from({length: 6}).map(() => Math.random());
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                r1, g1, b1, 1,
                r1, g1, b1, 1,
                r1, g1, b1, 1,
                r2, g2, b2, 1,
                r2, g2, b2, 1,
                r2, g2, b2, 1,
            ]),
            gl.STATIC_DRAW,
        );
        // ---- / ----

        // Pull color from buffer to attribute
        const colorLocation = gl.getAttribLocation(program, 'a_color');
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
        // ---- / ----

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // ---- Create and bind resolution uniform ----
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        // ---- / ----

        // Translate -1...+1 to:
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
</script>

<style>
    canvas {
        aspect-ratio: 16/9;
        max-width: 1280px;
        width: 90%;
    }
</style>
