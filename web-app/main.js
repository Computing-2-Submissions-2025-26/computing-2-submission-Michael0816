import {
    BLACK,
    WHITE,
    chooseComputerMove,
    createGame,
    getFlippedDiscs,
    getOpponent,
    getScore,
    getValidMoves,
    getWinner,
    isGameOver,
    isMoveLegal,
    passTurn,
    playMove
} from "./othello.js";

const COMPUTER_PLAYER = WHITE;

let boardSize = 6;
let game = createGame(boardSize);
let gameMode = "pvp";
let computerTurnPending = false;
let computerTurnTimer = null;

let recentlyFlippedDiscs = [];
let recentlyPlacedDisc = null;
let turnNotice = "";

let render;
let scheduleComputerTurn;
let handleCellClick;

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const blackScoreElement = document.querySelector("#black-score");
const whiteScoreElement = document.querySelector("#white-score");
const resultBannerElement = document.querySelector("#result-banner");
const size6Button = document.querySelector("#size-6-button");
const size8Button = document.querySelector("#size-8-button");
const messageElement = document.querySelector("#message");
const resetButton = document.querySelector("#reset-button");
const pvpButton = document.querySelector("#pvp-button");
const pvcButton = document.querySelector("#pvc-button");

const turnPanelElement = document.querySelector("#turn-panel");
const turnDiscElement = document.querySelector("#turn-disc");
const turnNoticeElement = document.querySelector("#turn-notice");

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

function isSamePosition(firstPosition, secondPosition) {
    return (
        firstPosition !== null &&
        secondPosition !== null &&
        firstPosition[0] === secondPosition[0] &&
        firstPosition[1] === secondPosition[1]
    );
}

function includesPosition(positions, row, column) {
    return positions.some(function (position) {
        return (
            position[0] === row &&
            position[1] === column
        );
    });
}

function updateBoardStyle() {
    document.body.dataset.mode = gameMode;
    document.body.dataset.size = String(boardSize);
}

function updateSizeButtons() {
    const size6Selected = boardSize === 6;
    const size8Selected = boardSize === 8;

    size6Button.classList.toggle(
        "active-size",
        size6Selected
    );

    size8Button.classList.toggle(
        "active-size",
        size8Selected
    );

    size6Button.setAttribute(
        "aria-pressed",
        String(size6Selected)
    );

    size8Button.setAttribute(
        "aria-pressed",
        String(size8Selected)
    );
}

function updateModeButtons() {
    const pvpSelected = gameMode === "pvp";
    const pvcSelected = gameMode === "pvc";

    pvpButton.classList.toggle(
        "active-mode",
        pvpSelected
    );

    pvcButton.classList.toggle(
        "active-mode",
        pvcSelected
    );

    pvpButton.setAttribute(
        "aria-pressed",
        String(pvpSelected)
    );

    pvcButton.setAttribute(
        "aria-pressed",
        String(pvcSelected)
    );
}

function isComputerTurn() {
    return (
        gameMode === "pvc" &&
        game.currentPlayer === COMPUTER_PLAYER &&
        !isGameOver(game)
    );
}

function updateStatus() {
    const score = getScore(game);
    const winner = getWinner(game);
    const currentPlayer = game.currentPlayer;

    blackScoreElement.textContent = String(score.black);
    whiteScoreElement.textContent = String(score.white);

    resultBannerElement.classList.remove("show-result");

    turnPanelElement.classList.remove(
        "black-turn",
        "white-turn",
        "game-finished"
    );

    if (winner === "draw") {
        statusElement.textContent = "Draw";
        turnNoticeElement.textContent = "The game has ended.";

        turnPanelElement.classList.add("game-finished");

        resultBannerElement.textContent = "Draw game!";
        resultBannerElement.classList.add("show-result");

        return;
    }

    if (winner !== null) {
        statusElement.textContent = (
            `${formatPlayer(winner)} wins`
        );

        turnNoticeElement.textContent = "The game has ended.";

        turnPanelElement.classList.add("game-finished");

        resultBannerElement.textContent = (
            `${formatPlayer(winner)} wins!`
        );

        resultBannerElement.classList.add("show-result");

        return;
    }

    statusElement.textContent = formatPlayer(currentPlayer);
    turnNoticeElement.textContent = turnNotice;
    resultBannerElement.textContent = "";

    if (currentPlayer === BLACK) {
        turnPanelElement.classList.add("black-turn");
    } else {
        turnPanelElement.classList.add("white-turn");
    }

    turnDiscElement.setAttribute(
        "aria-label",
        `${formatPlayer(currentPlayer)} disc`
    );
}

function cancelComputerTurn() {
    if (computerTurnTimer !== null) {
        clearTimeout(computerTurnTimer);
        computerTurnTimer = null;
    }

    computerTurnPending = false;
}

function createCell(row, column, value) {
    const cellButton = document.createElement("button");

    const isLegal = (
        !isComputerTurn() &&
        !computerTurnPending &&
        isMoveLegal(
            game,
            row,
            column,
            game.currentPlayer
        )
    );

    cellButton.classList.add("cell");
    cellButton.type = "button";

    if (isLegal) {
        cellButton.tabIndex = 0;
    } else {
        cellButton.tabIndex = -1;
    }

    if (value === BLACK) {
        cellButton.classList.add("black-disc");
    } else if (value === WHITE) {
        cellButton.classList.add("white-disc");
    } else if (isLegal) {
        cellButton.classList.add("valid-move");
    }

    if (includesPosition(
        recentlyFlippedDiscs,
        row,
        column
    )) {
        cellButton.classList.add("recently-flipped");
    }

    if (isSamePosition(
        recentlyPlacedDisc,
        [row, column]
    )) {
        cellButton.classList.add("recently-placed");
    }

    let cellLabel = (
        `Row ${row + 1}, column ${column + 1}, ` +
        formatCellValue(value)
    );

    if (isLegal) {
        cellLabel += ", legal move";
    }

    cellButton.setAttribute(
        "aria-label",
        cellLabel
    );

    cellButton.setAttribute(
        "aria-disabled",
        String(!isLegal)
    );

    cellButton.addEventListener("click", function () {
        handleCellClick(row, column);
    });

    return cellButton;
}

function renderBoard() {
    const size = game.board.length;

    boardElement.replaceChildren();

    boardElement.style.gridTemplateColumns = (
        `repeat(${size}, 1fr)`
    );

    game.board.forEach(function (rowValues, row) {
        rowValues.forEach(function (cellValue, column) {
            boardElement.appendChild(
                createCell(
                    row,
                    column,
                    cellValue
                )
            );
        });
    });
}

render = function () {
    renderBoard();
    updateStatus();
    updateModeButtons();
    updateSizeButtons();
    updateBoardStyle();
};

scheduleComputerTurn = function () {
    if (!isComputerTurn() || computerTurnPending) {
        return;
    }

    computerTurnPending = true;
    turnNotice = "Computer is thinking...";
    messageElement.textContent = "Computer is thinking...";

    render();

    computerTurnTimer = setTimeout(function () {
        computerTurnTimer = null;

        if (!isComputerTurn()) {
            computerTurnPending = false;
            return;
        }

        const move = chooseComputerMove(
            game,
            COMPUTER_PLAYER
        );

        if (move === null) {
            recentlyFlippedDiscs = [];
            recentlyPlacedDisc = null;

            game = passTurn(game);

            turnNotice = "White skipped — Black plays again";

            messageElement.textContent = (
                "Computer has no legal moves. Turn passed."
            );
        } else {
            turnNotice = "";

            recentlyFlippedDiscs = getFlippedDiscs(
                game,
                move[0],
                move[1],
                COMPUTER_PLAYER
            );

            recentlyPlacedDisc = [
                move[0],
                move[1]
            ];

            game = playMove(
                game,
                move[0],
                move[1]
            );

            messageElement.textContent = (
                "Computer played a move."
            );
        }

        computerTurnPending = false;

        render();
        scheduleComputerTurn();
    }, 500);
};

handleCellClick = function (row, column) {
    if (isGameOver(game)) {
        messageElement.textContent = (
            "The game is already over."
        );

        return;
    }

    if (isComputerTurn() || computerTurnPending) {
        messageElement.textContent = (
            "Please wait for the computer move."
        );

        return;
    }

    if (!isMoveLegal(
        game,
        row,
        column,
        game.currentPlayer
    )) {
        messageElement.textContent = (
            "That move is not legal."
        );

        return;
    }

    const playerBeforeMove = game.currentPlayer;
    const opponent = getOpponent(playerBeforeMove);

    recentlyFlippedDiscs = getFlippedDiscs(
        game,
        row,
        column,
        game.currentPlayer
    );

    recentlyPlacedDisc = [
        row,
        column
    ];

    game = playMove(
        game,
        row,
        column
    );

    if (
        !isGameOver(game) &&
        game.currentPlayer === playerBeforeMove &&
        getValidMoves(game, opponent).length === 0
    ) {
        turnNotice = (
            `${formatPlayer(opponent)} skipped — ` +
            `${formatPlayer(playerBeforeMove)} plays again`
        );

        messageElement.textContent = (
            `${formatPlayer(opponent)} has no legal moves. ` +
            "Turn passed."
        );
    } else {
        turnNotice = "";
        messageElement.textContent = "";
    }

    render();
    scheduleComputerTurn();
};

function restartGame(message) {
    cancelComputerTurn();

    game = createGame(boardSize);

    recentlyFlippedDiscs = [];
    recentlyPlacedDisc = null;
    turnNotice = "";

    messageElement.textContent = message;

    render();
    scheduleComputerTurn();
}

resetButton.addEventListener("click", function () {
    restartGame("");
});

pvpButton.addEventListener("click", function () {
    gameMode = "pvp";
    restartGame("PvP mode selected.");
});

pvcButton.addEventListener("click", function () {
    gameMode = "pvc";
    restartGame("PvC mode selected. You are Black.");
});

size6Button.addEventListener("click", function () {
    boardSize = 6;
    restartGame("6×6 board selected.");
});

size8Button.addEventListener("click", function () {
    boardSize = 8;
    restartGame("8×8 board selected.");
});

render();
