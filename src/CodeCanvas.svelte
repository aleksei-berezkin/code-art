<canvas bind:this={ canvasEl }></canvas>
<svelte:window on:resize={ resizeHandler }/>

<script lang='ts'>
    import { onMount } from 'svelte';
    import vertexShaderSource from './shader/vertex.shader';
    import fragmentShaderSource from './shader/fragment.shader';
    import { createShader } from './createShader';
    import { createProgram } from './createProgram';
    import { loadImage } from './loadImage';

    let canvasEl: HTMLCanvasElement;

    function resizeHandler() {
        const canvasRect = canvasEl.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasEl.width = canvasRect.width * dpr;
        canvasEl.height = canvasRect.height * dpr;
    }

    onMount(() => {
        resizeHandler();

        const kSize = 19;
        if (kSize % 2 !== 1) {
            throw new Error(`Not odd: ${kSize}`);
        }

        const gl = canvasEl.getContext('webgl2');
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource.replace('_kLen_', kSize ** 2));
        const program = createProgram(gl, vertexShader, fragmentShader);

        // ---- Push vertices to buffer ----
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

        const x1 = 0;
        const y1 = 0;
        const x2 = gl.canvas.width;
        const y2 = gl.canvas.height;

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

        loadImage('SamplePic2.jpg')
            .then(img => {
                // ---- Push texture ----
                // make unit 0 the active texture unit
                // (i.e, the unit all other texture commands will affect.)
                gl.activeTexture(gl.TEXTURE0 + 0);

                // Create and bind texture to 'texture unit '0' 2D bind point
                gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());

                // Set the parameters so we don't need mips and so we're not filtering
                // and we don't repeat
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

                // Upload the image into the texture.
                const mipLevel = 0;               // the largest mip
                const internalFormat = gl.RGBA;   // format we want in the texture
                const srcFormat = gl.RGBA;        // format of data we are supplying
                const srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
                gl.texImage2D(gl.TEXTURE_2D,
                    mipLevel,
                    internalFormat,
                    srcFormat,
                    srcType,
                    img);
                // ---- / ----

                // Tell it to use our program (pair of shaders)
                gl.useProgram(program);
        
                // ---- Create and bind resolution uniform ----
                const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
                gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
                // ---- / ----

                // ---- Create and bind texture uniform ----
                const imageLocation = gl.getUniformLocation(program, 'u_image');
                gl.uniform1i(imageLocation, 0);
                // ---- / ----
        
                // ---- Create and bind kernel uniforms ----
                const center = (kSize - 1) / 2;
                const r = (kSize - 1) - center;

                const kernel = Array.from({length: kSize ** 2}).map((_, i) => {
                    const row = Math.floor(i / kSize);
                    const col = i % kSize;
                    const _r = Math.sqrt((row - center) ** 2 + (col - center) ** 2);
                    return _r <= r ? 1 : 0;
                });

                const kernelLocation = gl.getUniformLocation(program, 'u_kernel');
                gl.uniform1fv(kernelLocation, kernel);

                const kernelSizeLocation = gl.getUniformLocation(program, 'u_kSize');
                gl.uniform1i(kernelSizeLocation, kSize);
                // ---- / ----

                // Translate -1...+1 to:
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
                // Clear the canvas
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
        
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            })
        
    });
</script>

<style>
    canvas {
        aspect-ratio: 3/2;
        max-width: 1280px;
        width: 90%;
    }
</style>
