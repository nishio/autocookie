// Cookie Clicker Sprint

// Utilities
var realCPS = 0;
var prevCookie = 0;
var startTime;
var updateRealCPS;
var to_stop = false;

// utilities
function getCookies(){
    return Game.cookies
};

function estimateRestTime(goal){
    var c = getCookies();
    var r = realCPS;
    return Math.floor(goal - c) / r;
}

function getAvailableUpgrades(){
    return Game.UpgradesById.filter(function(x){
        return x.unlocked && !x.bought && x.basePrice <= getCookies()
    });
}

function getNumberOfNonCursor(){
    var num = 0;
    for (var i in Game.Objects) {
        if (Game.Objects[i].name!='Cursor') {
            num += Game.Objects[i].amount;
        }
    }
    return num;
}

function getTotalCPS(){
    return Game.cookiesPs;
}
// derived from https://gist.github.com/teppeis/6576829
var defaultCPS = [0.5, 0.5, 2, 10, 40, 100, 400, 6666, 98765, 999999];

function toNum(str) {
    return Number(str.replace(/,/g, ''));
}

function getCPS(num) {
    if(num == null) return getTotalCPS();
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
    if('DO_HARD_RESET'){
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
    }
    // end HardReset

    realCPS = 0;
    prevCookie = 0;
    updateRealCPS= setInterval(function(){
        var cookie = Game.cookies;
        var diff = cookie - prevCookie
        if(diff > 0){  // if negative, it means 'bought something'
            realCPS = diff;
        }
        prevCookie = cookie
    }, 1000);

    startTime = new Date();
    var teardown = run($, goal);

    to_stop = false
    var goalWatcher = setInterval(function(){
        if(to_stop || Game.cookies > goal){
            console.log('Time: ' + (new Date() - startTime) + ' msec');
            clearInterval(goalWatcher);
            clearInterval(updateRealCPS);
            teardown();
        }
    }, 10);
}

var PRODUCT_NAMES = ["Cursor", "Grandma", "Farm", "Factory", "Mine", "Shipment", "Alchem..", "Portal", "Time m..", "Antima.."];
var SCORE_ATTACK = true;

function run($, goal){
    $('#cookies').style.display = 'none'
    if(SCORE_ATTACK){
        $('#game').style.display = 'none';
    }

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

    var DO_NOTHING = -1;
    var BUY_PRODUCT = -2;
    var NOT_AVAILABLE_PRODUCT = -3;
    var BUY_UPGRADE = -4;
    var PRINT_DETAIL = true && (SCORE_ATTACK == false);
    var subgoal = goal;
    var subgoalStr = 'Goal';
    var buyBestProduct = setInterval(function(){
        var pastTime = (new Date() - startTime) / 1000;
        var c = getCookies();
        var r = realCPS;
        var minTime = (subgoal - c) / r;
        var minChoice = DO_NOTHING;
        var targetCost = 0;
        if(PRINT_DETAIL){
            console.log('subgoal: ' + Math.floor(subgoal) + ' cookie: ' + Math.floor(c) + ', CPS: ' + Math.floor(r));
            console.log('estimated rest time: ' + Math.floor(minTime));
            console.log('estimated total time: ' + Math.floor(minTime + pastTime));
        }
        for(var i = 0; i < 10; i++){
            var c1 = getCost(i);
            var r1 = getCPS(i);
            var t;
            if(c1 < c){
                t = (subgoal - c + c1) / (r + r1);
            }else{
                t = (c1 - c) / r + subgoal / (r + r1);
            }
            if(PRINT_DETAIL){
                console.log(PRODUCT_NAMES[i] + ': cost=' + c1 + ' CPS=' + r1 + ' total time=' + Math.floor(t + pastTime));
            }
            if(minTime > t){
                minTime = t;
                if(c1 < c){ // can buy
                    minChoice = [BUY_PRODUCT, i];
                }else{
                    minChoice = [NOT_AVAILABLE_PRODUCT, i];
                    targetCost = c1;
                }
            }
        }

        if(minChoice != DO_NOTHING){
            var type = minChoice[0];
            if(type == BUY_PRODUCT){
                if(PRINT_DETAIL){
                    console.log('Buying: ' + PRODUCT_NAMES[minChoice[1]]);
                }
                $('#product' + minChoice[1]).click();
                subgoal = goal;
            }else if(type == NOT_AVAILABLE_PRODUCT){
                var prod = PRODUCT_NAMES[minChoice[1]];
                if(PRINT_DETAIL){
                    console.log('Waiting... Want to buy ' + prod);
                }
                subgoal = targetCost;
                subgoalStr = prod;
            }

        }else{
            if(PRINT_DETAIL){
                console.log('Waiting to ' + subgoalStr);
            }
            if(c > subgoal){
                subgoal = goal;
                subgoalStr = 'goal';
            }
        }
    }, 2000);

    var buyUpgrade = setInterval(function(){
        getAvailableUpgrades().forEach(function(x){
            if(x.name == 'Ambidextrous' || x.name == 'Plastic mouse'){
                x.buy();
            }
        })
    }, 2000);

    return function(){
        clearInterval(clicker);
        clearInterval(getGoldenCookie);
        clearInterval(buyBestProduct);
        $('#game').style.display = null;
        $('#cookies').style.display = null;
    }
}

console.log('ok.')