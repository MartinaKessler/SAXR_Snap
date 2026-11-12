// Reusable material helpers, exposed as `global.materialUtils`
// Place this on a SceneObject near the top of the scene hierarchy so it initializes before any script that calls it

var transparentCount = 0;

/**
 * Collect the RenderMeshVisuals of obj and all its children
 * @param   {SceneObject}        obj
 * @param   {RenderMeshVisual[]} result array to append to (pass [] on the first call)
 * @returns {RenderMeshVisual[]}        the filled result array
 */
function findRenderMeshVisuals(obj, result) {
    var rmv = obj.getComponent("Component.RenderMeshVisual");
    if (rmv) {
        result.push(rmv);
    }
    for (var i = 0; i < obj.getChildrenCount(); i++) {
        findRenderMeshVisuals(obj.getChild(i), result);
    }
    return result;
}

/**
 * Set color and/or texture on all RenderMeshVisuals of obj including all children
 * The material is cloned so other objects sharing it are not affected
 * Visuals on child objects (e.g. Octahedron = two halves) all get the same clone
 * @param   {SceneObject}   obj
 * @param   {Object}        options
 * @param   {vec4}          [options.color]   base color (r,g,b,a), the object gets its own cloned material
 * @param   {Asset.Texture} [options.texture] base texture, the object gets its own cloned material
 * @returns {boolean}                         false if obj has no RenderMeshVisual with a material
 */
function applyMaterialProperties(obj, options) {
    var visuals = findRenderMeshVisuals(obj, []);
    if (visuals.length === 0 || !visuals[0].mainMaterial) {
        return false;
    }

    var mat = visuals[0].mainMaterial.clone();
    if (options.color) {
        mat.mainPass.baseColor = options.color;
    }
    if (options.texture) {
        mat.mainPass.baseTex = options.texture;
    }

    for (var i = 0; i < visuals.length; i++) {
        visuals[i].clearMaterials();
        visuals[i].addMaterial(mat);
        if (options.color && options.color.a < 1) {
            // opaque objects keep render order 0 and are drawn first
            // transparent objects get render order 1 + transparentCount and are drawn afterwards
            // drawing transparent objects last ensures opaque objects inside them stay visible
            // a fixed render order per transparent object stops Lens Studio from re-sorting them by camera distance, which caused flickering when the scene is rotated
            // limitation: where transparent objects intersect, the fixed order can look wrong from some angles
            visuals[i].setRenderOrder(1 + transparentCount);
        }
    }

    if (options.color && options.color.a < 1) {
        transparentCount++;
    }

    return true;
}

global.materialUtils = {
    findRenderMeshVisuals: findRenderMeshVisuals,
    applyMaterialProperties: applyMaterialProperties,
};
