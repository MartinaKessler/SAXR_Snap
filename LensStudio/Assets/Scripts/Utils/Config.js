// Project-wide settings, exposed as `global.config`
// Place this on a SceneObject near the top of the scene hierarchy so it initializes before any script that calls it

// @input bool   useUrl     = true
// @input string jsonUrl    = "https://service.metason.net/ar/content/viz/irisLOD/datareps.json"
// @input Asset.JsonAsset   jsonFile
// @input int    sceneIndex = 0

// prefer a "url" launch parameter passed by the Camera Kit host app
// fall back to the input jsonUrl
// launch params are only available in Camera Kit, not inside Lens Studio or inside the Snapchat app
function getJsonUrl() {
    var params = global.launchParams;
    if (params && params.has("url")) {
        return params.getString("url");
    }
    return script.jsonUrl;
}

global.config = {
    useUrl: script.useUrl,
    jsonUrl: getJsonUrl(),
    jsonFile: script.jsonFile,
    sceneIndex: script.sceneIndex,
};

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["useUrl", "jsonUrl", "jsonFile", "sceneIndex"]);
});
