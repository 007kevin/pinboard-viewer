var Secret;
(function (Secret) {
    var SecretToken = (function () {
        function SecretToken(name, token) {
            this.name = name;
            this.token = token;
        }
        SecretToken.prototype.getUser = function () { return this.name; };
        SecretToken.prototype.get = function () { return this.token; };
        return SecretToken;
    }());
    Secret.SecretToken = SecretToken;
})(Secret || (Secret = {}));
//# sourceMappingURL=secret.js.map