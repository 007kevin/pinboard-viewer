var Cache;
(function (Cache) {
    var BookmarkCache = (function () {
        function BookmarkCache(storage) {
            this.storage = storage;
        }
        ;
        BookmarkCache.prototype.destroy = function (cb) {
            this.storage.clear(cb);
        };
        BookmarkCache.prototype.getBookmarks = function (api, clientcb) {
            var _self = this;
            api.getModifiedDate(function (latestUpdate) {
                var cacheBeforeCallback = function (bookmarks) {
                    var record = {
                        bookmarks: bookmarks,
                        updated: latestUpdate
                    };
                    _self.setBookmarks(record, clientcb);
                };
                _self.storage.get(LATEST_UPDATE, function (data) {
                    var prevUpdate = data[LATEST_UPDATE] && new Date(data[LATEST_UPDATE]);
                    if (DISABLE_CACHE)
                        prevUpdate = null;
                    if (!prevUpdate) {
                        console.log("Cache empty (or disabled). Refreshing all.");
                        api.getAllBookmarks(cacheBeforeCallback);
                    }
                    else if (prevUpdate.getTime() < latestUpdate.getTime()) {
                        api.getBookmarksSince(prevUpdate, function (newBookmarks) {
                            console.log("Found " + newBookmarks.length + " new bookmarks.");
                            _self.getBookmarksFromStorage(function (oldBookmarks) {
                                var bookmarks = oldBookmarks.concat(newBookmarks);
                                cacheBeforeCallback(bookmarks);
                            });
                        });
                    }
                    else {
                        console.log("Cache up-to-date; latest bookmark was updated " + prevUpdate);
                        _self.getLocalBookmarks(clientcb);
                    }
                });
            });
        };
        ;
        BookmarkCache.prototype.getLocalBookmarks = function (cb) {
            var _self = this;
            _self.storage.get(LATEST_UPDATE, function (updata) {
                var updated = updata[LATEST_UPDATE];
                _self.getBookmarksFromStorage(function (bookmarks) {
                    cb({
                        bookmarks: bookmarks,
                        updated: updated
                    });
                });
            });
        };
        BookmarkCache.prototype.getBookmarksFromStorage = function (cb) {
            this.storage.get(BOOKMARKS, function (data) {
                var bookmarks = data[BOOKMARKS];
                cb(bookmarks);
            });
        };
        BookmarkCache.prototype.setBookmarks = function (bookmarks, cb) {
            var kv = {};
            kv[LATEST_UPDATE] = bookmarks.updated.toString();
            kv[BOOKMARKS] = bookmarks.bookmarks;
            this.storage.set(kv, function () {
                if (chrome && chrome.runtime.lastError)
                    console.log("CACHE PUT FAILED");
                cb(bookmarks);
            });
        };
        return BookmarkCache;
    }());
    Cache.BookmarkCache = BookmarkCache;
})(Cache || (Cache = {}));
//# sourceMappingURL=cache.js.map