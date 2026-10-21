// Downloads an image from a URL and sets it as the base texture of this SceneObject's RenderMeshVisual material.
// Add this script to a SceneObject that has a RenderMeshVisual.
// Works on Camera Kit and Spectacles (InternetModule is not available in Snapchat lenses).

// @input Asset.InternetModule internetModule
// @input Asset.RemoteMediaModule remoteMediaModule
// @input string url = "https://service.metason.net/ar/content/viz/irisLOD/lc.png"

function applyTexture(texture) {
    if (!global.materialUtils.applyMaterialProperties(script.getSceneObject(), { texture: texture })) {
        print("RemoteTexture: no RenderMeshVisual with a material on " + script.getSceneObject().name);
    }
}

function loadTexture(url) {
    // internetModule & remoteMediaModule is missing in Snapchat and in the Lens submission test runtime
    if (!script.internetModule || typeof script.internetModule.makeResourceFromUrl !== "function" ||
        !script.remoteMediaModule || typeof script.remoteMediaModule.loadResourceAsImageTexture !== "function") {
        print("RemoteTexture: remote loading not supported in this runtime, skipping " + url);
        return;
    }
    var resource;
    try {
        resource = script.internetModule.makeResourceFromUrl(url);
    } catch (e) {
        print("RemoteTexture: makeResourceFromUrl failed for " + url + ": " + e);
        return;
    }
    script.remoteMediaModule.loadResourceAsImageTexture(
        resource,
        function (texture) {
            print("RemoteTexture: loaded " + url);
            applyTexture(texture);
        },
        function (error) {
            print("RemoteTexture: failed to load " + url + ": " + error);
        }
    );
}

// expose so other scripts can load a different URL at runtime
script.loadTexture = loadTexture;

// prefer a "url" passed by the Camera Kit host app as launch data; fall back to the input
// (launch params are not available in Lens Studio preview)
function getUrl() {
    var params = global.launchParams;
    if (params && params.has("url")) {
        return params.getString("url");
    }
    return script.url;
}

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["internetModule", "remoteMediaModule", "url"]);
    loadTexture(getUrl());
});
