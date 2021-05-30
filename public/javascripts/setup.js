const userName = document.getElementById("userName");

const startButton = document.getElementById("startButton");


startButton.addEventListener("click", () => {
    fetch(window.location.origin + "/start", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({field: fieldData, userName: userName.value})
    }).then(response => {
        
        if (response.redirected) {
            
            window.location.href = response.url;
         
        } else {
            response.json().then(msg => alert(msg.message));
        }
    });
});

const canvas = document.getElementById("field");
const context = canvas.getContext("2d");

let fieldData = [];

canvas.addEventListener("click", event => {
    const filedCoords = getFiledCoords(event)
    console.log(`Clicked on {${filedCoords.x}, ${filedCoords.y}}`);
})

const autoShipsButton = document.getElementById("getAutoShipsPlacement");
autoShipsButton.addEventListener("click", () => {
    fetch(window.location.origin + "/generate")
        .then(response => response.json())
        .then(data => {
            fieldData = data;

            drawField(context, fieldData);
        });
});

function drawEmptyField(ctx) {
    ctx.clearRect(0, 0, 310, 310);

    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, 310, 310);
    ctx.fillStyle = "#DDDDDD";
    ctx.fillRect(5, 5, 300, 300);

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            drawEmptyCell(ctx, x, y);
        }
    }
}

function drawField(ctx, data) {
    drawEmptyField(ctx);

    ctx.fillStyle = "blue";

    for (let y = 0; y < data.length; y++) {
        const row = data[y];
        for (let x = 0; x < row.length; x++) {
            if (data[y][x] === 1) {
                drawShip(ctx, x, y);
            } else {
                drawEmptyCell(ctx, x, y);
            }
        }
    }
}

function drawShip(ctx, x, y) {
    ctx.fillStyle = "blue";
    ctx.fillRect(x * 30 + 5 + 2, y * 30 + 5 + 2, 26, 26);
}

function drawEmptyCell(ctx, x, y) {
    ctx.fillStyle = "white";
    ctx.fillRect(x * 30 + 5 + 1, y * 30 + 5 + 1, 28, 28);
}

function getFiledCoords(event) {
    return {
        x: Math.floor((event.offsetX - 5) / 30),
        y: Math.floor((event.offsetY - 5) / 30)
    }
}

drawEmptyField(context);