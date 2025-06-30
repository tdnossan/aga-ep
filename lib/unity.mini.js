var APPLICATION_HOST = "alice.colopl.jp";
var TOOL_HOST = "tool-alice.colopl.jp";
var APPLICATION_NAME = "アリス・ギア・アイギス";
var SUPPORT_ADDRESS = ""; //_APP_INFO.mail;
var SUPPORT_KAKIN_ADDRESS = ""; //_APP_INFO.mailPayment;

function UnityCore() {
    this.sdomain = "";
    this.environment = "development";
    var a = location.host;
    if (a == APPLICATION_HOST || a == TOOL_HOST) {
        this.sdomain = "http://i-cf.alice.colopl.jp";
        this.environment = "production"
    } else {
        if (a == "stg." + this.rootHost) {
            this.sdomain = "http://stg.i." + APPLICATION_HOST;
            this.environment = "staging"
        }
    }
    this.androidUserAgents = ["Android"];
    this.iPhoneUserAgents = ["iPhone", "iPad", "iPod"];
    this.smartPhoneUserAgents = ["iPhone", "iPod", "Android", "dream", "CUPCAKE", "incognito", "webmate"];
    this.clientWidth;
    this.clientHeight;
    this.elements = {};
    this.hasTouch = "ontouchstart" in window;
    this.onTouchType = this.hasTouch ? "touchstart" : "mousedown";
    this.onMoveType = this.hasTouch ? "touchmove" : "mousemove";
    this.onEndType = this.hasTouch ? "touchend" : "mouseup";
    this.onHoverEventType = this.hasTouch ? "touchstart" : "mouseover";
    this.onHoverOutEventType = this.hasTouch ? "touchend" : "mouseout";
    this._isAndroid = null;
    this._isiPhone = null;
    this._isSmartPhone = null
}
UnityCore.prototype = {
    _$: function(c, a) {
        if (a) {
            return document.getElementById(c)
        }
        var b = this.elements[c];
        if (b) {
            return b
        }
        b = document.getElementById(c);
        this.elements[c] = b;
        return b
    },
    _parseElem: function(a) {
        return (typeof(a) != "object") ? this._$(a) : a
    },
    _clear: function() {
        this.elements = {}
    },
    getFullPath: function(a) {
        if (a.match(/:\/\//)) {
            return a
        }
        var b = location.protocol + "//" + location.hostname;
        if (location.port) {
            b += ":" + location.port
        }
        return b + a
    },
    getParam: function(c) {
        var e = location.search.split("?");
        if (e.length < 2) {
            return ""
        }
        var d = e[1].split("&");
        for (var b = 0; b < d.length; b++) {
            var a = d[b].split("=");
            if (a[0] == c && a.length == 2) {
                return decodeURIComponent(a[1])
            }
        }
        return ""
    },
    getCookie: function(b) {
        if (!document.cookie) {
            return ""
        }
        var c = document.cookie.split("; ");
        for (var a = 0; a < c.length; a++) {
            var e = c[a].split("=");
            if (e[0] == b) {
                var d = e[1];
                return d
            }
        }
        return ""
    },
    pageTransition: function(a) {
        var b = this;
        if (location.href == b.getFullPath(a)) {
            return
        }
        b.addVersion(a, function(c) {
            location.href = c
        })
    },
    addVersion: function(b, d) {
        if (b.match(/\?.*v=/)) {
            d(b);
            return
        }
        var a = b.split("#");
        var c = "";
        if (a.length > 1) {
            b = a[0];
            c = a[1]
        }
        b += b.indexOf("?") < 0 ? "?" : "&";
        b += "v=" + this._getCurrentVersion();
        if (c) {
            b += "#" + c
        }
        d(b)
    },
    _getCurrentVersion: function() {
        var a = parseInt(new Date() / 1000);
        if (location.search.length > 1) {
            var d = location.search.substring(1);
            var g = d.split("&");
            for (var c = 0; c < g.length; c++) {
                var f = g[c].split("=");
                var b = f[0];
                var e = f[1];
                if (b == "v") {
                    a = e;
                    break
                }
            }
        }
        return a
    },
    getRandom: function(b, a) {
        return Math.floor(Math.random() * (a - b + 1) + b)
    },
    tap: function(b, e) {
        var c = this;
        var d = this._parseElem(b);
        var g, f, i, h, a;
        d.addEventListener(this.onTouchType, function(k) {
            var j = (k.touches) ? k.touches[0] : k;
            a = 1;
            g = j.pageX;
            f = j.pageY;
            i = g;
            h = f
        });
        d.addEventListener(this.onMoveType, function(k) {
            if (!a) {
                return
            }
            var j = (k.touches) ? k.touches[0] : k;
            i = j.pageX;
            h = j.pageY
        });
        d.addEventListener(this.onEndType, function(k) {
            a = 0;
            var j = Math.abs(g - i);
            var l = Math.abs(f - h);
            if (j > 8 || l > 8) {
                return
            }
            c._callEventFunction(e, k)
        })
    },
    _callEventFunction: function(b, c) {
        var a = this;
        if (a.isFunction(b)) {
            b(c)
        } else {
            if ("handleEvent" in b) {
                b.handleEvent(c)
            }
        }
    },
    hover: function(d, a, c) {
        if (!a) {
            a = "hover"
        }
        var e = this._parseElem(d);
        var b = this;
        e.addEventListener(this.onHoverEventType, function(f) {
            b.addClass(e, a);
            if (c) {
                b.removeClass(e, c)
            }
        });
        e.addEventListener(this.onHoverOutEventType, function(f) {
            b.removeClass(e, a);
            if (c) {
                b.addClass(e, c)
            }
        })
    },
    walkElements: function(d, f) {
        var e = this._parseElem(d);
        f(e);
        var c = e.childNodes;
        var a = c.length;
        for (var b = 0; b < a; ++b) {
            this.walkElements(c[b], f)
        }
    },
    initializeOnLoad: function() {
        window.UnityEx = {
            call: function(v) {
                var i = document.createElement("IFRAME");
                i.setAttribute("src", "unity:" + v);
                document.documentElement.appendChild(i);
                i.parentNode.removeChild(i);
                i = null
            }
        };
        this.getClientSize();
        var r = document.getElementsByClassName("redirect");
        for (var m = 0; m < r.length; ++m) {
            _c.tap(r[m], function(v) {
                var i = v.currentTarget;
                _c.pageTransition(i.getAttribute("data-redirect"))
            })
        }
        var b = document.getElementsByClassName("mailto");
        for (var m = 0; m < b.length; ++m) {
            _c.tap(b[m], function(y) {
                var x = y.currentTarget;
                var v = x.getAttribute("data-address");
                var w = x.getAttribute("data-subject");
                var i = x.getAttribute("data-body");
                if (v) {
                    _c.mailTo(v, w, i)
                }
            })
        }
        var u = document.getElementsByClassName("mailtosupport");
        for (var m = 0; m < u.length; ++m) {
            _c.tap(u[m], function(y) {
                var x = y.currentTarget;
                var v = SUPPORT_ADDRESS;
                var w = APPLICATION_NAME + ":お問い合わせ";
                var i = "";
                if (v) {
                    _c.mailTo(v, w, i)
                }
            })
        }
        var g = document.getElementsByClassName("mailtokakin");
        for (var m = 0; m < g.length; ++m) {
            _c.tap(g[m], function(y) {
                var x = y.currentTarget;
                var v = SUPPORT_KAKIN_ADDRESS;
                var w = APPLICATION_NAME + ":カラット購入に関するお問い合わせ";
                var i = "";
                if (v) {
                    _c.mailTo(v, w, i)
                }
            })
        }
        var h = document.getElementsByClassName("browser");
        for (var m = 0; m < h.length; ++m) {
            _c.tap(h[m], function(v) {
                var i = v.currentTarget;
                _c.openBrowser(i.getAttribute("data-url"))
            })
        }
        var d = document.getElementsByClassName("campaign");
        var f = new XMLHttpRequest();
        for (var m = 0; m < d.length; ++m) {
            _c.tap(d[m], function(v) {
                if (f.readyState != 0) {
                    return
                }
                var i = v.currentTarget;
                f.open("GET", i.getAttribute("data-url") + "?ajax=1", true);
                f.onload = function(x) {
                    if (f.status == 200 && f.getResponseHeader("Content-Type") == "application/json") {
                        var w = JSON.parse(f.responseText);
                        _c.openBrowser(w.url)
                    }
                    f.abort()
                };
                f.send(null)
            })
        }
        var k = document.getElementsByClassName("apvUpperCheck");
        for (var m = 0; m < k.length; ++m) {
            var p = k[m];
            var e = p.getAttribute("data-apv");
            if (e && _c.isEnableClientVersion(e)) {
                p.style.display = "block"
            }
        }
        var o = document.getElementsByClassName("apvLowerCheck");
        for (var m = 0; m < o.length; ++m) {
            var p = o[m];
            var e = p.getAttribute("data-apv");
            if (e && !_c.isEnableClientVersion(e)) {
                p.style.display = "block"
            }
        }
        if (_c.isAndroid()) {
            var t = document.getElementsByClassName("showAndroid");
            for (var m = 0; m < t.length; ++m) {
                t[m].style.display = "block"
            }
        }
        if (_c.isiPhone()) {
            var t = document.getElementsByClassName("showiPhone");
            for (var m = 0; m < t.length; ++m) {
                t[m].style.display = "block"
            }
        }
        var s = document.getElementsByClassName("goto");
        for (var m = 0; m < s.length; ++m) {
            _c.tap(s[m], function(w) {
                var i = w.currentTarget;
                var v = i.getAttribute("data-page");
                if (v) {
                    _c.goToPage(v)
                }
            })
        }
        var c = document.getElementsByClassName("checkPurchase");
        for (var m = 0; m < c.length; ++m) {
            _c.tap(c[m], function(w) {
                var v = w.currentTarget;
                var i = v.getAttribute("data-flag");
                if (i) {
                    _c.checkPurchase(i)
                }
            })
        }
        var n = document.getElementsByClassName("close");
        for (var m = 0; m < n.length; ++m) {
            _c.tap(n[m], function(i) {
                _c.closeWindow()
            })
        }
        var a = document.getElementsByClassName("openOpinionBox");
        for (var m = 0; m < a.length; ++m) {
            _c.tap(a[m], function(i) {
                _c.openOpinionBox()
            })
        }
        var l = document.getElementsByClassName("openStore");
        for (var m = 0; m < l.length; ++m) {
            _c.tap(l[m], function(i) {
                _c.openStore()
            })
        }
        var q = document.getElementsByClassName("openRegisterAccount");
        for (var m = 0; m < q.length; ++m) {
            _c.tap(q[m], function(i) {
                _c.openRegisterAccount()
            })
        }
        var j = document.getElementsByClassName("clearCache");
        for (var m = 0; m < j.length; ++m) {
            _c.tap(j[m], function(i) {
                _c.clearCache()
            })
        }
    },
    getClientSize: function() {
        if (window.innerWidth) {
            this.clientWidth = window.innerWidth
        } else {
            if (document.documentElement && document.documentElement.clientWidth != 0) {
                this.clientWidth = document.documentElement.clientWidth
            } else {
                if (document.body) {
                    this.clientWidth = document.body.clientWidth
                }
            }
        }
        if (window.innerHeight) {
            this.clientHeight = window.innerHeight
        } else {
            if (document.documentElement && document.documentElement.clientHeight != 0) {
                this.clientHeight = document.documentElement.clientHeight
            } else {
                if (document.body) {
                    this.clientHeight = document.body.clientHeight
                }
            }
        }
        this.fontSize = Math.round((this.clientWidth / 26.67) * 100) / 100;
        this.lineHeight = Math.round((this.clientWidth / 26.67 * 1.4) * 100) / 100
    },
    isAndroid: function() {
        if (this._isAndroid === null) {
            var a = new RegExp(this.androidUserAgents.join("|"), "i");
            this._isAndroid = a.test(navigator.userAgent)
        }
        return this._isAndroid
    },
    isiPhone: function() {
        if (this._isiPhone === null) {
            var a = new RegExp(this.iPhoneUserAgents.join("|"), "i");
            this._isiPhone = a.test(navigator.userAgent)
        }
        return this._isiPhone
    },
    isSmartPhone: function() {
        if (this._isSmartPhone === null) {
            var a = new RegExp(this.smartPhoneUserAgents.join("|"), "i");
            this._isSmartPhone = a.test(navigator.userAgent)
        }
        return this._isSmartPhone
    },
    isFunction: function(a) {
        return (Object.prototype.toString.call(a) == "[object Function]")
    },
    isUndefined: function(a) {
        return typeof a === "undefined"
    },
    unityCall: function(a) {
        if (typeof Unity != "undefined") {
            Unity.call(a)
        } else {
            if (UnityEx) {
                UnityEx.call(a)
            } else {
                alert(a)
            }
        }
    },
    mailTo: function(b, c, a) {
        if (!b) {
            return
        }
        if (!c) {
            c = ""
        }
        if (!a) {
            a = ""
        }
        c = _APP_INFO.userId + ":" + c;
        a += "\n\n\n\n\n※以下は削除しないで下さい\n" + _APP_INFO.userAgent + "\nアプリバージョン：" + _APP_INFO.apv + "\n機種情報：" + _APP_INFO.device;
        return this.unityCall("mailto:" + b + "?subject=" + encodeURI(c.replace(/\\n/g, "\n")) + "&body=" + encodeURI(a.replace(/\\n/g, "\n")))
    },
    openBrowser: function(a) {
        return this.unityCall("browser:" + a)
    },
    checkPurchase: function(a) {
        return this.unityCall("checkPurchase:" + a)
    },
    goToPage: function(a) {
        return this.unityCall("goto:" + a)
    },
    closeWindow: function() {
        return this.unityCall("close:")
    },
    openOpinionBox: function() {
        return this.unityCall("openOpinionBox:")
    },
    openStore: function() {
        return this.unityCall("openStore:")
    },
    openRegisterAccount: function() {
        this.closeWindow();
        return this.unityCall("openregisteraccount")
    },
    clearCache: function() {
        return this.unityCall("clearCache")
    },
    isEnableClientVersion: function(f) {
        var c = TENNIS_APV.split(".");
        var e = f.split(".");
        var d = c.length;
        var a = e.length;
        if (d != a) {
            return false
        }
        for (var b = 0; b < d; b++) {
            apvNum = c[b];
            targetNum = e[b];
            if (b == d - 1) {
                if (targetNum <= apvNum) {
                    return true
                }
            } else {
                if (targetNum < apvNum) {
                    return true
                } else {
                    if (targetNum > apvNum) {
                        return false
                    }
                }
            }
        }
        return false
    },
    checkImgLoaded: function(d, g, a) {
        var f = this._parseElem(d);
        g();
        var e = f.getElementsByTagName("img");
        for (var b = 0; b < e.length; ++b) {
            if (!e[b].complete) {
                var c = this;
                setTimeout(function() {
                    c.checkImgLoaded(f, g, a)
                }, a);
                return
            }
        }
    },
    addClass: function(d, c) {
        var e = this._parseElem(d);
        var b = e.className.split(" ");
        for (var a = 0; a < b.length; a++) {
            if (b[a] == c) {
                return
            }
        }
        b.push(c);
        e.className = b.join(" ")
    },
    removeClass: function(c, d) {
        var e = this._parseElem(c);
        if (d) {
            var b = e.className.split(" ");
            for (var a = 0; a < b.length; a++) {
                if (b[a] == d) {
                    b.splice(a, 1)
                }
            }
            e.className = b.join(" ")
        } else {
            e.className = ""
        }
    },
    toggleClass: function(d, a) {
        var e = this._parseElem(d);
        var b = e.getAttribute("class");
        var c = this;
        if (!b || b.indexOf(a) == -1) {
            c.addClass(e, a)
        } else {
            c.removeClass(e, a)
        }
    },
    ajax: function(d, g, a) {
        var f = new XMLHttpRequest();
        var c = [];
        for (var b in g) {
            c.push(b + "=" + encodeURIComponent(g[b]))
        }
        var e = c.join("&");
        f.open("POST", d, true);
        f.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        f.onreadystatechange = function() {
            if (this.readyState == XMLHttpRequest.DONE) {
                if (this.status == 200) {
                    var h = f.responseText;
                    if (this.getResponseHeader("Content-Type") == "application/json") {
                        var h = JSON.parse(h)
                    }
                    a(null, h)
                } else {
                    a(new Error(h), null)
                }
            }
        };
        f.send(e)
    }
};
_c = new UnityCore();

function initialize() {}

function loaded() {}
document.addEventListener("DOMContentLoaded", function() {
    _c.initializeOnLoad();
    var b = document.getElementsByTagName("html")[0];
    b.style.fontSize = ((_c.clientWidth / 640) * 100) + "px";
    var a = document.getElementsByTagName("body")[0];
    a.style.fontSize = _c.fontSize + "px";
    a.style.lineHeight = _c.lineHeight + "px";
    a.style.width = _c.clientWidth + "px";
    a.style.height = _c.clientHeight + "px";
    console.log(_c)
    loaded()
}, false);
window.onunload = function() {};
window.onload = function() {
    initialize()
};