var TILE_SIZE = 30;
var FPS = 30;
var SLEEP = 1000 / FPS;
var RawTile;
(function (RawTile) {
    RawTile[RawTile["AIR"] = 0] = "AIR";
    RawTile[RawTile["FLUX"] = 1] = "FLUX";
    RawTile[RawTile["UNBREAKABLE"] = 2] = "UNBREAKABLE";
    RawTile[RawTile["PLAYER"] = 3] = "PLAYER";
    RawTile[RawTile["STONE"] = 4] = "STONE";
    RawTile[RawTile["FALLING_STONE"] = 5] = "FALLING_STONE";
    RawTile[RawTile["BOX"] = 6] = "BOX";
    RawTile[RawTile["FALLING_BOX"] = 7] = "FALLING_BOX";
    RawTile[RawTile["KEY1"] = 8] = "KEY1";
    RawTile[RawTile["LOCK1"] = 9] = "LOCK1";
    RawTile[RawTile["KEY2"] = 10] = "KEY2";
    RawTile[RawTile["LOCK2"] = 11] = "LOCK2";
})(RawTile || (RawTile = {}));
var RawInput;
(function (RawInput) {
    RawInput[RawInput["UP"] = 0] = "UP";
    RawInput[RawInput["DOWN"] = 1] = "DOWN";
    RawInput[RawInput["LEFT"] = 2] = "LEFT";
    RawInput[RawInput["RIGHT"] = 3] = "RIGHT";
})(RawInput || (RawInput = {}));
var playerx = 1;
var playery = 1;
var rawMap = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 3, 0, 1, 1, 2, 0, 2],
    [2, 4, 2, 6, 1, 2, 0, 2],
    [2, 8, 4, 1, 1, 2, 0, 2],
    [2, 4, 1, 1, 1, 9, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
];
var map;
function assertExhausted(x) {
    throw new Error("Unexpected object: " + x);
}
function transformTile(tile) {
    switch (tile) {
        case RawTile.AIR: return new Air();
        case RawTile.PLAYER: return new Player();
        case RawTile.UNBREAKABLE: return new Unbreakable();
        case RawTile.STONE: return new Stone(false);
        case RawTile.FALLING_STONE: return new Stone(true);
        case RawTile.BOX: return new Box();
        case RawTile.FALLING_BOX: return new FallingBox();
        case RawTile.FLUX: return new Flux();
        case RawTile.KEY1: return new Key1();
        case RawTile.LOCK1: return new Lock1();
        case RawTile.KEY2: return new Key2();
        case RawTile.LOCK2: return new Lock2();
        default: assertExhausted(tile);
    }
}
function transformMap() {
    map = new Array(rawMap.length);
    for (var y = 0; y < rawMap.length; y++) {
        map[y] = new Array(rawMap[y].length);
        for (var x = 0; x < rawMap[y].length; x++) {
            map[y][x] = transformTile(rawMap[y][x]);
        }
    }
}
var inputs = [];
function removeLock1() {
    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
            if (map[y][x].isLock1()) {
                map[y][x] = new Air();
            }
        }
    }
}
function removeLock2() {
    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
            if (map[y][x].isLock2()) {
                map[y][x] = new Air();
            }
        }
    }
}
function update() {
    handleInputs();
    updateMap();
}
function handleInputs() {
    while (inputs.length > 0) {
        var input = inputs.pop();
        input.handle();
    }
}
var Right = /** @class */ (function () {
    function Right() {
    }
    Right.prototype.handle = function () {
        map[playery][playerx + 1].moveHorizontal(1);
    };
    return Right;
}());
var Left = /** @class */ (function () {
    function Left() {
    }
    Left.prototype.handle = function () {
        map[playery][playerx - 1].moveHorizontal(-1);
    };
    return Left;
}());
var Up = /** @class */ (function () {
    function Up() {
    }
    Up.prototype.handle = function () {
        map[playery - 1][playerx].moveVertical(-1);
    };
    return Up;
}());
var Down = /** @class */ (function () {
    function Down() {
    }
    Down.prototype.handle = function () {
        map[playery + 1][playerx].moveVertical(1);
    };
    return Down;
}());
function updateMap() {
    for (var y = map.length - 1; y >= 0; y--) {
        for (var x = 0; x < map[y].length; x++) {
            updateTile(x, y);
        }
    }
}
function updateTile(x, y) {
    if (map[y][x].isStony()
        && map[y + 1][x].isAir()) {
        map[y + 1][x] = new Stone(true);
        map[y][x] = new Air();
    }
    else if (map[y][x].isBoxy()
        && map[y + 1][x].isAir()) {
        map[y + 1][x] = new FallingBox();
        map[y][x] = new Air();
    }
    else if (map[y][x].isFallingStone()) {
        map[y][x] = new Stone(false);
    }
    else if (map[y][x].isFallingBox()) {
        map[y][x] = new Box();
    }
}
function draw() {
    var g = createGraphics();
    drawMap(g);
    drawPlayer(g);
}
function createGraphics() {
    var canvas = document.getElementById("GameCanvas");
    var g = canvas.getContext("2d");
    g.clearRect(0, 0, canvas.width, canvas.height);
    return g;
}
function drawMap(g) {
    // Draw map
    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
            map[y][x].draw(g, x, y);
        }
    }
}
function drawPlayer(g) {
    // Draw player
    g.fillStyle = "#ff0000";
    g.fillRect(playerx * TILE_SIZE, playery * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}
function gameLoop() {
    var before = Date.now();
    update();
    draw();
    var after = Date.now();
    var frameTime = after - before;
    var sleep = SLEEP - frameTime;
    setTimeout(function () { return gameLoop(); }, sleep);
}
function moveToTile(newx, newy) {
    map[playery][playerx] = new Air();
    map[newy][newx] = new Player();
    playerx = newx;
    playery = newy;
}
var Air = /** @class */ (function () {
    function Air() {
    }
    Air.prototype.isAir = function () { return true; };
    Air.prototype.isFallingStone = function () { return false; };
    Air.prototype.isFallingBox = function () { return false; };
    Air.prototype.isLock1 = function () { return false; };
    Air.prototype.isLock2 = function () { return false; };
    Air.prototype.isStony = function () { return false; };
    Air.prototype.isBoxy = function () { return false; };
    Air.prototype.draw = function (g, x, y) {
    };
    Air.prototype.moveHorizontal = function (dx) {
        moveToTile(playerx + dx, playery);
    };
    Air.prototype.moveVertical = function (dy) {
        moveToTile(playerx, playery + dy);
    };
    return Air;
}());
var Flux = /** @class */ (function () {
    function Flux() {
    }
    Flux.prototype.isAir = function () { return false; };
    Flux.prototype.isFallingStone = function () { return false; };
    Flux.prototype.isFallingBox = function () { return false; };
    Flux.prototype.isLock1 = function () { return false; };
    Flux.prototype.isLock2 = function () { return false; };
    Flux.prototype.isStony = function () { return false; };
    Flux.prototype.isBoxy = function () { return false; };
    Flux.prototype.draw = function (g, x, y) {
        g.fillStyle = "#ccffcc";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Flux.prototype.moveHorizontal = function (dx) {
        moveToTile(playerx + dx, playery);
    };
    Flux.prototype.moveVertical = function (dy) {
        moveToTile(playerx, playery + dy);
    };
    return Flux;
}());
var Unbreakable = /** @class */ (function () {
    function Unbreakable() {
    }
    Unbreakable.prototype.isAir = function () { return false; };
    Unbreakable.prototype.isFallingStone = function () { return false; };
    Unbreakable.prototype.isFallingBox = function () { return false; };
    Unbreakable.prototype.isLock1 = function () { return false; };
    Unbreakable.prototype.isLock2 = function () { return false; };
    Unbreakable.prototype.isStony = function () { return false; };
    Unbreakable.prototype.isBoxy = function () { return false; };
    Unbreakable.prototype.draw = function (g, x, y) {
        g.fillStyle = "#999999";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Unbreakable.prototype.moveHorizontal = function (dx) {
    };
    Unbreakable.prototype.moveVertical = function (dy) {
    };
    return Unbreakable;
}());
var Player = /** @class */ (function () {
    function Player() {
    }
    Player.prototype.isAir = function () { return false; };
    Player.prototype.isFallingStone = function () { return false; };
    Player.prototype.isFallingBox = function () { return false; };
    Player.prototype.isLock1 = function () { return false; };
    Player.prototype.isLock2 = function () { return false; };
    Player.prototype.isStony = function () { return false; };
    Player.prototype.isBoxy = function () { return false; };
    Player.prototype.draw = function (g, x, y) {
    };
    Player.prototype.moveHorizontal = function (dx) {
    };
    Player.prototype.moveVertical = function (dy) {
    };
    return Player;
}());
var Stone = /** @class */ (function () {
    function Stone(falling) {
        this.falling = falling;
    }
    Stone.prototype.isAir = function () { return false; };
    Stone.prototype.isFallingStone = function () { return this.falling; };
    Stone.prototype.isFallingBox = function () { return false; };
    Stone.prototype.isLock1 = function () { return false; };
    Stone.prototype.isLock2 = function () { return false; };
    Stone.prototype.isStony = function () { return true; };
    Stone.prototype.isBoxy = function () { return false; };
    Stone.prototype.draw = function (g, x, y) {
        g.fillStyle = "#0000cc";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Stone.prototype.moveHorizontal = function (dx) {
        if (this.isFallingStone() === false) {
            if (map[playery][playerx + dx + dx].isAir()
                && !map[playery + 1][playerx + dx].isAir()) {
                map[playery][playerx + dx + dx] = this;
                moveToTile(playerx + dx, playery);
            }
        }
        else if (this.isFallingStone() === true) {
        }
    };
    Stone.prototype.moveVertical = function (dy) {
    };
    return Stone;
}());
var Box = /** @class */ (function () {
    function Box() {
    }
    Box.prototype.isAir = function () { return false; };
    Box.prototype.isFallingStone = function () { return false; };
    Box.prototype.isFallingBox = function () { return false; };
    Box.prototype.isLock1 = function () { return false; };
    Box.prototype.isLock2 = function () { return false; };
    Box.prototype.isStony = function () { return false; };
    Box.prototype.isBoxy = function () { return true; };
    Box.prototype.draw = function (g, x, y) {
        g.fillStyle = "#8b4513";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Box.prototype.moveHorizontal = function (dx) {
        if (map[playery][playerx + dx + dx].isAir()
            && !map[playery + 1][playerx + dx].isAir()) {
            map[playery][playerx + dx + dx] = this;
            moveToTile(playerx + dx, playery);
        }
    };
    Box.prototype.moveVertical = function (dy) {
    };
    return Box;
}());
var FallingBox = /** @class */ (function () {
    function FallingBox() {
    }
    FallingBox.prototype.isAir = function () { return false; };
    FallingBox.prototype.isFallingStone = function () { return false; };
    FallingBox.prototype.isFallingBox = function () { return true; };
    FallingBox.prototype.isLock1 = function () { return false; };
    FallingBox.prototype.isLock2 = function () { return false; };
    FallingBox.prototype.isStony = function () { return false; };
    FallingBox.prototype.isBoxy = function () { return true; };
    FallingBox.prototype.draw = function (g, x, y) {
        g.fillStyle = "#8b4513";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    FallingBox.prototype.moveHorizontal = function (dx) {
    };
    FallingBox.prototype.moveVertical = function (dy) {
    };
    return FallingBox;
}());
var Key1 = /** @class */ (function () {
    function Key1() {
    }
    Key1.prototype.isAir = function () { return false; };
    Key1.prototype.isFallingStone = function () { return false; };
    Key1.prototype.isFallingBox = function () { return false; };
    Key1.prototype.isLock1 = function () { return false; };
    Key1.prototype.isLock2 = function () { return false; };
    Key1.prototype.isStony = function () { return false; };
    Key1.prototype.isBoxy = function () { return false; };
    Key1.prototype.draw = function (g, x, y) {
        g.fillStyle = "#ffcc00";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Key1.prototype.moveHorizontal = function (dx) {
        removeLock1();
        moveToTile(playerx + dx, playery);
    };
    Key1.prototype.moveVertical = function (dy) {
        removeLock1();
        moveToTile(playerx, playery + dy);
    };
    return Key1;
}());
var Lock1 = /** @class */ (function () {
    function Lock1() {
    }
    Lock1.prototype.isAir = function () { return false; };
    Lock1.prototype.isFallingStone = function () { return false; };
    Lock1.prototype.isFallingBox = function () { return false; };
    Lock1.prototype.isLock1 = function () { return true; };
    Lock1.prototype.isLock2 = function () { return false; };
    Lock1.prototype.isStony = function () { return false; };
    Lock1.prototype.isBoxy = function () { return false; };
    Lock1.prototype.draw = function (g, x, y) {
        g.fillStyle = "#ffcc00";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Lock1.prototype.moveHorizontal = function (dx) {
    };
    Lock1.prototype.moveVertical = function (dy) {
    };
    return Lock1;
}());
var Key2 = /** @class */ (function () {
    function Key2() {
    }
    Key2.prototype.isAir = function () { return false; };
    Key2.prototype.isFallingStone = function () { return false; };
    Key2.prototype.isFallingBox = function () { return false; };
    Key2.prototype.isLock1 = function () { return false; };
    Key2.prototype.isLock2 = function () { return false; };
    Key2.prototype.isStony = function () { return false; };
    Key2.prototype.isBoxy = function () { return false; };
    Key2.prototype.draw = function (g, x, y) {
        g.fillStyle = "#00ccff";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Key2.prototype.moveHorizontal = function (dx) {
        removeLock2();
        moveToTile(playerx + dx, playery);
    };
    Key2.prototype.moveVertical = function (dy) {
        removeLock2();
        moveToTile(playerx, playery + dy);
    };
    return Key2;
}());
var Lock2 = /** @class */ (function () {
    function Lock2() {
    }
    Lock2.prototype.isAir = function () { return false; };
    Lock2.prototype.isFallingStone = function () { return false; };
    Lock2.prototype.isFallingBox = function () { return false; };
    Lock2.prototype.isLock1 = function () { return false; };
    Lock2.prototype.isLock2 = function () { return true; };
    Lock2.prototype.isStony = function () { return false; };
    Lock2.prototype.isBoxy = function () { return false; };
    Lock2.prototype.draw = function (g, x, y) {
        g.fillStyle = "#00ccff";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Lock2.prototype.moveHorizontal = function (dx) {
    };
    Lock2.prototype.moveVertical = function (dy) {
    };
    return Lock2;
}());
window.onload = function () {
    transformMap();
    gameLoop();
};
var LEFT_KEY = "ArrowLeft";
var UP_KEY = "ArrowUp";
var RIGHT_KEY = "ArrowRight";
var DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", function (e) {
    if (e.key === LEFT_KEY || e.key === "a")
        inputs.push(new Left());
    else if (e.key === UP_KEY || e.key === "w")
        inputs.push(new Up());
    else if (e.key === RIGHT_KEY || e.key === "d")
        inputs.push(new Right());
    else if (e.key === DOWN_KEY || e.key === "s")
        inputs.push(new Down());
});
