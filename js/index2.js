document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const textContainer = document.getElementById('text-container');

    let pi, cx, cy, playerZ, playerX, playerY, playerVX, playerVY, playerVZ, pitch, yaw, pitchV, yawV, scale, seedTimer, seedInterval, seedLife, gravity, seeds, sparkPics, s, sparks, pow1, pow2, pow3, pow4, frames, textOptions, colorOptions;

    function initVars() {
        pi = Math.PI;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        cx = canvas.width / 2;
        cy = canvas.height / 2;
        playerZ = -25;
        playerX = playerY = playerVX = playerVY = playerVZ = pitch = yaw = pitchV = yawV = 0;
        scale = 600;
        seedTimer = 0; seedInterval = 5, seedLife = 100; gravity = .02;
        seeds = new Array();
        sparkPics = new Array();
        s = "https://cantelope.org/NYE/";
        for (let i = 1; i <= 10; ++i) {
            const sparkPic = new Image();
            sparkPic.src = s + "spark" + i + ".png";
            sparkPics.push(sparkPic);
        }
        sparks = new Array();
        pow1 = new Audio(s + "pow1.ogg");
        pow2 = new Audio(s + "pow2.ogg");
        pow3 = new Audio(s + "pow3.ogg");
        pow4 = new Audio(s + "pow4.ogg");
        frames = 0;

        // 定义烟花炸开时显示的文字选项
        textOptions = ['新年快乐','蛇年快乐', '2025', '祝你幸福', '万事如意','你是最好的' ,'千般万语，只为与君共赏','一切顺利，吉祥如意','by——YJ'];

        // 定义烟花炸开时显示的文字颜色选项
        colorOptions = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
    }

    function rasterizePoint(x, y, z) {
        x -= playerX;
        y -= playerY;
        z -= playerZ;
        const p = Math.atan2(x, z);
        const d = Math.sqrt(x * x + z * z);
        x = Math.sin(p - yaw) * d;
        z = Math.cos(p - yaw) * d;
        const p2 = Math.atan2(y, z);
        const d2 = Math.sqrt(y * y + z * z);
        const rx1 = -1000, ry1 = 1, rx2 = 1000, ry2 = 1, rx3 = 0, ry3 = 0, rx4 = x, ry4 = z;
        const uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
        if (!uc) return { x: 0, y: 0, d: -1 };
        const ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
        const ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;
        if (!z) z = .000000001;
        if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
            return {
                x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
                y: cy + y / z * scale,
                d: Math.sqrt(x * x + y * y + z * z)
            };
        } else {
            return {
                x: cx + (rx1 + ua * (rx2 - rx1)) * scale,
                y: cy + y / z * scale,
                d: -1
            };
        }
    }

    function spawnSeed() {
        const seed = new Object();
        seed.x = -50 + Math.random() * 100;
        seed.y = 25;
        seed.z = -50 + Math.random() * 100;
        seed.vx = .1 - Math.random() * .2;
        seed.vy = -1.5;
        seed.vz = .1 - Math.random() * .2;
        seed.born = frames;
        seeds.push(seed);
    }

    function splode(x, y, z) {
        const t = 5 + parseInt(Math.random() * 150);
        const sparkV = 1 + Math.random() * 2.5;
        const type = parseInt(Math.random() * 3);
        let pic1, pic2, pic3;
        switch (type) {
            case 0:
                pic1 = parseInt(Math.random() * 10);
                break;
            case 1:
                pic1 = parseInt(Math.random() * 10);
                do { pic2 = parseInt(Math.random() * 10); } while (pic2 == pic1);
                break;
            case 2:
                pic1 = parseInt(Math.random() * 10);
                do { pic2 = parseInt(Math.random() * 10); } while (pic2 == pic1);
                do { pic3 = parseInt(Math.random() * 10); } while (pic3 == pic1 || pic3 == pic2);
                break;
        }
        for (let m = 1; m < t; ++m) {
            const spark = new Object();
            spark.x = x; spark.y = y; spark.z = z;
            const p1 = pi * 2 * Math.random();
            const p2 = pi * Math.random();
            const v = sparkV * (1 + Math.random() / 6);
            spark.vx = Math.sin(p1) * Math.sin(p2) * v;
            spark.vz = Math.cos(p1) * Math.sin(p2) * v;
            spark.vy = Math.cos(p2) * v;
            switch (type) {
                case 0: spark.img = sparkPics[pic1]; break;
                case 1:
                    spark.img = sparkPics[parseInt(Math.random() * 2) ? pic1 : pic2];
                    break;
                case 2:
                    switch (parseInt(Math.random() * 3)) {
                        case 0: spark.img = sparkPics[pic1]; break;
                        case 1: spark.img = sparkPics[pic2]; break;
                        case 2: spark.img = sparkPics[pic3]; break;
                    }
                    break;
            }
            spark.radius = 25 + Math.random() * 51;
            spark.alpha = 1;
            spark.trail = new Array();
            sparks.push(spark);
        }

        // 添加文字
        addText(x, y, z);

        const d = Math.sqrt((x - playerX) * (x - playerX) + (y - playerY) * (y - playerY) + (z - playerZ) * (z - playerZ));
        let pow;
        switch (parseInt(Math.random() * 4)) {
            case 0: pow = pow1; break;
            case 1: pow = pow2; break;
            case 2: pow = pow3; break;
            case 3: pow = pow4; break;
        }
        pow.volume = 1.5 / (1 + d / 10);
        //pow.play();
    }

    function addText(x, y, z) {
        const point = rasterizePoint(x, y, z);
        if (point.d != -1) {
            const text = document.createElement('div');
            text.className = 'firework-text';

            // 随机选择一个文字
            const randomText = textOptions[Math.floor(Math.random() * textOptions.length)];
            text.textContent = randomText;

            // 随机选择一个颜色
            const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            text.style.color = randomColor;

            text.style.left = `${point.x - 50}px`; // 调整文字位置
            text.style.top = `${point.y - 20}px`;  // 调整文字位置

            textContainer.appendChild(text);

            // 设置文字淡出效果
            setTimeout(() => {
                text.style.opacity = 0;
                setTimeout(() => {
                    text.remove();
                }, 800); // 等到过渡效果结束后删除元素
            }, 800); // 开始淡出
        }
    }

    function doLogic() {
        if (seedTimer < frames) {
            seedTimer = frames + seedInterval * Math.random() * 10;
            spawnSeed();
        }
        for (let i = 0; i < seeds.length; ++i) {
            seeds[i].vy += gravity;
            seeds[i].x += seeds[i].vx;
            seeds[i].y += seeds[i].vy;
            seeds[i].z += seeds[i].vz;
            if (frames - seeds[i].born > seedLife) {
                splode(seeds[i].x, seeds[i].y, seeds[i].z);
                seeds.splice(i, 1);
            }
        }
        for (let i = 0; i < sparks.length; ++i) {
            if (sparks[i].alpha > 0 && sparks[i].radius > 5) {
                sparks[i].alpha -= .01;
                sparks[i].radius /= 1.02;
                sparks[i].vy += gravity;
                const point = new Object();
                point.x = sparks[i].x;
                point.y = sparks[i].y;
                point.z = sparks[i].z;
                if (sparks[i].trail.length) {
                    const x = sparks[i].trail[sparks[i].trail.length - 1].x;
                    const y = sparks[i].trail[sparks[i].trail.length - 1].y;
                    const z = sparks[i].trail[sparks[i].trail.length - 1].z;
                    const d = ((point.x - x) * (point.x - x) + (point.y - y) * (point.y - y) + (point.z - z) * (point.z - z));
                    if (d > 9) {
                        sparks[i].trail.push(point);
                    }
                } else {
                    sparks[i].trail.push(point);
                }
                if (sparks[i].trail.length > 5) sparks[i].trail.splice(0, 1);
                sparks[i].x += sparks[i].vx;
                sparks[i].y += sparks[i].vy;
                sparks[i].z += sparks[i].vz;
                sparks[i].vx /= 1.075;
                sparks[i].vy /= 1.075;
                sparks[i].vz /= 1.075;
            } else {
                sparks.splice(i, 1);
            }
        }
        const p = Math.atan2(playerX, playerZ);
        const d = Math.sqrt(playerX * playerX + playerZ * playerZ);
        const t = Math.sin(frames / 200) / 40;
        playerX = Math.sin(p + t) * d;
        playerZ = Math.cos(p + t) * d;
        yaw = pi + p + t;
    }

    function rgb(col) {
        const r = parseInt((.5 + Math.sin(col) * .5) * 16);
        const g = parseInt((.5 + Math.cos(col) * .5) * 16);
        const b = parseInt((.5 - Math.sin(col) * .5) * 16);
        return "#" + r.toString(16) + g.toString(16) + b.toString(16);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff8";
        for (let i = -100; i < 100; i += 3) {
            for (let j = -100; j < 100; j += 4) {
                let x = i; let z = j; let y = 25;
                const point = rasterizePoint(x, y, z);
                if (point.d != -1) {
                    const size = 250 / (1 + point.d);
                    const d = Math.sqrt(x * x + z * z);
                    let a = 0.75 - Math.pow(d / 100, 6) * 0.75;
                    if (a > 0) {
                        ctx.globalAlpha = a;
                        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
                    }
                }
            }
        }
        ctx.globalAlpha = 1;
        for (let i = 0; i < seeds.length; ++i) {
            const point = rasterizePoint(seeds[i].x, seeds[i].y, seeds[i].z);
            if (point.d != -1) {
                const size = 200 / (1 + point.d);
                ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
            }
        }
        const point1 = new Object();
        for (let i = 0; i < sparks.length; ++i) {
            const point = rasterizePoint(sparks[i].x, sparks[i].y, sparks[i].z);
            if (point.d != -1) {
                const size = sparks[i].radius * 200 / (1 + point.d);
                if (sparks[i].alpha < 0) sparks[i].alpha = 0;
                if (sparks[i].trail.length) {
                    point1.x = point.x;
                    point1.y = point.y;
                    ctx.strokeStyle = rgb(seedTimer / 10);
                    for (let j = sparks[i].trail.length - 1; j >= 0; --j) {
                        const point2 = rasterizePoint(sparks[i].trail[j].x, sparks[i].trail[j].y, sparks[i].trail[j].z);
                        if (point2.d != -1) {
                            ctx.globalAlpha = j / sparks[i].trail.length * sparks[i].alpha / 2;
                            ctx.beginPath();
                            ctx.moveTo(point1.x, point1.y);
                            ctx.lineWidth = 1 + sparks[i].radius * 10 / (sparks[i].trail.length - j) / (1 + point2.d);
                            ctx.lineTo(point2.x, point2.y);
                            ctx.stroke();
                            point1.x = point2.x;
                            point1.y = point2.y;
                        }
                    }
                }
                ctx.globalAlpha = sparks[i].alpha;
                //ctx.drawImage(sparks[i].img, point.x - size / 2, point.y - size / 2, size, size);
            }
        }
    }

    function frame() {
        if (frames > 100000) {
            seedTimer = 0;
            frames = 0;
        }
        frames++;
        draw();
        doLogic();
        requestAnimationFrame(frame);
    }

    window.addEventListener("resize", () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        cx = canvas.width / 2;
        cy = canvas.height / 2;
    });

    initVars();
    frame();
});
