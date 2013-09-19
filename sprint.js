// Cookie Clicker Sprint

// Utilities
var realCPS = 0;
var prevCookie = 0;

setInterval(function(){
    var cookie = Game.cookies;
    realCPS = cookie - prevCookie;
    prevCookie = cookie
}, 1000);

function getCookies(){
    return Game.cookies
};

// derived from https://gist.github.com/teppeis/6576829
var defaultCPS = [0.5, 0.5, 2, 10, 40, 100, 400, 6666, 98765, 999999];

function toNum(str) {
    return Number(str.replace(/,/g, ''));
}

function getCPS(num) {
    var el = document.getElementById('rowInfoContent' + num);
    if (!el) return defaultCPS[num];
    var match = /• ([\d,]+)[\s\S]*producing ([\d,.]+)/.exec(el.innerText);
    if (match[1] === '0') {
        return defaultCPS[num];
    }
    return toNum(match[2]) / toNum(match[1]);
}

function getCost(num) {
  var a = document.querySelector('#product' + num + ' .price').innerText;
  return toNum(a);
}
// end: derived from https://gist.github.com/teppeis/6576829

function startSprint($, goal){
    // Game.HardReset
    for (var i in Game.AchievementsById){
	var me=Game.AchievementsById[i];
	me.won=0;
    }
    Game.AchievementsOwned=0;
    Game.goldenClicks=0;
    Game.missedGoldenClicks=0;
    Game.Reset(1);
    Game.cookiesReset=0;
    Game.prestige=[];
    Game.CalculatePrestige();
    // end HardReset

    realCPS = 0;
    prevCookie = 0;

    var startTime = new Date();
    var teardown = run($, goal);

    var goalWatcher = setInterval(function(){
        if(Game.cookies > goal){
            console.log('Time: ' + (new Date() - startTime) + ' msec');
            clearInterval(goalWatcher);
            teardown();
        }
    }, 10);
}

function run($, goal){
    $('#game').style.display = 'none';
    var clicker = setInterval(function(btn){
        btn.click();
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

    var getGoldenCookie = setInterval(function(){
        var x = $('#goldenCookie');
        if(x){
            x.click();
        }
    }, 1000);

    return function(){
        clearInterval(clicker);
        clearInterval(getGoldenCookie);
        $('#game').style.display = null;
    }
}

console.log('ok.')