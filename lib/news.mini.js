var TAG_NEWS_EFFECT = "newsTopImgEffect";
var drawNewsTags = function() {
    var b = document.getElementsByClassName(TAG_NEWS_EFFECT);
    for (var f = 0; f < b.length; ++f) {
        var d = b[f];
        var a = d.getAttribute("data-aspect");
        var k = d.getAttribute("data-imgPath");
        var e = d.getAttribute("data-frame");
        var h = d.getAttribute("data-duration");
        if (a && k && e) {
            d.style.backgroundImage = "url(" + _c.sdomain + k + ")";
            var c = _c.clientWidth;
            if (_c._isiPhone) {
                c *= 0.95
            }
            d.style.width = c + "px";
            var j = c * a;
            d.style.height = j + "px";
            var g = d.parentNode;
            g.style.height = j + "px";
            d.style.webkitBackgroundSize = "$1% 100%".replace("$1", e * 100);
            d.style.webkitAnimationName = "BLINK_ANIM_FRAME_$1".replace("$1", e);
            if (h) {
                d.style.webkitAnimationDuration = "$1s".replace("$1", h)
            } else {
                d.style.webkitAnimationDuration = "$1s".replace("$1", e * 0.5)
            }
        }
    }
};
var _postButtonLock = false;

function postCampaign(a) {
    if (_postButtonLock) {
        return
    }
    _postButtonLock = true;
    var b = "/campaign/link/cId/" + a;
    var c = new XMLHttpRequest();
    c.open("POST", b, true);
    c.send("");
    c.onload = function() {
        if (c.readyState == 4 && c.status == 200) {
            _postButtonLock = false;
            var d = JSON.parse(c.responseText);
            if (d.error) {
                alert(d.error)
            }
            if (d.redirectUrl) {
                _c.openBrowser(d.redirectUrl)
            }
        }
    }
}
var toggleFlag = [];

function toggleTarget(a, b, c) {
    if (toggleFlag[a] == 0) {
        _c.removeClass(a, "hide");
        _c.addClass(b, "active");
        setTimeout(function() {
            toggleFlag[a] = 1
        }, 500)
    } else {
        _c.addClass(a, "hide");
        _c.removeClass(b, "active");
        setTimeout(function() {
            toggleFlag[a] = 0
        }, 500)
    }
    if (!c) {
        mainScroll.refresh()
    }
}

function toggleTargetColumn(a, b, c) {
    if (toggleFlag[a] == 0) {
        _c.addClass(a, "hide");
        _c.removeClass(b, "active");
        setTimeout(function() {
            toggleFlag[a] = 1
        }, 500)
    } else {
        _c.removeClass(a, "hide");
        _c.addClass(b, "active");
        setTimeout(function() {
            toggleFlag[a] = 0
        }, 500)
    }
    if (!c) {
        mainScroll.refresh()
    }
}

function category(a) {
    if (toggleFlag[a] == 0) {
        _c.removeClass(a, "active");
        setTimeout(function() {
            toggleFlag[a] = 1
        }, 500)
    } else {
        _c.addClass(a, "active");
        setTimeout(function() {
            toggleFlag[a] = 0
        }, 500)
    }
    mainScroll.refresh()
};
// This is just a sample script. Paste your real code (javascript or HTML) here.

if ('this_is' == /an_example/) {
    of_beautifier();
} else {
    var a = b ? (c % d) : e[f];
}