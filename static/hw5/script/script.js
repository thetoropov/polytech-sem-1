const startX = [260, 360, 460, 260, 360, 460];
const startY = [170, 170, 170, 280, 280, 280];
const startDeg = [0, 0, 0, 90, 180, 0];

const x = [820, 620, 820, 720, 720, 620];
const y = [280, 280, 180, 180, 280, 180];
const deg = [0, 0, 0, 90, 180, 0];

let main = document.getElementById("main");

let check = document.getElementById("check");
let restart = document.getElementById("restart");

let block = document.getElementsByClassName("pic");
let wrap = document.getElementsByClassName("wrap");

let animal = document.getElementsByClassName("pic0").item(0);

function toStartPosition(i) {
    wrap.item(i).style.left = startX[i] + "px";
    wrap.item(i).style.top = startY[i] + "px";
    block.item(i).style.border = 2 + "px dotted gray";
    block.item(i).style.transform = "rotate(" + (startDeg[i]) + "deg)";
    deg[i] = startDeg[i];
}

restart.onclick = function () {
    for (let i = 0; i < 6; i++) {
        toStartPosition(i);
    }
    animal.style.left = -9999 + "px";
};

function checkBlock(i) {
        if (Math.abs(wrap.item(0).offsetLeft - wrap.item(2).offsetLeft ) < 50 &&
            Math.abs(wrap.item(0).offsetTop - wrap.item(2).offsetTop) < 150 &&
            deg[0] % 360 === 0 && deg[2] % 360 === 0 &&
            Math.abs(wrap.item(0).offsetLeft - wrap.item(4).offsetLeft ) < 150 &&
            Math.abs(wrap.item(0).offsetTop - wrap.item(4).offsetTop) < 50 &&
            deg[4] % 360 === 0 &&
            Math.abs(wrap.item(4).offsetLeft - wrap.item(3).offsetLeft ) < 50 &&
            Math.abs(wrap.item(4).offsetTop - wrap.item(3).offsetTop) < 150 &&
            deg[3] % 360 ===0 &&
            Math.abs(wrap.item(4).offsetLeft - wrap.item(1).offsetLeft ) < 150 &&
            Math.abs(wrap.item(4).offsetTop - wrap.item(1).offsetTop) < 50 &&
            deg[1] % 360 === 0 &&
            Math.abs(wrap.item(1).offsetLeft - wrap.item(5).offsetLeft ) < 50 &&
            Math.abs(wrap.item(1).offsetTop - wrap.item(5).offsetTop) < 150 &&
            deg[5] % 360 === 0 )
            {
            // wrap.item(i).style.left = x[i] + "px";
            // wrap.item(i).style.top = y[i] + "px";
            // block.item(i).style.border = 0;
            return 1;
        }

    // if (Math.abs(wrap.item(i).offsetLeft - x[i]) < 50 && Math.abs(wrap.item(i).offsetTop - y[i]) < 50 && deg[i] % 360 === 0) {
    //     wrap.item(i).style.left = x[i] + "px";
    //     wrap.item(i).style.top = y[i] + "px";
    //     block.item(i).style.border = 0;
    //     return 1;
    // }
    return 0;
}

check.onclick = function () {
    let checkedBlocks = 0;
    for (let i = 0; i < 6; i++) {
        checkedBlocks += checkBlock(i);
    }
    if (checkedBlocks === 6) {
        let leftNumber = wrap.item(5).offsetLeft;
        let topNumber = wrap.item(5).offsetTop;
        for (let i = 0; i < 6; i++) {
            wrap.item(i).style.left = -9999 + "px";
        }

        animal.style.left = leftNumber + "px";
        animal.style.top = topNumber + "px";
        animal.animate([
            {transform: 'translate(0)'},
            {transform: 'translate(-5px, 0px)'},
            {transform: 'translate(0px, 3px)'},
            {transform: 'translate(5px, 0px)'},
            {transform: 'translate(0px, -5px)'},
        ], 1000);
    }
};

function rotateBlock(i) {
    block.item(i).ondblclick = function () {
        block.item(i).style.transform = 'rotate(' + (deg[i] - 45) + 'deg)';
        deg[i] = deg[i] - 45;
    }
}

function movingBlock(i) {
    block.item(i).ondragstart = function () {
            console.log(i);
        return false;
    };

    block.item(i).onmousedown = function (e) {
        block.item(i).style.border = 2 + "px solid gray";

        let coords = getCoords(i);
        let shiftX = e.clientX - coords.left;
        let shiftY = e.clientY - coords.top;

        wrap.item(i).style.zIndex = 100;

        document.onmousemove = function (e) {
            moveAt(e);
        };

        block.item(i).onmouseup = function () {
            document.onmousemove = null;
            block.item(i).style.border = 2 + "px dashed gray";
        };

        function moveAt(e) {
            wrap.item(i).style.left = e.clientX - main.offsetLeft - shiftX + 'px';
            wrap.item(i).style.top = e.clientY - main.offsetTop - shiftY + 'px';
        }
    };

    function getCoords(i) {
        let pic = wrap.item(i).getBoundingClientRect();
        return {
            top: pic.top + pageYOffset,
            left: pic.left + pageXOffset
        };
    }
}

for (let i = 0; i < 6; i++) {
    rotateBlock(i);
    movingBlock(i);
}
