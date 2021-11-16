#version 300 es
 
uniform vec2 u_resolution;

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec4 a_color;

out vec2 v_texCoord;

// all shaders have a main function
void main() {
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to -1->+1 (clip space)
  vec2 clipSpace = zeroToOne * 2.0 - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texCoord = zeroToOne;
}
