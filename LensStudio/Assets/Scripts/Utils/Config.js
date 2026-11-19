// Project-wide settings, exposed as `global.config`
// Place this on a SceneObject near the top of the scene hierarchy so it initializes before any script that calls it

// @input bool   useUrl     = true
// @input string jsonUrl    = "https://service.metason.net/saxr/samples/iris/datareps.json"
// @input Asset.JsonAsset   jsonFile
// @input int    sceneIndex = 0

// Base URL:
// https://service.metason.net/saxr/samples/

// Projects:
// area
// burnout
// cluster
// eco
// energy
// fruits
// geo
// ingredients
// iris
// line
// mesh

// Each project contains the following files:
// datareps.json
// config.json
// *.png (all generated images)
// viz.usdz
// viz.glb

// Camera Kit: use launch parameter
// Lens Studio: use script.jsonUrl
// Snapchat App: can't load a json file inside the Snapchat environment, use jsonFile (useURL = false)

function getJsonUrl() {
    var params = global.launchParams;
    if (params && params.has("url")) {
        return params.getString("url");
    }
    return script.jsonUrl;
}

// return the base bath with "/"
// e.g. for "https://service.metason.net/saxr/samples/iris/datareps.json" it returns "https://service.metason.net/saxr/samples/iris/"
function getBasePath() {
    var url = getJsonUrl();
    var idx = url.lastIndexOf("/");
    return url.substring(0, idx + 1);
}

global.config = {
    useUrl: script.useUrl,
    jsonUrl: getJsonUrl(),
    basePath: getBasePath(),
    jsonFile: script.jsonFile,
    sceneIndex: script.sceneIndex,
};

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["useUrl", "jsonUrl", "jsonFile", "sceneIndex"]);
});
