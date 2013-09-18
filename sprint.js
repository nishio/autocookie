// Cookie Clicker Sprint
var realCpS = 0;
var prevCookie = 0;

setInterval(function(){
    var cookie = Game.cookies;
    realCpS = cookie - prevCookie;
    prevCookie = cookie
}, 1000);

function getCookies(){
    return Game.cookies
};

function startSprint($){
    var startTime = new Date();

    Game.Reset()

    var teardown = run($)

    var goalWatcher = setInterval(function(){
        if(Game.cookies > 1000){
            console.log('Time: ' + (new Date() - startTime) + ' msec');
            clearInterval(goalWatcher);
            teardown();
        }
    }, 10);
}

function run($){
    var clicker = setInterval(function(btn){
        btn.click()
    }, 0, $('#bigCookie'));

    var buyFirstCursor = setInterval(function(btn){
        if(getCookies() >= 15){
            $('#product0').click()
            clearInterval(buyFirstCursor);
        }
    }, 1);

    var buyRIF = setInterval(function(btn){
        if(getCookies() >= 100){
            $('#upgrade0').click()
            clearInterval(buyRIF);
        }
    }, 1);

    var buyCTP = setInterval(function(btn){
        if(getCookies() >= 400){
            $('#upgrade0').click()
            clearInterval(buyCTP);
        }
    }, 1);

    return function(){
        clearInterval(clicker);
    }
}

console.log('ok.')