document.addEventListener("DOMContentLoaded", function() {
    var _c = {clientWidth: 0, clientHeight: 0, fontSize: 0, lineHeight: 0}
    //console.log(window)

    if (window.innerWidth) {
        _c.clientWidth = window.innerWidth
    } else {
        if (document.documentElement && document.documentElement.clientWidth != 0) {
            _c.clientWidth = document.documentElement.clientWidth
        } else {
            if (document.body) {
                _c.clientWidth = document.body.clientWidth
            }
        }
    }
    if (window.innerHeight) {
        _c.clientHeight = window.innerHeight
    } else {
        if (document.documentElement && document.documentElement.clientHeight != 0) {
            _c.clientHeight = document.documentElement.clientHeight
        } else {
            if (document.body) {
                _c.clientHeight = document.body.clientHeight
            }
        }
    }
    _c.fontSize = Math.round((_c.clientWidth / 26.67) * 100) / 100;
    _c.lineHeight = Math.round((_c.clientWidth / 26.67 * 1.4) * 100) / 100

    var b = document.getElementsByTagName("html")[0];
    b.style.fontSize = ((_c.clientWidth / 640) * 100) + "px";
    var a = document.getElementsByTagName("body")[0];
    a.style.fontSize = _c.fontSize + "px";
    a.style.lineHeight = _c.lineHeight + "px";
    a.style.width = _c.clientWidth + "px";
    a.style.height = _c.clientHeight + "px";
    //console.log(_c)

    postSize({})
})

//window.addEventListener("load", postSize, false);
window.addEventListener("resize", postSize, false);
function postSize(e) {
    var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
    if (typeof target != "undefined" && document.body.scrollHeight) {
        //console.log("scheight:", document.body.scrollHeight)
        //target.postMessage(document.body.scrollHeight, "*")
        let json = {height: document.querySelector(".contents-main").scrollHeight, name: window.name}
        target.postMessage(JSON.stringify(json), "*")
        //target.postMessage(window.outerHeight, "*")
        //console.log(json, document.body.clientHeight, document.body.scrollHeight)
        //console.log(document.getElementById("mainScroll").scrollHeight, document.querySelector(".contents-main").scrollHeight)
    }
}