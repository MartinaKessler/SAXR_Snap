//@component
// Sets the base texture of this SceneObject's RenderMeshVisual material.
// Add this script to a SceneObject that has a RenderMeshVisual.

// @input Asset.Texture texture
// @input bool cloneMaterial = true {"hint":"Clone the material so other objects sharing it are not affected"}

function setTexture(texture) {
    if (!texture) {
        print("SetTexture: no texture assigned");
        return;
    }

    var rmv = script.getSceneObject().getComponent("Component.RenderMeshVisual");
    if (!rmv || !rmv.mainMaterial) {
        print("SetTexture: no RenderMeshVisual with a material on " + script.getSceneObject().name);
        return;
    }

    var mat = script.cloneMaterial ? rmv.mainMaterial.clone() : rmv.mainMaterial;
    mat.mainPass.baseTex = texture;

    if (script.cloneMaterial) {
        rmv.clearMaterials();
        rmv.addMaterial(mat);
    }
}

// expose so other scripts can change the texture at runtime
script.setTexture = setTexture;

script.createEvent("OnStartEvent").bind(function () {
    setTexture(script.texture);
});
