// Sets the base texture of this SceneObject's RenderMeshVisual material.
// Add this script to a SceneObject that has a RenderMeshVisual.

// @input Asset.Texture texture

function setTexture(texture) {
    if (!texture) {
        print("SetTexture: no texture assigned");
        return;
    }

    if (!global.materialUtils.applyMaterialProperties(script.getSceneObject(), { texture: texture })) {
        print("SetTexture: no RenderMeshVisual with a material on " + script.getSceneObject().name);
    }
}

// expose so other scripts can change the texture at runtime
script.setTexture = setTexture;

script.createEvent("OnStartEvent").bind(function () {
    setTexture(script.texture);
});
