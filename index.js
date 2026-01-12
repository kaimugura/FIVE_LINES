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
        case RawTile.STONE: return new Stone(new Falling());
        case RawTile.FALLING_STONE: return new Stone(new Resting());
        case RawTile.BOX: return new Box(new Falling());
        case RawTile.FALLING_BOX: return new FallingBox(new Resting());
        case RawTile.FLUX: return new Flux();
        case RawTile.KEY1: return new Key("#ffcc00", new RemoveLock1());
        case RawTile.LOCK1: return new TileLock("#ffcc00", true);
        case RawTile.KEY2: return new Key("#00ccff", new RemoveLock2());
        case RawTile.LOCK2: return new TileLock("#00ccff", false);
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
function remove(shouldRemove) {
    for (var y = 0; y < map.length; y++)
        for (var x = 0; x < map[y].length; x++)
            if (shouldRemove.check(map[y][x])) {
                map[y][x] = new Air();
            }
}
function check(tile) {
    return tile.isLock1();
}
var RemoveLock1 = /** @class */ (function () {
    function RemoveLock1() {
    }
    RemoveLock1.prototype.check = function (tile) {
        return tile.isLock1();
    };
    return RemoveLock1;
}());
var RemoveLock2 = /** @class */ (function () {
    function RemoveLock2() {
    }
    RemoveLock2.prototype.check = function (tile) {
        return tile.isLock2();
    };
    return RemoveLock2;
}());
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
            map[y][x].update(x, y);
        }
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
    Air.prototype.isLock1 = function () { return false; };
    Air.prototype.isLock2 = function () { return false; };
    Air.prototype.draw = function (g, x, y) {
    };
    Air.prototype.moveHorizontal = function (dx) {
        moveToTile(playerx + dx, playery);
    };
    Air.prototype.moveVertical = function (dy) {
        moveToTile(playerx, playery + dy);
    };
    Air.prototype.update = function (x, y) { };
    return Air;
}());
var Flux = /** @class */ (function () {
    function Flux() {
    }
    Flux.prototype.isAir = function () { return false; };
    Flux.prototype.isLock1 = function () { return false; };
    Flux.prototype.isLock2 = function () { return false; };
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
    Flux.prototype.update = function (x, y) { };
    return Flux;
}());
var Unbreakable = /** @class */ (function () {
    function Unbreakable() {
    }
    Unbreakable.prototype.isAir = function () { return false; };
    Unbreakable.prototype.isLock1 = function () { return false; };
    Unbreakable.prototype.isLock2 = function () { return false; };
    Unbreakable.prototype.draw = function (g, x, y) {
        g.fillStyle = "#999999";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Unbreakable.prototype.moveHorizontal = function (dx) {
    };
    Unbreakable.prototype.moveVertical = function (dy) {
    };
    Unbreakable.prototype.update = function (x, y) { };
    return Unbreakable;
}());
var Player = /** @class */ (function () {
    function Player() {
    }
    Player.prototype.isAir = function () { return false; };
    Player.prototype.isLock1 = function () { return false; };
    Player.prototype.isLock2 = function () { return false; };
    Player.prototype.draw = function (g, x, y) {
    };
    Player.prototype.moveHorizontal = function (dx) {
    };
    Player.prototype.moveVertical = function (dy) {
    };
    Player.prototype.update = function (x, y) { };
    return Player;
}());
var Falling = /** @class */ (function () {
    function Falling() {
    }
    Falling.prototype.isFalling = function () { return true; };
    Falling.prototype.moveHorizontal = function (tile, dx) {
    };
    return Falling;
}());
var Resting = /** @class */ (function () {
    function Resting() {
    }
    Resting.prototype.isFalling = function () { return false; };
    Resting.prototype.moveHorizontal = function (tile, dx) {
        if (map[playery][playerx + dx + dx].isAir()
            && !map[playery + 1][playerx + dx].isAir()) {
            map[playery][playerx + dx + dx] = tile;
            moveToTile(playerx + dx, playery);
        }
    };
    return Resting;
}());
var Stone = /** @class */ (function () {
    function Stone(falling) {
        this.fallStrategy = new FallStrategy(falling);
    }
    Stone.prototype.isAir = function () { return false; };
    Stone.prototype.isLock1 = function () { return false; };
    Stone.prototype.isLock2 = function () { return false; };
    Stone.prototype.draw = function (g, x, y) {
        g.fillStyle = "#0000cc";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Stone.prototype.moveHorizontal = function (dx) {
        this.fallStrategy.getFalling().moveHorizontal(this, dx);
    };
    Stone.prototype.moveVertical = function (dy) {
    };
    Stone.prototype.update = function (x, y) {
        this.fallStrategy.update(this, x, y);
    };
    return Stone;
}());
var Box = /** @class */ (function () {
    function Box(falling) {
        this.fallStrategy = new FallStrategy(falling);
    }
    Box.prototype.isAir = function () { return false; };
    Box.prototype.isLock1 = function () { return false; };
    Box.prototype.isLock2 = function () { return false; };
    Box.prototype.draw = function (g, x, y) {
        g.fillStyle = "#8b4513";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Box.prototype.moveHorizontal = function (dx) {
        this.fallStrategy.getFalling().moveHorizontal(this, dx);
    };
    Box.prototype.moveVertical = function (dy) {
    };
    Box.prototype.update = function (x, y) {
        this.fallStrategy.update(this, x, y);
    };
    return Box;
}());
var FallStrategy = /** @class */ (function () {
    function FallStrategy(falling) {
        this.falling = falling;
    }
    FallStrategy.prototype.getFalling = function () { return this.falling; };
    FallStrategy.prototype.update = function (tile, x, y) {
        this.falling = map[y + 1][x].isAir()
            ? new Falling()
            : new Resting();
        this.drop(tile, x, y);
    };
    FallStrategy.prototype.drop = function (tile, x, y) {
        if (this.falling.isFalling()) {
            map[y + 1][x] = tile;
            map[y][x] = new Air();
        }
    };
    return FallStrategy;
}());
var FallingBox = /** @class */ (function () {
    function FallingBox(falling) {
        this.falling = falling;
    }
    FallingBox.prototype.isAir = function () { return false; };
    FallingBox.prototype.isLock1 = function () { return false; };
    FallingBox.prototype.isLock2 = function () { return false; };
    FallingBox.prototype.draw = function (g, x, y) {
        g.fillStyle = "#8b4513";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    FallingBox.prototype.moveHorizontal = function (dx) {
        this.falling.moveHorizontal(this, dx);
    };
    FallingBox.prototype.moveVertical = function (dy) {
    };
    FallingBox.prototype.update = function (x, y) { };
    return FallingBox;
}());
var Key = /** @class */ (function () {
    function Key(color, removeStrategy) {
        this.color = color;
        this.removeStrategy = removeStrategy;
    }
    Key.prototype.isAir = function () { return false; };
    Key.prototype.isLock1 = function () { return false; };
    Key.prototype.isLock2 = function () { return false; };
    Key.prototype.draw = function (g, x, y) {
        g.fillStyle = this.color;
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    Key.prototype.moveHorizontal = function (dx) {
        remove(this.removeStrategy);
        moveToTile(playerx + dx, playery);
    };
    Key.prototype.moveVertical = function (dy) {
        remove(this.removeStrategy);
        moveToTile(playerx, playery + dy);
    };
    Key.prototype.update = function (x, y) { };
    return Key;
}());
var TileLock = /** @class */ (function () {
    function TileLock(color, lock1) {
        this.color = color;
        this.lock1 = lock1;
    }
    TileLock.prototype.isAir = function () { return false; };
    TileLock.prototype.isLock1 = function () { return this.lock1; };
    TileLock.prototype.isLock2 = function () { return !this.lock1; };
    TileLock.prototype.draw = function (g, x, y) {
        g.fillStyle = this.color;
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
    TileLock.prototype.moveHorizontal = function (dx) {
    };
    TileLock.prototype.moveVertical = function (dy) {
    };
    TileLock.prototype.update = function (x, y) { };
    return TileLock;
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
