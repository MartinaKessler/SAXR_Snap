// Downloads images and JSON files from a URL and hands them to a callback
// Works on Camera Kit and Spectacles (InternetModule is not available in Snapchat lenses)

// @input Asset.InternetModule    internetModule
// @input Asset.RemoteMediaModule remoteMediaModule
// @input string                  textureUrl        = "https://service.metason.net/ar/content/viz/irisLOD/lc.png"

// Returns a DynamicResource for the URL, or undefined if remote loading is not possible in this runtime
function loadResource(url) {
    // internetModule & remoteMediaModule is missing in Snapchat and in the Lens submission test runtime
    if (!script.internetModule || typeof script.internetModule.makeResourceFromUrl !== "function" ||
        !script.remoteMediaModule) {
        print("RemoteMedia: remote loading not supported in this runtime, skipping " + url);
        return;
    }
    var resource;
    try {
        resource = script.internetModule.makeResourceFromUrl(url);
    }
    catch (e) {
        print("RemoteMedia: makeResourceFromUrl failed for " + url + ": " + e);
        return;
    }
    return resource;
}

/**
 * Download an image and pass it to onLoaded as options.texture
 * Asynchronous: returns immediately, onLoaded is called once the download has finished
 * Does nothing (except log) if remote loading is not supported in this runtime
 * @param {Function} [onLoaded]          called with options once the texture has loaded
 * @param {Object}   options             passed to onLoaded with options.texture set to the loaded texture
 * @param {string}   options.textureName image URL
 */
function loadTexture(onLoaded, options) {
    var url = options.textureName;
    var resource = loadResource(url);
    if (!resource || typeof script.remoteMediaModule.loadResourceAsImageTexture !== "function") {
        return;
    }
    script.remoteMediaModule.loadResourceAsImageTexture(
        resource,
        function (texture) {
            print("RemoteTexture: loaded " + url);
            if (onLoaded) {
                try {
                    options.texture = texture;
                    onLoaded(options);
                }
                catch (e) {
                    print("RemoteJSON: error in onLoaded callback for " + url + ": " + e + "\n" + e.stack);
                }
            }
        },
        function (error) {
            print("RemoteTexture: failed to load " + url + ": " + error);
        }
    );
}

/**
 * Download a JSON file and pass the parsed data to a callback
 * Asynchronous: returns immediately, onLoaded is called once the download has finished
 * onLoaded is not called if remote loading is not supported, the download fails or the JSON is invalid
 * @param {string}   url        JSON URL
 * @param {Function} [onLoaded] called with the parsed data (Object or Array)
 */
function loadJson(url, onLoaded) {
    var resource = loadResource(url);
    if (!resource || typeof script.remoteMediaModule.loadResourceAsString !== "function") {
        return;
    }
    script.remoteMediaModule.loadResourceAsString(
        resource,
        function (jsonString) {
            print("RemoteJSON: loaded " + url);
            var data;
            try {
                data = JSON.parse(jsonString);
            }
            catch (e) {
                print("RemoteJSON: invalid JSON from " + url + ": " + e);
                return;
            }
            if (onLoaded) {
                try {
                    onLoaded(data);
                }
                catch (e) {
                    print("RemoteJSON: error in onLoaded callback for " + url + ": " + e + "\n" + e.stack);
                }
            }
        },
        function (error) {
            print("RemoteJSON: failed to load " + url + ": " + error);
        }
    );
}

// prefer a "url" passed by the Camera Kit host app as launch data; fall back to the input
// (launch params are not available in Lens Studio preview)
function getTextureUrl() {
    var params = global.launchParams;
    if (params && params.has("url")) {
        return params.getString("url");
    }
    return script.textureUrl;
}

script.loadTexture = loadTexture;
script.loadJson = loadJson;

script.createEvent("OnStartEvent").bind(function () {
    global.inputUtils.warnIfMissing(script, ["internetModule", "remoteMediaModule", "textureUrl"]);
    // loadTexture(getTextureUrl());
});
