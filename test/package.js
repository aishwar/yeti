var vows = require("vows");
var assert = require("assert");

var pkg = require("../lib/package");

vows.describe("Package").addBatch({
    "Reading package data" : {
        topic : function () {
            return pkg.readPackageSync();
        },
        "should return a homepage" : function (meta) {
            assert.ok(meta.homepage);
        },
        "should return a bug URL" : function (meta) {
            assert.ok(meta.bugs.url);
        },
        "should return a bug email address" : function (meta) {
            assert.ok(meta.bugs.mail);
        },
        "should return a version" : function (meta) {
            assert.ok(meta.version);
        }
    }
}).export(module);
