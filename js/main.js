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
                return m;
            }
        }
        
        return null;
    }

    getSeriesMovies() {
        let movies = [];
        for(let m of eventMovies) {
            if(m.series == this.series) {
                movies.push(m);
            }
        }
        return movies;
    }

    
}

var eventMovies = [];
for(e of evm) {
    eventMovies.push(new EventMovie(e))
}
//console.log(eventMovies)

var movieFilter = {
    "story-part": "All",
    "event-tag": "All",
    "event-year": "All",
    "chara-series": "All"
}

var getMovies = {
    "story": function() {
        let movies = [];
        console.log("filter:", movieFilter["story-part"])
    
        for(m of storyMovies) {
            let hit = true;

            if(movieFilter["story-part"] != "All") {
                if(m.partname != movieFilter["story-part"]) {
                    hit = false;
                }
            }
    
            if(hit) {
                m["node"] = generateStoryHtml(m);
                movies.push(m);
            }
        }

        return movies;
    },
    
    "event": function() {
        let movies = [];
    
        for(m of eventMovies) {
            let hit = true;

            if(movieFilter["event-tag"] != "All") {
                if(m.tag.indexOf(movieFilter["event-tag"]) == -1) {
                    hit = false;
                }
            }

            if(movieFilter["event-year"] != "All") {
                if(m.year != movieFilter["event-year"]) {
                    hit = false;
                }
            }
    
            if(hit) {
                //console.log(m)
                m["node"] = generateEventHtml(m);
                movies.push(m);
            }
        }

        return movies;
    },

    "chara": function() {
        let movies = [];
        console.log(movieFilter["chara-series"] );
    
        for(m of charaMovies) {
            if(m.pid == "0") continue;
            let hit = true;

            if(movieFilter["chara-series"] != "All") {
                if(m.series != movieFilter["chara-series"]) {
                    hit = false;
                }
            }
    
            if(hit) {
                m["node"] = generateCharaHtml(m);
                movies.push(m);
            }
        }

        return movies;
    }
}


function convertHtml2Iframe(data){
    let blob = new Blob([
        iframetemplate
            .replace(/\{origin\}/g, location.origin)
            .replace(/\{data\}/, data)], { type: 'text/html' })
    let src = URL.createObjectURL(blob)
    return src
}


function showMovies(type, showbadge=false) {
    if(type == "") return;
    let movies = getMovies[type]();
    
    let container = $(`#${type}-movies`);
    container.hide();
    container.html("");
    movies.forEach(m => container.append(m.node))
    container.show();

    let badge = showbadge ? `<span class="badge badge-primary">${movies.length}</span>` : "";
    $(`#nav-${type}-tab`).html(type + badge);
    window.scrollTo(0,0);
}


function generateEventHtml(m) {
    let t = $("#template-event .moviecard > div").clone(true);
    t.find("h5").html(m.title.replace("コラボ ", "コラボ<br />"));

    if(location.href.indexOf("github") != -1) {
        t.find("p.date").html(m.date
            + `<span class="badge badge-primary">${m.evtype}</span>`);
    }
    else {
        t.find("p.date").html(
            m.date + `<span class="badge badge-primary evtype">${m.evtype}</span>`)
        
        if(location.origin == 'http://127.0.0.1:5500') {
            t.find("p.date").append(
            `<span class="badge badge-primary evid">${m.eventid}</span>` +
            `<span class="badge badge-primary refdate">${m.refdate}</span>`)
        }
    }
    if(m.videoid == "" && m.refdate == "") {
        t.find(".ytlink").css("visibility", "hidden")
    }
    else {
        t.find(".ytlink").attr("href", m.ytlink);
    }
    t.find("img").attr("src", `banner/${m.eventid}.avif`);

    if(m.synopsis == false) {
        t.find(".synopsis").hide()
    }

    t.find(".synopsis").click((e) => {
        showEventModal(m);
    })

    return t;
}
//

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



function showEventModal(m) {
    if(typeof(m) == "string") {
        for(mov of eventMovies) {
            if(m == mov.eventid) {
                m = mov
                break
            }
        }
    }

    location.hash = `#${m.eventid}`

    //console.log(m);
    $(".modal-body").html("");
    $(".modal-history ul").html("");
    $(".modal-history").hide();
    $(".modal-banner img").attr("src", `banner/${m.eventid}.avif`);
    $("#exampleModalCenterTitle").html(m.title);

    // History
    if(m.series != "") {
        let movies = m.getSeriesMovies();
        //console.log("his:", movies)
        $(".modal-history").show();
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
            return r.text();
        }).then(data => {
            let src = convertHtml2Iframe(data)
            $(".modal-body").html(`<iframe src="${src}" name="synopsis" style="width:100%; height:1500px;"></iframe>`)
            
            $("#exampleModalCenter").modal()
            
            // シュタゲ
            if(m.eventid == '20240912a' || m.eventid == '20211125a') {
                fetch(`synopsis/thread.php.txt`).then((r) => {
                    return r.text();
                }).then(data => {
                    src = URL.createObjectURL(new Blob([data], { type: 'text/html' }))
                    $(".modal-body")
                        .append(`<div style="height:600px;"></div>`)
                        .append(`<iframe src="${src}" name="stg" style="width:100%; height:1600px;"></iframe>`);
                });
            }
        });
    }
}

function generateCharaHtml(m) {
    let template = $("#template-chara .moviecard > div").clone(true);
    template.find(".card-title").html(m.name);
    let pid = ("000" + m.pid).slice(-3);
    template.find("img").attr("src", `face/${pid}.avif`);

    if(m.series != "アリス・ギア・アイギス") {
        template.find("a.cep").hide()
    }
    template.find("a.cep").attr("href", "https://www.youtube.com/watch?v=" + m.cep)
    template.find("a.kep").attr("href", "https://www.youtube.com/watch?v=" + m.kep)

    return template;
}

function generateStoryHtml(m) {
    if(m.ytid == "") return ""
    
    let template = $("#template-story .moviecard > div").clone(true);
    template.find(".card-title").html(`${m.partname} ${m.section}章 ${m.title}`);
    template.find("a.btn").attr("href", m.ytlink)
    return template;
}


var ddTemplate = `<a class="dropdown-item" href="#" val="{val}">{name}</a>`



function buildDDMenuItem(type, query, movies, attr) {
    let cache = [];
    let dd = $(`#btn-group-template-${type} > div`).clone(true).appendTo(query);
    let container = $(query).find(".dropdown-menu");
    
    movies.forEach(function(m) {
        if(cache.indexOf(m[attr]) != -1 || m[attr] == "-") {
            return;
        }
        let dditem = $(ddTemplate
            .replace(/\{name\}/, m[attr]).replace(/\{val\}/, m[attr]));
        container.append(dditem);
        cache.push(m[attr]);
    });
}


function setDDItemChangeName() {
    let dditem = $(".dropdown-item");

    for(i of dditem) {
        let item = $(i);
        item.click(function(e) {
            let node = $(e.target);
            let val = item.attr("val");
            node.parent().prev().html(val);
            let dd = node.parent().parent().parent();
            let datafilter = dd.attr("data-filter");
            
            console.log(datafilter, val, movieFilter[datafilter]);

            if(movieFilter[datafilter]) {
                movieFilter[datafilter] = val;
            }

            let type = datafilter.split("-")[0];
            showMovies(type, true);
        })
    }
}



function setTabAction() {
    $(".nav-link").click(e => {
        let type = e.target.innerText.replace(/\d+/g, "").toLowerCase();
        if(type != "") {
            $("#nav-tab .badge").remove();
            showMovies(type, true);
        }
    })
}

function showMirie() {
    fetch(`synopsis/20230801b.txt`).then((r) => {
        return r.text();
    }).then(data => {
        let src = convertHtml2Iframe(data)
        let id = location.hash.slice(1)
        $(".modal-body")
            .empty()
            //.append(`<div style="height:600px;"></div>`)
            .append(`<iframe src="${src}" style="width:100%; height:9000px;" name="mirie${id}" id="mirie"></iframe>`);
    });
}

$(document).ready(function(){
    buildDDMenuItem("story", "#story-part-filter", storyMovies, "partname");
    buildDDMenuItem("event", "#event-tag-filter", eventMovies, "tag");
    buildDDMenuItem("event", "#event-year-filter", eventMovies, "year");
    buildDDMenuItem("chara", "#chara-series-filter", charaMovies, "series");
    
    setDDItemChangeName();
    setTabAction();
    
    //showMovies("story");
    showMovies("event", true);
    //showMovies("chara");

    if(location.hash) {
        let evid = location.hash.slice(1)
        if(evid) {
            showEventModal(evid)
        }
    }

    window.addEventListener("message", function (e) {
        console.log("postmessage:", e)
        if(e.origin === location.origin) {
            let obj = JSON.parse(e.data)
            if(obj.height) {
                $(`.modal-body iframe[name=${obj.name}]`).height(obj.height)
            }
            if(obj.event && obj.event == "mirie") {
                showMirie()
            }
        }
    }, false);

    // ダイアログを閉じたらURLのハッシュを空にする
    $('#exampleModalCenter').click(()=> {
        history.pushState({}, '', location.pathname)
    })
    $('button.closebtn').click(()=> {
        history.pushState({}, '', location.pathname)
    })

    // ダイアログクリック時に↑が誤動作するのを防ぐ
    $(".modal-dialog").click(e => {
        e.stopPropagation()
    })

    $("button.close").click(e => {
        $("#exampleModalCenter").hide()
        $(".modal-backdrop").hide()
        $(document.body).removeClass("modal-open")
    })

    $("button.closebtn").click(e => {
        $("#exampleModalCenter").hide()
        $(".modal-backdrop").hide()
        $(document.body).removeClass("modal-open")
    })

    
    if(location.origin != "http://127.0.0.1:5500") {
        $("a.synopsis").hide()
    }
})


