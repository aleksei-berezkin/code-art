<canvas bind:this={ canvasEl }></canvas>
<svelte:window on:resize={ resizeHandler }/>

<script lang='ts'>
    import {onDestroy, onMount} from 'svelte';
    import vertexShaderSource from './shader/vertex.shader';
    import fragmentShaderSource from './shader/fragment.shader';
    import { createShader } from './createShader';
    import { createProgram } from './createProgram';

    let canvasEl: HTMLCanvasElement;

    function resizeHandler() {
        const canvasRect = canvasEl.getBoundingClientRect();
        canvasEl.width = canvasRect.width;
        canvasEl.height = canvasRect.height;
    }

    onMount(() => {
        resizeHandler();

        const gl = canvasEl.getContext('webgl2');
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vertexShader, fragmentShader);

        // ---- Init and bind vertices buffer ----
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

        gl.enableVertexAttribArray(positionAttributeLocation);

        const size = 2;          // components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        // ---- / ----

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // ---- Create and bind resolution uniform ----
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        // ---- / ----

        // ---- Create color uniform ----
        const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
        // ---- / ----

        // Translate -1...+1 to:
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // ---- Draw ----
        for (let i = 0; i < 20; i++) {
            // Set random color
            gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

            // Generate rectangle
            const x1 = Math.random() * gl.canvas.width;
            const y1 = Math.random() * gl.canvas.height;
            const x2 = Math.random() * gl.canvas.width;
            const y2 = Math.random() * gl.canvas.height;
            
            const twoTriangles = [
                x1, y1,
                x1, y2,
                x2, y1,
                x1, y2,
                x2, y1,
                x2, y2,
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(twoTriangles), gl.STATIC_DRAW);
            gl.drawArrays(gl.TRIANGLES, 0, twoTriangles.length / size);
        }
        // ---- / ----
    });
</script>

<style>
    canvas {
        aspect-ratio: 16/9;
        max-width: 1280px;
        width: 90%;
    }
</style>
