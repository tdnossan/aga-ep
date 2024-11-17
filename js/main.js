import mv from '/data.json' with {type: 'json'}

function uniqueValue(list, attr) {
    let params = []
    for(let item of list) {
        if(item[attr] && !params.includes(item[attr])) {
            params.push(item[attr])
        }
    }
    return params
}

class StoryPart {
    constructor(movies) {
        this.movies = movies
        this.partname = movies[0].partname
        this.part = movies[0].part
    }
}

class StoryMovies {
    constructor(movies) {
        this.movies = []
        console.log(movies)
        let names = uniqueValue(movies, "partname")
        //let parts = []

        for(let n of names) {
            let list = movies.filter(m => m.partname == n)
            this.movies.push(new StoryPart(list))
        }

        console.log(this.movies)
    }
}

class EventMovie {
    constructor(info) {
        for(let key of Object.keys(info)) {
            this[key] = info[key]
        }
    }
    get ytlink() {
        let vid = this.videoid
        let lid = this.listid

        if(this.refdate != "") {
            let ref = this.findRefMovie()
            
            if(ref) {
                vid = ref.videoid
                lid = ref.listid
            }
        }

        return `https://www.youtube.com/watch?v=${vid}&list=${lid}`
    }

    findRefMovie() {
        for(let m of eventMovies) {
            if(m.date == this.refdate && m.series == this.series) {
                return m
            }
        }
        
        return null
    }

    getSeriesMovies() {
        let movies = []
        for(let m of eventMovies) {
            if(m.series == this.series) {
                movies.push(m)
            }
        }
        return movies
    }
}

class MovieCard {
    constructor(movies) {
        this.movies = movies
    }

    show(showbadge=true) {
        let movies = this.filtered
        let container = $(`#${this.type}-movies`)
        container.hide()
        container.html("")
        movies.forEach(m => container.append(m.node))
        container.show()

        // タブにヒット数のバッジを表示
        let badge = showbadge ? `<span class="badge badge-primary">${movies.length}</span>` : ""
        $(`#nav-${this.type}-tab`).html(this.type + badge)
        window.scrollTo(0,0)
    }

    get filtered() {
        let movies = []
    
        for(let m of this.movies) {
            let hit = true

            for(let tag of this.filterTags) {
                if(movieFilter[tag] && movieFilter[tag] != "All") {
                    let key = tag.replace(this.type + "-", "")
                    if(m[key].indexOf(movieFilter[tag]) == -1) {
                        hit = false
                    }
                }
            }
    
            if(hit) {
                //console.log(m)
                m["node"] = this.genHTML(m)
                movies.push(m)
            }
        }

        return movies
    }
}

class EventCard extends MovieCard {
    type = "event"
    filterTags = ["event-tag", "event-year"]

    genHTML(m) {
        let t = $(`#template-event .moviecard > div`).clone(true)
        t.find("h5").html(m.title.replace("コラボ ", "コラボ<br />"))

        t.find("p.date").html(
            m.date + `<span class="badge badge-primary evtype">${m.evtype}</span>`)
        
        if(LOCAL) {
            t.find("p.date").append(
            `<span class="badge badge-primary evid">${m.eventid}</span>` +
            `<span class="badge badge-primary refdate">${m.refdate}</span>`)
        }

        if(m.videoid == "" && m.refdate == "") {
            t.find("a").css("visibility", "hidden")
        }
        else {
            t.find("a").attr("href", m.ytlink)
        }

        t.find("img").attr("src", `banner/${m.eventid}.avif`)

        if(m.synopsis == false) {
            t.find(".synopsis").hide()
        }

        t.find(".synopsis").click((e) => {
            this.modal(m)
        })

        return t
    }

    modal(m) {
        if(typeof(m) == "string") {
            for(let mov of this.movies) {
                if(m == mov.eventid) {
                    m = mov
                    break
                }
            }
            if(typeof(m) == "string") {
                console.log("event not found:", m)
                return
            }
        }
    
        setURLHash(`#${m.eventid}`)
    
        //console.log(m)
        $(".modal-body").html("")
        $(".modal-history ul").html("")
        $(".modal-history").hide()
        $(".modal-banner img").attr("src", `banner/${m.eventid}.avif`)
        $("#exampleModalCenterTitle").html(m.title)
    
        // History
        if(m.series != "") {
            let movies = m.getSeriesMovies()
            //console.log("his:", movies)
            $(".modal-history").show()
            let ul = $(".modal-history ul")
            for(let movie of movies) {
                console.log(movie)
                let history = movie.history != "" ? ` (${movie.history})` : ""
                let active = movie.date == m.date ? " active" : ""
                ul.append(
                    `<li class="list-group-item${active}" aria-current="true">${movie.date}${history}</li>`)
            }
        }
    
        if(m.synopsis) {
            fetch(`synopsis/${m.eventid}.txt`).then((r) => {
                return r.text()
            }).then(data => {
                let src = convertHtml2Iframe(data)
                $(".modal-body").html(`<iframe src="${src}" name="synopsis" style="width:100%; height:1500px;"></iframe>`)
                
                $("#exampleModalCenter").modal()
                
                // シュタゲ
                if(m.eventid == '20240912a' || m.eventid == '20211125a') {
                    fetch(`synopsis/thread.php.txt`).then((r) => {
                        return r.text()
                    }).then(data => {
                        src = URL.createObjectURL(new Blob([data], { type: 'text/html' }))
                        $(".modal-body")
                            .append(`<div style="height:600px;"></div>`)
                            .append(`<iframe src="${src}" name="stg" style="width:100%; height:700px;"></iframe>`)
                    })
                }
            })
        }
    }
}

class CharaCard extends MovieCard {
    type = "chara"
    filterTags = ["chara-series"]

    genHTML(m) {
        let t = $("#template-chara .moviecard > div").clone(true)
        t.find(".card-title").html(m.name)
        let pid = ("000" + m.pid).slice(-3)
    
        t.find("img").attr("src", `face/${pid}.avif`)
    
        if(m.series != "アリス・ギア・アイギス" && !LOCAL) {
            t.find("a.cep").hide()
        }

        t.find("a.cep").attr("href", "https://www.youtube.com/watch?v=" + m.cep)
        t.find("a.kep").attr("href", "https://www.youtube.com/watch?v=" + m.kep)
    
        t.find("button.resume").click((e) => {
            this.modal(m)
        })
    
        return t
    }

    modal(c) {
        if(typeof(c) == "string") {
            c = String(parseInt(c))
            for(let chara of this.movies) {
                if(c == chara.pid) {
                    c = chara
                    break
                }
            }
            if(typeof(c) == "string") {
                console.log("chara not found:", c)
                return
            }
        }
    
        let id = ("00" + c.pid).slice(-3)
        setURLHash(id)
    
        $(".modal-banner img").attr("src", `resume/${id}c.avif`)
        $("#exampleModalCenterTitle").html(c.name)
        //$(".modal-body").html(`<img src="resume/${id}c.avif" style="width: 100%;" />`)
        $("#exampleModalCenter").modal()
    }
}

class StoryCard extends MovieCard {
    type = "story"
    filterTags = ["story-partname"]

    constructor(movies) {
        super(movies)
        //console.log("st:", this)

        this.movies = []
        //console.log(movies)
        let names = uniqueValue(movies, "partname")
        //let parts = []

        for(let n of names) {
            let list = movies.filter(m => m.partname == n)
            this.movies.push(new StoryPart(list))
        }

        //console.log(this.movies)
    }
    genHTML(part) {
        //if(part.ytid == "") return ""
        
        let template = $("#template-story .moviecard > div").clone(true)
        template.find(".card-title").html(`第${part.part}部 ${part.partname}`)

        let html = []
        for(let movie of part.movies) {
            html.push(`<li><a target="_blank" href="${movie.ytlink}">
            <button class="btn btn-primary">録画 <i class="bi-box-arrow-in-up-right"></i></button>
        </a><span class="title">${movie.section}章 ${movie.title}</span></li>`)
        }
        //console.log(html)

        template.find(".card-body .list").html(html.join(""))
        //template.find("a").attr("href", m.ytlink)
        return template
    }
    /*
    genHTML(m) {
        if(m.ytid == "") return ""
        
        let template = $("#template-story .moviecard > div").clone(true)
        template.find(".card-title").html(`${m.partname} ${m.section}章 ${m.title}`)
        template.find("a").attr("href", m.ytlink)
        return template
    }*/

    modal(m) {
    }
}

const LOCAL = location.origin == 'http://127.0.0.1:5500'

var eventMovies = []
mv.event.map(m => eventMovies.push(new EventMovie(m)))

var evmov = new EventCard(eventMovies)
var chmov = new CharaCard(mv.chara)
var stmov = new StoryCard(mv.story)

//var stmovs = new StoryMovies(mv.story)

console.log(uniqueValue(mv.story, "partname"))

var movieFilter = {
    "story-partname": "All",
    "event-tag": "All",
    "event-year": "All",
    "chara-series": "All",
    "watched": []
}

function loadSetting() {
    let ls = localStorage.getItem("setting")
    if(ls) {
        let obj = JSON.parse(ls)
        for(let key in movieFilter) {
            if(obj[key]) {
                movieFilter[key] = obj[key]
            }
        }
        console.log(movieFilter)
    }
}

function saveSetting() {
    localStorage.setItem("setting", JSON.stringify(movieFilter))
}

function convertHtml2Iframe(data){
    let blob = new Blob([
        iframetemplate
            .replace(/\{origin\}/g, location.origin)
            .replace(/\{data\}/, data)], { type: 'text/html' })
    let src = URL.createObjectURL(blob)
    return src
}

var iframetemplate = `
<!doctype html>
<html lang="ja">
<head>
<link href="{origin}/css/common.mini.css" rel="stylesheet">
<link href="{origin}/css/core.mini.css" rel="stylesheet">
<link href="{origin}/css/news.mini.css" rel="stylesheet">
<link href="{origin}/css/synopsis.css" rel="stylesheet">
</head>
<body>
<div class="wrapper newsBg" id="mainScroll">
<div class="scroller" style="left:0px; right:0px;">
<div class="contents-main news-contents">
{data}
</div>
</div>
</div>
</body>
<script src="{origin}/lib/iframe.js" type="text/javascript"></script>
</html>
`

function buildDDMenuItem(type, query, movies, attr) {
    let ddTemplate = `<a class="dropdown-item" href="#" val="{val}" name="{name}">{name}</a>`
    let cache = []
    let dd = $(`#btn-group-template-${type} > div`).clone(true).appendTo(query)
    let container = $(query).find(".dropdown-menu")
    
    let itemnames = uniqueValue(movies, attr)
    for(let name of itemnames) {
        let dditem = $(`<a class="dropdown-item" href="#" val="${name}">${name}</a>`)
        container.append(dditem)
    }
    /*
    return 

    movies.forEach(function(m) {
        let val = m[attr]
        if(cache.indexOf(val) != -1 || val == "-") {
            return
        }
        let dditem = $(`<a class="dropdown-item" href="#" val="${val}">${val}</a>`)
        container.append(dditem)
        cache.push(val)
    })*/
}


function setDDItemChangeName() {
    let dditem = $(".dropdown-item")

    for(let i of dditem) {
        let item = $(i)
        item.click(function(e) {
            let node = $(e.target)
            let val = item.attr("val")
            node.parent().prev().html(val)
            let dd = node.parent().parent().parent()
            let datafilter = dd.attr("data-filter")
            
            //console.log(datafilter, val, movieFilter[datafilter])

            if(movieFilter[datafilter]) {
                movieFilter[datafilter] = val
            }
            saveSetting()

            let type = datafilter.split("-")[0]
            showMovies(type, true)
        })
    }
}

function changeTab(type) {
    $(`#nav-${type}-tab`).addClass("active")
    $(`#nav-${type}`).addClass("active")
    showMovies(type)
}

function showMovies(type, badge=true) {
    if(type == "event")
        evmov.show(badge)
    else if(type == "chara")
        chmov.show(badge)
    else if(type == "story")
        stmov.show(badge)
}

function setTabAction() {
    $(".nav-link").click(e => {
        let type = e.target.innerText.replace(/\d+/g, "").toLowerCase()
        if(type != "") {
            $("#nav-tab .badge").remove()
            showMovies(type, true)
        }
    })
}

function showMirie() {
    fetch(`synopsis/20230801b.txt`).then((r) => {
        return r.text()
    }).then(data => {
        let src = convertHtml2Iframe(data)
        let id = location.hash.slice(1)
        $(".modal-body")
            .empty()
            .append(`<iframe src="${src}" style="width:100%; height:9000px;" name="mirie${id}" id="mirie"></iframe>`)
    })
}

function initModal() {
    $(".modal-body").html("")
    $(".modal-history ul").html("")
    $(".modal-history").hide()
    $(".modal-banner img").attr("src", "")
    $("#exampleModalCenterTitle").html("")
}

function setURLHash(hash) {
    location.hash = hash
}

function eraseURLHash() {
    history.pushState({}, '', location.pathname)
}

$(document).ready(function(){
    loadSetting()
    buildDDMenuItem("story", "#story-partname-filter", mv.story, "partname")
    buildDDMenuItem("event", "#event-tag-filter", mv.event, "tag")
    buildDDMenuItem("event", "#event-year-filter", mv.event, "year")
    buildDDMenuItem("chara", "#chara-series-filter", mv.chara, "series")
    
    setDDItemChangeName()
    setTabAction()
    initModal()

    // 保存したフィルター
    for(let key in movieFilter) {
        console.log(key)
        if(movieFilter[key] != "All") {
            let btn = $(`#${key}-filter button`)
            btn.html(movieFilter[key])
        }
    }

    if(location.hash && LOCAL) {
        let evid = location.hash.slice(1)
        if(evid && evid.match(/\d+[abc]$/)) {
            console.log("show event:", evid)
            changeTab("event")
            evmov.modal(evid)
        }
        if(evid && evid.match(/\d{3}$/)) {
            console.log("show chara:", evid)
            changeTab("chara")
            chmov.modal(evid)
        }
    }
    else {
        // 初期表示：Event
        changeTab("event")
        //changeTab("chara")
    }

    // iframeサイズ自動調整
    window.addEventListener("message", function (e) {
        //console.log("postmessage:", e)
        if(e.origin === location.origin) {
            let obj = JSON.parse(e.data)
            if(obj.height) {
                $(`.modal-body iframe[name=${obj.name}]`).height(obj.height)
            }
            if(obj.event && obj.event == "mirie") {
                showMirie()
            }
        }
    }, false)
    
    // モーダルを閉じた時
    $("#exampleModalCenter").on("hidden.bs.modal", function () {
        initModal()
        eraseURLHash()
    })

    if(!LOCAL) {
        $("button.synopsis").hide()
        //$("button.resume").hide()
    }
})


