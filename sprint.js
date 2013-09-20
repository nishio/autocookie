// Cookie Clicker Sprint

// Utilities
var realCPS = 0;
var prevCookie = 0;
var startTime;
var updateRealCPS;
var to_stop = false;
var to_repeat = false;

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
    console.log('start sprint');
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
            console.log('end sprint');
            if(to_repeat){
                setTimeout(function(){startSprint($, goal)}, 0);
            }
        }
    }, 10);
}

var PRODUCT_NAMES = ["Cursor", "Grandma", "Farm", "Factory", "Mine", "Shipment", "Alchem..", "Portal", "Time m..", "Antima.."];
var SCORE_ATTACK = false;

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
    var NOT_AVAILABLE_UPGRADE = -5;
    var PRINT_DETAIL_FOR_EACH_PRODUCTS = false && !SCORE_ATTACK;
    var PRINT_DETAIL_FOR_EACH_UPGRADES = true && !SCORE_ATTACK;
    var PRINT_DETAIL = true && !SCORE_ATTACK;
    var subgoal = goal;
    var subgoalStr = 'Goal';

    var buyBestProduct = setInterval(function(){
        var pastTime = (new Date() - startTime) / 1000;
        var c = getCookies();
        var r = realCPS;
        var minTime = (subgoal - c) / r;
        minTime += 0.1;  // Waiting goal is boring, so I add bias to buy things
        var minChoice = DO_NOTHING;
        var targetCost = 0;
        if(PRINT_DETAIL){
            var restTime = estimateRestTime(goal);
            console.log('\n*****\n' +
                        'estimated rest time: ' + restTime);
            console.log('estimated total time: ' + Math.floor(restTime + pastTime));
            console.log('subgoal: ' + Math.floor(subgoal) + ' cookie: ' + Math.floor(c) + ', CPS: ' + Math.floor(r));
        }

        // find best product
        var productCPS = [];
        for(var i = 0; i < 10; i++){
            var c1 = getCost(i);
            var r1 = getCPS(i);
            productCPS.push(r1);
            var t;
            if(c1 < c){
                t = (subgoal - c + c1) / (r + r1);
            }else{
                t = (c1 - c) / r + subgoal / (r + r1);
            }
            if(PRINT_DETAIL_FOR_EACH_PRODUCTS){
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

        // find best upgrade
        var CLICK_PER_SECOND = 200;
        var HANDMADE_COOKIES = realCPS - getCPS();
        var NON_CURSOR = getNumberOfNonCursor();
        function twice(i){return function(){return productCPS[i]}};
        var UPGRADES_BENEFITS = {
            'Reinforced index finger':
              function(){return HANDMADE_COOKIES},
            'Carpal tunnel prevention cream':
              function(){return HANDMADE_COOKIES},
            'Ambidextrous':
              function(){return HANDMADE_COOKIES},
            'Thousand fingers':
              function(){return HANDMADE_COOKIES * NON_CURSOR * 0.1},
            'Million fingers':
              function(){return HANDMADE_COOKIES * NON_CURSOR * 0.5},
            'Billion fingers':
              function(){return HANDMADE_COOKIES * NON_CURSOR * 2},

            'Forwards from grandma':
              function(){return productCPS[1] / 5 * 3}, // 0.5->0.8
            'Steel-plated rolling pins': twice(1),
            'Lubricated dentures': twice(1),
            'Prune juice': twice(1),
            'Farmer grandmas': twice(1),
            'Worker grandmas': twice(1),
            'Miner grandmas': twice(1),
            'Cosmic grandmas': twice(1),
            'Transmuted grandmas': twice(1),
            'Altered grandmas': twice(1),

            'Cheap hoes':
              function(){return productCPS[2] / 2 * 0.5}, // 2->2.5
            'Fertilizer': twice(2),
            'Cookie trees': twice(2),
            'Genetically-modified cookies': twice(2),

            'Sturdier conveyor belts':
              function(){return productCPS[3] / 10 * 4}, // 10->14
            'Child labor': twice(3),
            'Sweatshop': twice(3),
            'Radium reactors': twice(3),

            'Sugar gas':
              function(){return productCPS[4] / 40 * 10}, // 40->50
            'Megadrill': twice(4),
            'Ultradrill': twice(4),
            'Ultimadrill': twice(4),

            'Vanilla nebulae':
              function(){return productCPS[5] / 100 * 30}, // 100->130
            'Wormholes': twice(5),
            'Frequent flyer': twice(5),
            'Warp drive': twice(5),

            'Antimony':
              function(){return productCPS[6] / 400 * 100}, // 400->500
            'Essence of dough': twice(6),
            'True chocolate': twice(6),
            'Ambrosia': twice(6),

            'Ancient tablet':
              function(){return productCPS[7] / 6666 * 1666}, // 6666 += 1666
            'Insane oatling workers': twice(7),

            'cookie':
              function(){return realCPS / Game.globalCpsMult * (Game.globalCpsMult + x.power * 0.01)},

            'Kitten helpers':
              function(){return realCPS * (1 + Game.milkProgress * 0.05)},
            'Kitten workers':
              function(){return realCPS * (1 + Game.milkProgress * 0.1)},
            'Kitten engineers':
              function(){return realCPS * (1 + Game.milkProgress * 0.2)},
            'Kitten overseers':
              function(){return realCPS * (1 + Game.milkProgress * 0.3)},

            'Plastic mouse':
              function(){return CLICK_PER_SECOND * getCPS() * 0.01},
            'Iron mouse':
              function(){return CLICK_PER_SECOND * getCPS() * 0.01},
            'Titanium mouse':
              function(){return CLICK_PER_SECOND * getCPS() * 0.01},
            'Adamantium mouse':
              function(){return CLICK_PER_SECOND * getCPS() * 0.01},
        };

        getAvailableUpgrades().forEach(function(x){
            var c1 = x.basePrice;
            var r1 = UPGRADES_BENEFITS[x.name];
            if(r1 == null){
                if(x.type == 'cookie'){
                    r1 = UPGRADES_BENEFITS['cookie'];
                }else{
                    return;
                }
            }
            r1 = r1(x);

            var t;
            if(c1 < c){
                t = (subgoal - c + c1) / (r + r1);
            }else{
                t = (c1 - c) / r + subgoal / (r + r1);
            }
            if(PRINT_DETAIL_FOR_EACH_UPGRADES){
                console.log(x.name + ': cost=' + c1 + ' CPS=' + r1 + ' total time=' + Math.floor(t + pastTime));
            }
            if(minTime > t){
                minTime = t;
                if(c1 < c){ // can buy
                    minChoice = [BUY_UPGRADE, x];
                }else{
                    minChoice = [NOT_AVAILABLE_UPGRADE, x];
                    targetCost = c1;
                }
            }
        })

        if(minChoice != DO_NOTHING){
            var type = minChoice[0];
            if(type == BUY_PRODUCT){
                if(PRINT_DETAIL){
                    console.log('Buying Product: ' + PRODUCT_NAMES[minChoice[1]]);
                }
                $('#product' + minChoice[1]).click();
                subgoal = goal;
                subgoalStr = 'goal';
            }else if(type == BUY_UPGRADE){
                if(PRINT_DETAIL){
                    console.log('Buying Upgrade: ' + minChoice[1].name);
                }
                minChoice[1].buy();
                subgoal = goal;
                subgoalStr = 'goal';
            }else if(type == NOT_AVAILABLE_PRODUCT){
                var prod = PRODUCT_NAMES[minChoice[1]];
                if(PRINT_DETAIL){
                    console.log('Waiting... Want to buy ' + prod);
                }
                subgoal = targetCost;
                subgoalStr = prod;
            }else if(type == NOT_AVAILABLE_UPGRADE){
                var prod = minChoice[1].name;
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

    return function(){
        clearInterval(clicker);
        clearInterval(getGoldenCookie);
        clearInterval(buyBestProduct);
        $('#game').style.display = null;
        $('#cookies').style.display = null;
    }
}

console.log('ok.')