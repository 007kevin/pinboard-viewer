var chrome;
var chromeLocalStorage = chrome.storage.local;
var state = null;
var clearState = function (cb) {
    if (state) {
        state.cache.destroy(cb);
        state = null;
    }
    console.log("State cleared.");
};
var getState = function (name, token) {
    if (state) {
        if (name == state.secret.getUser() && token == state.secret.get()) {
            return state;
        }
        else {
            clearState(null);
        }
    }
    var secret = new Secret.SecretToken(name, token);
    var api = new API.PinboardAPI(secret);
    var cache = new Cache.BookmarkCache(chromeLocalStorage);
    state = {
        secret: secret,
        api: api,
        cache: cache
    };
    return state;
};
function debug(o) { console.log(o); return o; }
function extractTags(bookmarks) {
    var tags = Object.keys(bookmarks.reduce(function (tags, bookmark) {
        for (var i = 0; i < bookmark.tags.length; i++) {
            var tag = bookmark.tags[i];
            tags[tag] = true;
        }
        return tags;
    }, {}));
    console.log("Found " + bookmarks.length + " bookmarks with " + tags.length + " tags.");
    return {
        bookmarks: bookmarks,
        tags: tags
    };
}
function tryPost(port, msg) {
    try {
        port.postMessage(msg);
    }
    catch (err) {
        console.log(err);
    }
}
chrome.runtime.onConnect.addListener(function (port) {
    console.log("Received connection request.");
    console.assert(port.name == "bookmarks");
    port.onMessage.addListener(function (request) {
        console.log("Received message:");
        console.log(request);
        if (request.message == "logout") {
            clearState(null);
        }
        else if (request.message == "getBookmarks") {
            if (!request.name || !request.token)
                return;
            var state = getState(request.name, request.token);
            state.cache.getLocalBookmarks(function (cachedBookmarks) {
                var bookmarksAreCached = !!cachedBookmarks.bookmarks;
                if (bookmarksAreCached)
                    tryPost(port, extractTags(cachedBookmarks.bookmarks));
                state.cache.getBookmarks(state.api, function (refreshedBookmarks) {
                    if (!bookmarksAreCached || cachedBookmarks.updated < refreshedBookmarks.updated)
                        tryPost(port, extractTags(refreshedBookmarks.bookmarks));
                });
            });
        }
        else {
            console.log("Unknown message type. Suppressed.");
        }
        return true;
    });
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == "logout") {
        clearState(function () {
            sendResponse({ success: true });
        });
    }
    else {
        sendResponse({ success: false });
    }
});
//# sourceMappingURL=background.js.map