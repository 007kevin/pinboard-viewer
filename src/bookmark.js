var Types;
(function (Types) {
    var Bookmark = (function () {
        function Bookmark(url, title, description, tags, createdAt, isPublic, isReadLater) {
            this.url = url;
            this.title = title;
            this.description = description;
            this.tags = tags;
            this.createdAt = createdAt;
            this.isPublic = isPublic;
            this.isReadLater = isReadLater;
        }
        Bookmark.build = function (node) {
            var tag = node.getAttribute('tag');
            return new Bookmark(node.getAttribute('href'), node.getAttribute('description'), node.getAttribute('extended'), tag.length > 0 ? node.getAttribute('tag').split(' ') : [], (new Date(node.getAttribute('time'))).getTime(), true, false);
        };
        return Bookmark;
    }());
    Types.Bookmark = Bookmark;
})(Types || (Types = {}));
//# sourceMappingURL=bookmark.js.map