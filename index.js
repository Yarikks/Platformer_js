var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var level = [
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "x                                       x                                 x",
    "x                                       x                                 x",
    "x                                       x                          $      x",
    "x                                       x                         ~~      x",
    "x                                       x $                               x",
    "x$$$$         <                   <     xxx!!!x       xxx!!!x             x",
    "xxxxxxx                                 x xxxxx       xxxxxxx             x",
    "x                                                                         x",
    "x                                               -                         x",
    "x                                                                         x",
    "x      ---------------                                                    x",
    "x        >                                         x              <       x",
    "x $                                                x                      x",
    "xxxx  .. ..  ....  ....                   ~     $  x                 @  + x",
    "x                          xxxxxxxxxxx          $  xxxxxxxxxxxxxxxxxxxxxxxx",
    "x                             x                ~~~                        x",
    "x                             x                                        <  x",
    "x                             x     $                    ~~      ~~~~~~~~~x",
    "x                             xxxx...~...~~                               x",
    "x                                                         x               x",
    "x +$              <x                                      x               x",
    "x~~~~~~!!!!~~~~!!~~x         x       <                    x   <         $ x",
    "xxxxxxxxxxxxxxxxxxxx         xxx-----------------xxxxxxxxxxxxxxxxxxxxxxxxxx",
    "x                                                                         x",
    "x                                 -                                       x",
    "x                                                                         x",
    "x                      ==             <                            $ $ $+ x",
    "xxxxxxx~~~~~xxxxxxxx!!!!!!!!!!!!xxxxxxxxxxx!!!!xxxxxxxxxx!!xxxxxx!!xxxxxxxx",
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
];
// air
// lava            !
// wall            x
// coins           *
// jumpPlatform    =
// player          @
// platform        -
// ice             ~
// heal            +
// mud             ,

var converted = [];

var scale = 0.5;
var size = 32 * scale;
var scaletime = 1;
scale = scale * 1 / scaletime;
var FPS = 60 * scaletime;
var then, now, past, fpsInterval;
var objects = [];
var enemies = [];
var coins = 0;

var playerPosX;
var playerPosY;
var gravitation = 0.8 * scale;
var end = false;

var time = 0;
var counter = 0;

var playerimg, playerwin, deadplayer, airimg, coinimg, platformimg, jumpimg, lavaimg, healimg, mudimg, iceimg, wallimg, duckimg, enemyimg;

init = () => {
    playerimg = new Image(size, size);
    playerimg.src = './img/player.png';

    playerwin = new Image(size, size);
    playerwin.src = './img/playerwin.png';

    deadplayer = new Image(size, size);
    deadplayer.src = './img/deadplayer64.png';

    airimg = new Image(size, size);
    airimg.src = './img/air.png';

    coinimg = new Image(size, size);
    coinimg.src = './img/coin.png';

    platformimg = new Image(size, size);
    platformimg.src = './img/platform.png';

    jumpimg = new Image(size, size);
    jumpimg.src = './img/jump.png';

    lavaimg = new Image(size, size);
    lavaimg.src = './img/lava.png';

    healimg = new Image(size, size);
    healimg.src = './img/healg.png';

    mudimg = new Image(size, size);
    mudimg.src = './img/mud.png';

    iceimg = new Image(size, size);
    iceimg.src = './img/ice.png';

    wallimg = new Image(size, size);
    wallimg.src = './img/wall.png';

    enemyimg = new Image(size, size);
    enemyimg.src = './img/enemy.png';
}

init();

function Object(x, y, width, height, pic) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.pic = pic;
}

function Enemy(x, y, width, height, pic, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.pic = pic;
    this.speed = speed;
}

var player = {
    width: size,
    height: size - 1,
    xPrev: 0,
    yPrev: 0,
    x: 0,
    y: 0,
    xVelocity: 0,
    yVelocity: 0,
    pic: playerimg,
    points: 0,
    health: 100,
    inAir: true,
    inLava: false,
    isDead: false,
    isAttaked: false
};

var controller = {
    left: false,
    right: false,
    up: false,
    down: false,
    KeyListener: function (evt) {
        var keyState = (evt.type == "keydown") ? true : false;
        switch (evt.keyCode) {
            case 37:
                controller.left = keyState;
                break;
            case 39:
                controller.right = keyState;
                break;
            case 38:
                controller.up = keyState;
                break;
            case 40:
                controller.down = keyState;
                break;
        }
    }
};

var drawTile = (tile) => {
    if (tile.pic != airimg) {
        context.drawImage(tile.pic, tile.x, tile.y, size, size);
    }
}

var readTileImage = (tile) => {
    switch (tile) {
        case "@":
            return playerimg;
        case "x":
            return wallimg;
        case "!":
            return lavaimg;
        case "$":
            return coinimg;
        case "-":
            return platformimg;
        case "~":
            return iceimg;
        case "+":
            return healimg;
        case "=":
            return jumpimg;
        case ".":
            return mudimg;
        case "<":
            return enemyimg;
        default:
            return airimg;
    }
}

var startAnimation = (fps) => {
    fpsInterval = 1000 / fps;
    then = window.performance.now();
    animation(then);
}

var animation = (newTime) => {
    window.requestAnimationFrame(animation);
    now = newTime;
    past = now - then;
    if (past > fpsInterval) {
        then = now - (past % fpsInterval);
        draw();
        timer();
    }
}

var isCollided = (obst, obj) => {
    if (obj.x + obj.width > obst.x
        && obj.x < obst.x + obst.width
        && obj.y < obst.y + obst.height
        && obj.y + obj.height > obst.y) {
        return true;
    }
    else {
        return false;
    }
}

var collideHandler = (obst, obj, pic) => {
    if (isCollided(obst, obj)) {
        if (pic == wallimg || pic == iceimg || pic == jumpimg || pic == mudimg) {
            if (obj.yPrev + obj.height <= obst.y) {
                obj.y = obst.y - obj.height;
                obj.yVelocity = 0;
                obj.inAir = false;
                if (pic == jumpimg) {
                    obj.yVelocity = -6 * scale;
                }
                if (pic == mudimg) {
                    obj.yVelocity = +7 * scale;
                    obj.xVelocity *= 0.3;
                }
                if (pic == iceimg) {
                    obj.xVelocity *= 1.2;
                }
            }
            else if (obst.x + obst.width <= obj.xPrev)
            {
                obj.x = obst.x + obst.width;
                obj.xVelocity = 0;
            }
            else if (obj.xPrev + obst.width <= obst.x)
            {
                obj.x = obst.x - obj.width;
                obj.xVelocity = 0;
            }
            else if (obj.yPrev > obst.y + obst.height) {
                obj.y = obst.y + obst.height;
                obj.yVelocity = 0;
            }
        }

        if (pic == lavaimg) {
            player.health -= 1;
            player.inLava = true;
        }

        if (pic == platformimg) {
            if (controller.down) {
                console.debug("down");
            }
            else if (obj.yPrev + obj.height <= obst.y) {
                obj.y = obst.y - obj.height;
                obj.yVelocity = 0;
                obj.inAir = false;
            }
            else if (obj.yPrev > obst.y + obst.height) {
                obj.y = obst.y + obst.height;
                obj.yVelocity *= 1;
            }
        }

        if (pic == healimg) {
            player.health += 100;
            return true;
        }
        if (pic == coinimg) {
            player.points++;
            return true;
        }
        if (pic == enemyimg) {
            player.health -= 3;
        }
    }
}

var showCounter = () => {
    context.fillStyle = '#000000';
    context.font = 'normal 30px lucida console';
    context.fillText("coins : " + player.points, convertedLevel[0].length * size - size * 14, size * 5);
    context.font = 'normal 10px lucida console';

    if (player.health <= 0) {
        player.health = 0;
        player.pic = deadplayer;
        player.isDead = true;
    }

    context.fillText(player.health, player.x - 1, player.y - 5);
}

var timer = () => {
    if (!end) {
        counter++
        if (counter == 60) {
            time++;
            counter = 0;
        }
    }
}

var draw = () => {
    if (!player.isDead) {
        context.fillStyle = '#e6fbff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        player.xPrev = player.x;
        player.yPrev = player.y;

        if (controller.up && player.inAir == false) {
            player.yVelocity -= 15 * scale;
            player.inAir = true;
        }

        if (controller.right) {
            player.xVelocity += 1 * scale;
        }
        if (controller.left) {
            player.xVelocity -= 1 * scale;
        }

        for (let index = 0; index < objects.length; index++) {
            drawTile(objects[index]);
        }

        player.yVelocity += gravitation;

        if (player.inLava) {
            player.xVelocity *= 0.6;
            player.yVelocity += 0.4 * scale;
            player.inLava = false;
        }
        player.x += player.xVelocity;
        player.y += player.yVelocity;
        player.xVelocity *= 0.8;

        showCounter();
        drawTile(player);
        enemiesHandler();

        for (let i = 0; i < objects.length; i++) {
            if (collideHandler(objects[i], player, objects[i].pic) == true) {
                objects[i].pic = airimg;
            }
        }
    }
    else {
        player.pic = deadplayer;
    }
}

var enemiesHandler = () => {
    for (let index = 0; index < enemies.length; index++) {
        drawTile(enemies[index]);
        enemies[index].x += enemies[index].speed;
        collideHandler(enemies[index], player, enemyimg);

        for (let j = 0; j < objects.length; j++) {
            if (objects[j].pic != airimg) {
                if (isCollided(objects[j], enemies[index])) {
                    enemies[index].speed *= -1;
                }
            }
        }
    }
}

var setObjects = () => {
    for (let i = 0; i < convertedLevel.length; i++) {
        for (let j = 0; j < convertedLevel[0].length; j++) {
            let object = new Object(size * j, size * i, size, size, readTileImage(convertedLevel[i][j]));
            objects.push(object);

            if (object.pic == playerimg) {
                player.x = object.x;
                player.y = object.y;
                console.debug(object.pic);
                object.pic = airimg;
            }

            if (object.pic == enemyimg) {
                let enemy = new Enemy(object.x, object.y, object.width, object.height, object.pic, -3)
                enemies.push(enemy);
                object.pic = airimg;
            }

            if (object.pic == coinimg) {
                coins++;

            }
        }
    }
}

var convertLevel = (lvl) => {
    for (let i = 0; i < lvl.length; i++) {
        converted.push(level[i].split(''));
    }
    return converted;
}

document.getElementById('btn1').onclick = () => {
    document.getElementById('btn1').style.display = 'none';
    convertedLevel = convertLevel(level);
    canvas.width = convertedLevel[0].length * size;
    canvas.height = convertedLevel.length * size;
    setObjects();
    startAnimation(FPS);
}

window.addEventListener("keydown", controller.KeyListener);
window.addEventListener("keyup", controller.KeyListener);