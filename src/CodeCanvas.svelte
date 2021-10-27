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

        // ---- Create vertex data bound to a_position ----
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // 2d points
        const positions = [
            10, 20,
            80, 20,
            10, 30,
            10, 30,
            80, 20,
            80, 30,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // gl.bindVertexArray(gl.createVertexArray()); // ???

        gl.enableVertexAttribArray(positionAttributeLocation);

        const size = 2;          // components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        // ---- End a_position ----

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // ---- Create resolution uniform ----
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        // ---- End resolution uniform ----

        // Translate -1...+1 to:
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Go
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / size);
    });

</script>

<style>
    canvas {
        aspect-ratio: 16/9;
        max-width: 1280px;
        width: 90%;
    }
</style>
