var vows = require("vows");
var assert = require("assert");

var server = require("../lib/server");
var visitor = require("../lib/visitor");

var Browser = require("../lib/browsers").Browser;

var macros = require("../lib/macros"),
    request = macros.request,
    httpify = macros.httpify;

// debugging
var ui = require("../lib/ui");
ui.verbose(1); // show debug-level logs

function requestTest (fixture, requestOnly) {
    var suite = {
        topic : request(
            200,
            "/tests/add",
            { tests : [ __dirname + "/" + fixture + ".html" ] },
            "PUT"
        ),
        "the test id is returned" : function (id) {
            assert.isString(id);
        }
    };

    if ( // FIXME: Kludge for tests that just shouldn't stop the runner
        requestOnly !== true
    ) suite["and the status is requested"] = {
        topic : request(200, function (id) {
            return "/status/" + id;
        }),
        "the test data is returned" : function (results) {
            assert.isObject(results);
            assert.include(results, "passed");
            assert.include(results, "failed");
            assert.include(results, "name");
            assert.include(results, "total");
        },
        "the suite passed" : function (result) {
            assert.ok(result.passed);
            assert.equal(result.failed, 0);
        }
    };

    return suite;
}

function requestRunner (browser) {
    return {
        topic : function (port) {
            var vow = this;
            var tests = server.getEmitterForPort(port);
            var cb = function (event, listener) {
                if ("add" !== event) return;
                vow.callback(null, listener);
                tests.removeListener("newListener", cb);
            };
            tests.on("newListener", cb);
            visitor.visit(
                [ browser || Browser.canonical() ],
                ["http://localhost:" + port + "/?timeout=25000"]
            );
        },
        "the server listens to the test add event" : function (listener) {
            assert.isFunction(listener);
        },
        // Bad tests
        // TODO: Yeti should report errors in its report for these conditions
        // Right now, we only verify the test runner skips them okay
        "and a test with SyntaxError is added" : requestTest("fixture-syntax-error", true),
        "and a missing test is added" : requestTest("fixture-404", true),
        // Normal tests
        "and a test is added" : requestTest("fixture"),
        "and a YUI 2.x test is added" : requestTest("fixture-yui2"),
        "and a test with spaces is added" : requestTest("fixture with spaces/fixture again")
    };
}

vows.describe("Visitors").addBatch({
    "A Yeti server visited by the canonical browser" : {
        topic : httpify(),
        "was requested" : requestRunner("")
    },
    /*
    "A Yeti server visited by Safari" : {
        topic : httpify(),
        "was requested" : requestRunner("eventsource", "Safari")
    },
    "A Yeti server visited by Opera" : {
        topic : httpify(),
        "was requested" : requestRunner("", "opera")
    },
    */
    "A Yeti server visited by Chrome" : {
        topic : httpify(),
        "was requested" : requestRunner("", "chrome")
    }
}).export(module);
