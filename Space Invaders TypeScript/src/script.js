//Helpers functions
function AABBIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah;
}
;
function Bullet(x, y, vely, w, h, color) {
    this.x = x;
    this.y = y;
    this.vely = vely;
    this.width = w;
    this.height = h;
    this.color = color;
}
;
Bullet.prototype.update = function () {
    this.y += this.vely;
};
//ScreenCan
function ScreenCan(width, height) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    this.ctx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);
}
;
ScreenCan.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
};
ScreenCan.prototype.drawSprite = function (sp, x, y) {
    this.ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, sp.w, sp.h);
};
ScreenCan.prototype.drawBullet = function (bullet) {
    this.ctx.fillStyle = bullet.color;
    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
};
ScreenCan.prototype.drawPoints = function (value, x, y) {
    this.ctx.font = "20px Pixel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(value, x, y);
};
ScreenCan.prototype.drawLost = function () {
    this.ctx.font = "20px Pixel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Game over!", 190, 90);
};
ScreenCan.prototype.drawWin = function () {
    this.ctx.font = "20px Pixel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("You win!", 200, 90);
};
ScreenCan.prototype.drawLine = function () {
    this.ctx.beginPath();
    this.ctx.moveTo(20, 640);
    this.ctx.lineTo(484, 640);
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
};
ScreenCan.prototype.drawCredits = function () {
    this.ctx.font = "20px Pixel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("CREDIT 999", 350, 665);
};
ScreenCan.prototype.drawLives = function () {
    this.ctx.font = "20px Pixel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("LIVES", 30, 665);
};
ScreenCan.prototype.drawTitle = function () {
    this.ctx.font = "50px Pixel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("SPACE INVADERS", 32, 60);
};
ScreenCan.prototype.drawInfo = function () {
    this.ctx.font = "20px Pixel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("PRESS SPACEBAR TO START", 105, 550);
};
ScreenCan.prototype.drawScoring = function (value, x, y) {
    this.ctx.font = "20px Pixel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(value, x, y);
};
//Sprite
function Sprite(img, x, y, w, h) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}
;
//InputHandeler
function InputHandeler() {
    this.down = {};
    this.pressed = {};
    var _this = this;
    document.addEventListener("keydown", function (evt) {
        _this.down[evt.keyCode] = true;
    });
    document.addEventListener("keyup", function (evt) {
        delete _this.down[evt.keyCode];
        delete _this.pressed[evt.keyCode];
    });
}
;
InputHandeler.prototype.isDown = function (code) {
    return this.down[code];
};
InputHandeler.prototype.isPressed = function (code) {
    if (this.pressed[code]) {
        return false;
    }
    else if (this.down[code]) {
        return this.pressed[code] = true;
    }
    return false;
};
var display, input, klatki, sprite_frame, level_frame;
var alien_sprite, tank_sprite, cities_sprite, explosion_sprite;
var aliens, dir, tank, bullets, cities;
var lives = 3;
var points = 0;
var hs;
var hs1;
var points2 = "";
var can_points = "SCORE< 1 >";
var can_hs = "HI-SCORE SCORE< 2 >";
var can_credits = "CREDIT 999";
var start = 0;
var explosion = new sound("Zasoby/invaderkilled.wav");
var shoot = new sound("Zasoby/shoot.wav");
var death = new sound("Zasoby/explosion.wav");
var soundtrack = new sound("Zasoby/spaceinvaders1.mp3");
var move1 = new sound("Zasoby/fastinvader1.wav");
var hitted = 0;
var shooted = 0;
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    };
    this.stop = function () {
        this.sound.pause();
    };
}
function main() {
    if (localStorage.getItem("high_score")) {
        hs = localStorage.getItem("high_score");
        hs1 = parseInt(hs);
    }
    else {
        hs = "0";
        hs1 = parseInt(hs);
    }
    display = new ScreenCan(504, 684);
    input = new InputHandeler();
    var img = new Image();
    img.addEventListener("load", function () {
        alien_sprite = [
            [new Sprite(this, 0, 0, 22, 16), new Sprite(this, 0, 16, 22, 16)],
            [new Sprite(this, 22, 0, 16, 16), new Sprite(this, 22, 16, 16, 16)],
            [new Sprite(this, 38, 0, 24, 16), new Sprite(this, 38, 16, 24, 16)]
        ];
        tank_sprite = new Sprite(this, 62, 0, 22, 16);
        cities_sprite = new Sprite(this, 84, 8, 36, 24);
        explosion_sprite = new Sprite(this, 120, 16, 22, 15);
        init();
        run();
    });
    img.src = "Zasoby/invaders.png";
}
;
function init() {
    klatki = 0;
    sprite_frame = 0;
    level_frame = 60;
    dir = 1;
    tank = {
        sprite: tank_sprite,
        x: (display.width - tank_sprite.w) / 2,
        y: display.height - (30 + tank_sprite.h)
    };
    bullets = [];
    cities = {
        canvas: null,
        ctx: null,
        y: tank.y - (30 + cities_sprite.h),
        h: cities_sprite.h,
        init: function () {
            this.canvas = document.createElement("canvas");
            this.canvas.width = display.width;
            this.canvas.height = this.h;
            this.ctx = this.canvas.getContext("2d");
            for (var i = 0; i < 4; i++) {
                this.ctx.drawImage(cities_sprite.img, cities_sprite.x, cities_sprite.y, cities_sprite.w, cities_sprite.h, 68 + 111 * i, 0, cities_sprite.w, cities_sprite.h);
            }
        },
        generateDamage: function (x, y) {
            x = Math.floor(x / 2) * 2;
            y = Math.floor(y / 2) * 2;
            this.ctx.clearRect(x - 2, y - 2, 4, 4);
            this.ctx.clearRect(x + 2, y - 4, 2, 4);
            this.ctx.clearRect(x + 4, y, 2, 2);
            this.ctx.clearRect(x + 2, y + 2, 2, 2);
            this.ctx.clearRect(x - 4, y + 2, 2, 2);
            this.ctx.clearRect(x - 6, y, 2, 2);
            this.ctx.clearRect(x - 4, y - 4, 2, 2);
            this.ctx.clearRect(x - 2, y - 6, 2, 2);
        },
        hits: function (x, y) {
            y -= this.y;
            var data = this.ctx.getImageData(x, y, 1, 1);
            if (data.data[3] != 0) {
                this.generateDamage(x, y);
                return true;
            }
            else {
                return false;
            }
        }
    };
    cities.init();
    aliens = [];
    var rows = [1, 0, 0, 2, 2];
    for (var i = 0; i < rows.length; i++) {
        for (var j = 0; j < 10; j++) {
            var a = rows[i];
            aliens.push({
                sprite: alien_sprite[a],
                x: 30 + j * 30 + [0, 4, 0][a],
                y: 90 + i * 30,
                w: alien_sprite[a][0].w,
                h: alien_sprite[a][0].h,
                rows: a
            });
        }
    }
}
;
function run() {
    var loop = function () {
        update();
        render();
        window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
}
;
function update() {
    tank.x = Math.max(Math.min(tank.x, display.width - (30 + tank_sprite.w)), 30); //rysowanie czolgu x
    if (input.isDown(37) && points2 != "Game Over!" && points2 != "You win!") { //ruch w lewo
        if (start == 1)
            if (hitted == 0) {
                tank.x -= 4;
            }
    }
    if (input.isDown(39) && points2 != "Game Over!" && points2 != "You win!") { //ruch w prawo
        if (start == 1)
            if (hitted == 0) {
                tank.x += 4;
            }
    }
    if (input.isPressed(32) && points2 != "Game Over!" && points2 != "You win!") { //strzal
        if (start == 1) {
            if (hitted == 0) {
                bullets.push(new Bullet(tank.x + 10, tank.y - 15, -8, 2, 6, "#fff"));
                if (start == 1) {
                    shoot.play();
                }
            }
        }
        display.clear();
        start = 1;
    }
    for (var i = 0, length = bullets.length; i < length; i++) { //zanikanie kul
        var b = bullets[i];
        b.update();
        if (b.y + b.height < 0 || b.y > display.height) {
            bullets.splice(i, 1);
            i--;
            length--;
            continue;
        }
        if (b.y + b.height < 0 || b.y > 640) {
            bullets.splice(i, 1);
            i--;
            length--;
            continue;
        }
        var h2 = b.height * 0.5;
        if (cities.y < b.y + h2 && b.y + h2 < cities.y + cities.h) {
            if (cities.hits(b.x, b.y + h2)) {
                bullets.splice(i, 1);
                i--;
                length--;
                continue;
            }
        }
        for (var j = 0, length2 = aliens.length; j < length2; j++) { //kolizja
            var a = aliens[j];
            if (AABBIntersect(b.x, b.y, b.width, b.height, a.x, a.y, a.w, a.h)) {
                explosion.play();
                aliens.splice(j, 1);
                j--;
                length2--;
                bullets.splice(i, 1);
                i--;
                length--;
                switch (a.rows) {
                    case 2: {
                        points += 10;
                        break;
                    }
                    case 0: {
                        points += 20;
                        break;
                    }
                    case 1: {
                        points += 30;
                        break;
                    }
                }
                switch (length2) {
                    case 30: {
                        level_frame = 40;
                        break;
                    }
                    case 10: {
                        level_frame = 30;
                        break;
                    }
                    case 5: {
                        level_frame = 20;
                        break;
                    }
                    case 1: {
                        level_frame = 15;
                        break;
                    }
                    case 0: {
                        move1.stop();
                        points2 = "You win!";
                        if (points > hs1) {
                            localStorage.setItem("high_score", points.toString());
                            hs = localStorage.getItem("high_score");
                            hs1 = parseInt(hs);
                        }
                        setTimeout(function () { location.reload(); }, 5000);
                        break;
                    }
                }
            }
        }
        if (hitted == 0) {
            if (AABBIntersect(b.x, b.y, b.width, b.height, tank.x, tank.y, tank_sprite.w, tank_sprite.h)) {
                lives--;
                death.play();
                hitted = 1;
                setTimeout(function () { hitted = 0; }, 1000);
                if (lives < 1) {
                    points2 = "Game Over!";
                    if (points > hs1) {
                        localStorage.setItem("high_score", points.toString());
                        hs = localStorage.getItem("high_score");
                        hs1 = parseInt(hs);
                    }
                    display.drawLost();
                    level_frame = 0;
                    setTimeout(function () { location.reload(); }, 5000);
                }
            }
        }
    }
    ;
    if (start == 1) {
        if (hitted == 0) {
            if (Math.random() < 0.03 && aliens.length > 0 && points2 != "Game Over!") { //strzal kosmitow
                var a = aliens[Math.round(Math.random() * (aliens.length - 1))];
                for (var i = 0; i < aliens.length; i++) {
                    var b = aliens[i];
                    if (AABBIntersect(a.x, a.y, a.w, 100, b.x, b.y, b.w, b.h)) {
                        a = b;
                    }
                }
                bullets.push(new Bullet(a.x + a.w * 0.5, a.y + a.h, 4, 2, 4, "#fff"));
            }
        }
        klatki++;
        if (hitted == 0) {
            if (klatki % level_frame == 0) { //ruch kosmitow
                move1.play();
                sprite_frame = (sprite_frame + 1) % 2;
                var _max = 0, _min = display.width;
                for (var i = 0; i < aliens.length; i++) {
                    var a = aliens[i];
                    a.x += 30 * dir;
                    _max = Math.max(_max, a.x + a.w);
                    _min = Math.min(_min, a.x);
                }
                if (_max > display.width - 30 || _min < 30) {
                    dir *= -1;
                    for (var i = 0; i < aliens.length; i++) {
                        aliens[i].x += 30 * dir;
                        aliens[i].y += 30;
                        if (aliens[i].y == 510) {
                            points2 = "Game Over!";
                            if (points > hs1) {
                                localStorage.setItem("high_score", points.toString());
                                hs = localStorage.getItem("high_score");
                                hs1 = parseInt(hs);
                            }
                            display.drawLost();
                            level_frame = 0;
                            setTimeout(function () { location.reload(); }, 5000);
                        }
                    }
                }
            }
        }
    }
}
;
function render() {
    if (start == 1) {
        soundtrack.stop();
        display.clear();
        display.drawLine();
        display.drawCredits();
        display.drawLives();
        if (points2 == "Game Over!") {
            display.drawLost();
        }
        else if (points2 == "You win!") {
            display.drawWin();
        }
        display.drawPoints(points, 30, 60);
        display.drawPoints(hs1, 220, 60);
        display.drawPoints(can_points, 10, 30);
        display.drawPoints(can_hs, 200, 30);
        for (var i = 0; i < aliens.length; i++) {
            var a = aliens[i];
            display.drawSprite(a.sprite[sprite_frame], a.x, a.y + 30);
        }
        display.ctx.save();
        for (var i = 0; i < bullets.length; i++) {
            display.drawBullet(bullets[i]);
        }
        display.ctx.restore();
        display.ctx.drawImage(cities.canvas, 0, cities.y - 30);
        if (hitted == 0) {
            display.drawSprite(tank.sprite, tank.x, tank.y - 30);
        }
        else {
            display.drawSprite(explosion_sprite, tank.x, tank.y - 30);
        }
        switch (lives) {
            case 3:
                display.drawSprite(tank.sprite, 95, 649);
                display.drawSprite(tank.sprite, 120, 649);
                display.drawSprite(tank.sprite, 145, 649);
                break;
            case 2:
                display.drawSprite(tank.sprite, 95, 649);
                display.drawSprite(tank.sprite, 120, 649);
                break;
            case 1:
                display.drawSprite(tank.sprite, 95, 649);
                break;
            default:
                break;
        }
    }
    else {
        display.clear();
        display.drawTitle();
        display.drawInfo();
        soundtrack.play();
        move1.stop();
        display.drawSprite(alien_sprite[1][1], 163, 200);
        display.drawSprite(alien_sprite[0][0], 160, 250);
        display.drawSprite(alien_sprite[2][0], 160, 300);
        display.drawScoring("= 30 POINTS", 200, 215);
        display.drawScoring("= 20 POINTS", 200, 265);
        display.drawScoring("= 10 POINTS", 200, 315);
    }
}
;
main();
