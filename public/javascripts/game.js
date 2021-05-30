const roomID = parseInt(location.pathname.split("/")[2]);
const userID = parseInt(location.pathname.split("/")[4]);

const myCanvas = document.getElementById("player1");
const enemyCanvas = document.getElementById("player2");

const myFiled = myCanvas.getContext("2d");
const enemyFiled = enemyCanvas.getContext("2d");

const surrenderButton = document.getElementById("resignButton");



let gameState = undefined;

const newGameButton = document.getElementById("newGameButton");

newGameButton.addEventListener("click", (event) => {
    window.location.href = "/";
});

surrenderButton.addEventListener("click", (event) => {
    sendData("surrender", {roomID, userID, ...getFiledCoords(event)});
});

    
enemyCanvas.addEventListener("click", event => {
    
    if (gameState?.isMoveAvailable) {
        
        const filedCoords = getFiledCoords(event)
        

        if (gameState.enemy[filedCoords.y][filedCoords.x] === 0 ) {
            console.log(`Clicked on {${filedCoords.x}, ${filedCoords.y}}`);

            sendData("makeMove", { roomID, userID, ...filedCoords});
            
        } else {
             alert("\НИЗЯ, целься лучше) \"");
        }
        
    } else {
        alert("\"В очередь, сукины дети!!!\"");
    }
})

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
            if (data[y][x] === 1 || data[y][x] === 5) {
                drawShip(ctx, x, y);
            } else if (data[y][x] === 2) {
                drawPartialShip(ctx, x, y);
            } else if (data[y][x] === 3) {
                drawVisitedCell(ctx, x, y);
            } else if (data[y][x] === 4) {
                drawDeadShip(ctx, x, y);
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

function drawDeadShip(ctx, x, y) {
    ctx.fillStyle = "black";
    ctx.fillRect(x * 30 + 5 + 2, y * 30 + 5 + 2, 26, 26);
}

function drawPartialShip(ctx, x, y) {
    ctx.fillStyle = "blue";
    ctx.fillRect(x * 30 + 5 + 2, y * 30 + 5 + 2, 26, 26);

    const centerX = (x * 30 + 5 + 15);
    const centerY = (y * 30 + 5 + 15);
    const offset = 7;

    let cross = new Path2D();
    cross.moveTo(centerX - offset,centerY - offset);
    cross.lineTo(centerX + offset,centerY + offset);
    cross.moveTo(centerX - offset,centerY + offset);
    cross.lineTo(centerX + offset,centerY - offset);

    ctx.strokeStyle = "red";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    ctx.stroke(cross);
}

function drawEmptyCell(ctx, x, y) {
    ctx.fillStyle = "white";
    ctx.fillRect(x * 30 + 5 + 1, y * 30 + 5 + 1, 28, 28);
}

function drawVisitedCell(ctx, x, y) {
    let circle = new Path2D();
    circle.arc(x * 30 + 5 + 15, y * 30 + 5 + 15, 3, 0, 2 * Math.PI, false);

    ctx.fillStyle = 'red';
    ctx.fill(circle);
}

function getFiledCoords(event) {
    return {
        x: Math.floor((event.offsetX - 5) / 30),
        y: Math.floor((event.offsetY - 5) / 30)
    }
}

drawEmptyField(myFiled);
drawEmptyField(enemyFiled);

const socket = new WebSocket(`ws://${window.location.host}/${roomID}:${userID}`);

socket.addEventListener("open", data => {
    console.log('подключился');
});

socket.addEventListener("close", data => {
    console.log('отключился');
});

socket.addEventListener("error", data => {
    console.error(data);
});

socket.addEventListener("message", message => {
    const msg = JSON.parse(message.data);

    const command = msg.command;
    const data = msg.data;
    
    switch (command) {
       
        case "updateGame":
            gameState = data;

            updateGame(gameState);
            break;

        case "updateChat":
            updateChat(data);
            break;

        default:
            console.error(`Unknown command: ${command}`);
    }
});

function sendData(command, data) {
    socket.send(JSON.stringify({command, data}));
}

function updateGame(state) {
    drawField(myFiled, state.my);
    drawField(enemyFiled, state.enemy);
   
    if (state.isGameOver) {
        newGameButton.style.display = "block";
        surrenderButton.remove();
        showInfo(state.winner === userID ? "ПОБЕДА!!! ;)" : "ПОВЕЗЕТ В СЛЕДУЮЩИЙ РАЗ!!! :(");
    } else {
        if (state.isMoveAvailable) {
            showInfo("Ваш ход.");
        } else {
            showInfo("Вы под обстрелом.");
        }
    }
}

function updateChat(data) {
    chatHistory.value += `${data.from}: ${data.message}\r\n`;
}

function showInfo(message) {
    document.getElementById("info").innerText = message
}

// ------------------- CHAT

const sendMessageButton = document.querySelector("#chat > button");
const chatHistory = document.querySelector("#chat > textarea");
const chatMessage = document.querySelector("#chat > input[type=text]");

sendMessageButton.addEventListener("click", () => {
    const text = chatMessage.value;

    if (text.length > 0) {
        sendData("chatMessage", {roomID, userID, text});
        
        chatMessage.value = "";
    }
});