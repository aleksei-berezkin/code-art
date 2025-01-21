export async function getShaderText(name: 'attributionFragment' | 'attributionVertex' | 'codeFragment' | 'codeVertex' | 'effectsFragment' | 'effectsVertex') {
    return await (await fetch(`/${name}.shader`)).text();
}
