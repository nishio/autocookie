// Cookie Clicker Sprint
function startSprint($){
    var startTime = new Date();
    var realCpS = 0;
    var prevCookie = 0;


    function getCookie(){
        return Game.cookie
    };

    setInterval(function(){
        var cookie = Game.cookies;
        realCpS = cookie - prevCookie;
        prevCookie = cookie
    }, 1000);

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

    return function(){
        clearInterval(clicker);
    }
}

console.log('ok.')