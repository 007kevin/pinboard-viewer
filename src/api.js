var API;
(function (API) {
    var PinboardAPI = (function () {
        function PinboardAPI(token) {
            this.token = token;
        }
        ;
        PinboardAPI.prototype.getModifiedDate = function (cb) {
            this.apiGet('posts/update', this.token, {}, function (xmlDoc) {
                var latestUpdate = new Date(xmlDoc.getElementsByTagName('update').item(0).getAttribute('time'));
                cb(latestUpdate);
            });
        };
        PinboardAPI.prototype.getAllBookmarks = function (cb) {
            this.getBookmarksSince(null, cb);
        };
        PinboardAPI.prototype.getBookmarksSince = function (prevUpdate, cb) {
            this.apiGet('posts/all', this.token, { fromdt: this.formatDateUTC(prevUpdate) }, function (xmlDoc) {
                var elem = xmlDoc.getElementsByTagName('posts').item(0);
                var posts = elem.getElementsByTagName('post');
                var bookmarks = [];
                for (var i = 0; i < posts.length; i++) {
                    var bookmark = Types.Bookmark.build(posts.item(i));
                    bookmarks.push(bookmark);
                }
                cb(bookmarks);
            });
        };
        PinboardAPI.prototype.apiGet = function (endpoint, token, params, cb) {
            var xhr = new XMLHttpRequest();
            var urlParams = Object.keys(params).filter(function (key) {
                return !!params[key];
            }).map(function (key) {
                return key + '=' + params[key];
            }).concat('auth_token=' + token.getUser() + ':' + token.get()).join('&');
            var requestUrl = 'https://api.pinboard.in/v1/' + endpoint + '?' + urlParams;
            console.log("[DEBUG] sending GET to " + requestUrl);
            xhr.open("GET", requestUrl, true);
            xhr.onload = function (e) {
                var xmlDoc = xhr.responseXML;
                cb(xmlDoc);
            };
            xhr.onerror = function (e) { console.log("XHR error: " + e); };
            xhr.send();
        };
        PinboardAPI.prototype.formatDateUTC = function (date) {
            if (!date)
                return null;
            return [
                date.getUTCFullYear(),
                '-',
                date.getUTCMonth() + 1,
                '-',
                date.getUTCDate(),
                'T',
                date.getUTCHours(),
                ':',
                date.getUTCMinutes(),
                ':',
                date.getUTCSeconds(),
                'Z'
            ].join('');
        };
        return PinboardAPI;
    }());
    API.PinboardAPI = PinboardAPI;
})(API || (API = {}));
//# sourceMappingURL=api.js.map