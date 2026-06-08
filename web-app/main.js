import {
    BLACK,
    WHITE,
    createGame,
    getOpponent,
    getScore,
    getValidMoves,
    getWinner,
    isGameOver,
    isMoveLegal,
    playMove
} from "./othello.js";

let game = createGame(6);

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const scoreElement = document.querySelector("#score");
const messageElement = document.querySelector("#message");
const resetButton = document.querySelector("#reset-button");

function formatPlayer(player) {
    if (player === BLACK) {
        return "Black";
    }

    if (player === WHITE) {
        return "White";
    }

    return "Nobody";
}

function formatCellValue(value) {
    if (value === BLACK) {
        return "black disc";
    }

    if (value === WHITE) {
        return "white disc";
    }

    return "empty cell";
}

function updateStatus() {
    const score = getScore(game);
    const winner = getWinner(game);

    scoreElement.textContent = `Black: ${score.black} | White: ${score.white}`;

    if (winner === "draw") {
        statusElement.textContent = "Game over: draw";
    } else if (winner !== null) {
        statusElement.textContent = `Game over: ${formatPlayer(winner)} wins`;
    } else {
        statusElement.textContent = `Current player: ${formatPlayer(game.currentPlayer)}`;
    }
}

function handleCellClick(row, column) {
    if (isGameOver(game)) {
        messageElement.textContent = "The game is already over.";
        return;
    }

    if (!isMoveLegal(game, row, column, game.currentPlayer)) {
        messageElement.textContent = "That move is not legal.";
        return;
    }

    const playerBeforeMove = game.currentPlayer;
    const opponent = getOpponent(playerBeforeMove);

    game = playMove(game, row, column);

    if (
        !isGameOver(game) &&
        game.currentPlayer === playerBeforeMove &&
        getValidMoves(game, opponent).length === 0
    ) {
        messageElement.textContent = `${formatPlayer(opponent)} has no legal moves. Turn passed.`;
    } else {
        messageElement.textContent = "";
    }

    render();
}

function createCell(row, column) {
    const cellButton = document.createElement("button");
    const value = game.board[row][column];
    const isLegal = isMoveLegal(game, row, column, game.currentPlayer);

    cellButton.classList.add("cell");
    cellButton.type = "button";

    if (value === BLACK) {
        cellButton.classList.add("black-disc");
        cellButton.textContent = "";
    } else if (value === WHITE) {
        cellButton.classList.add("white-disc");
        cellButton.textContent = "";
    } else if (isLegal) {
        cellButton.classList.add("valid-move");
        cellButton.textContent = "";
    } else {
        cellButton.textContent = "";
    }
    cellButton.setAttribute(
        "aria-label",
        `Row ${row + 1}, column ${column + 1}, ${formatCellValue(value)}${
            isLegal ? ", legal move" : ""
        }`
    );

    cellButton.addEventListener("click", function () {
        handleCellClick(row, column);
    });

    return cellButton;
}

function renderBoard() {
    const size = game.board.length;

    boardElement.replaceChildren();
    boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    game.board.forEach(function (rowValues, row) {
        rowValues.forEach(function (_cellValue, column) {
            boardElement.appendChild(createCell(row, column));
        });
    });
}

function render() {
    renderBoard();
    updateStatus();
}

resetButton.addEventListener("click", function () {
    game = createGame(6);
    messageElement.textContent = "";
    render();
});

render();