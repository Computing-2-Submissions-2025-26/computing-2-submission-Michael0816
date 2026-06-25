import assert from "assert";

import {
    BLACK,
    WHITE,
    createGame,
    getCurrentPlayer,
    getOpponent,
    isInsideBoard,
    getFlippedDiscs,
    isMoveLegal,
    getValidMoves,
    playMove,
    passTurn,
    getScore,
    isGameOver,
    getWinner,
    chooseComputerMove
} from "../othello.js";

describe("createGame", function () {
    it("creates a 6 by 6 board by default", function () {
        const game = createGame();

        assert.strictEqual(game.board.length, 6);
        assert.strictEqual(game.board[0].length, 6);
    });

    it("places the starting discs on a 6 by 6 board", function () {
        const game = createGame();

        assert.strictEqual(game.board[2][2], WHITE);
        assert.strictEqual(game.board[2][3], BLACK);
        assert.strictEqual(game.board[3][2], BLACK);
        assert.strictEqual(game.board[3][3], WHITE);
    });

    it("can create an 8 by 8 board", function () {
        const game = createGame(8);

        assert.strictEqual(game.board.length, 8);
        assert.strictEqual(game.board[0].length, 8);
    });

    it("places the starting discs on an 8 by 8 board", function () {
        const game = createGame(8);

        assert.strictEqual(game.board[3][3], WHITE);
        assert.strictEqual(game.board[3][4], BLACK);
        assert.strictEqual(game.board[4][3], BLACK);
        assert.strictEqual(game.board[4][4], WHITE);
    });

    it("sets black as the first player", function () {
        const game = createGame();

        assert.strictEqual(getCurrentPlayer(game), BLACK);
    });

    it("rejects an odd board size", function () {
        assert.throws(
            function () {
                createGame(7);
            },
            /even\snumber/,
            "An odd board size should be rejected."
        );
    });

    it("rejects a board smaller than 4", function () {
        assert.throws(
            function () {
                createGame(2);
            },
            /at\sleast\s4/,
            "A board smaller than 4 should be rejected."
        );
    });
});

describe("getOpponent", function () {
    it("returns white as the opponent of black", function () {
        assert.strictEqual(getOpponent(BLACK), WHITE);
    });

    it("returns black as the opponent of white", function () {
        assert.strictEqual(getOpponent(WHITE), BLACK);
    });
});

describe("isInsideBoard", function () {
    it("returns true for a cell inside the board", function () {
        const game = createGame();

        assert.strictEqual(isInsideBoard(game, 0, 0), true);
        assert.strictEqual(isInsideBoard(game, 5, 5), true);
    });

    it("returns false for a cell outside the board", function () {
        const game = createGame();

        assert.strictEqual(isInsideBoard(game, -1, 0), false);
        assert.strictEqual(isInsideBoard(game, 0, 6), false);
        assert.strictEqual(isInsideBoard(game, 6, 0), false);
    });
});

describe("getFlippedDiscs", function () {
    it("finds the disc captured by an opening move", function () {
        const game = createGame();

        assert.deepStrictEqual(
            getFlippedDiscs(game, 1, 2, BLACK),
            [[2, 2]]
        );
    });

    it("returns an empty list when a move captures no discs", function () {
        const game = createGame();

        assert.deepStrictEqual(
            getFlippedDiscs(game, 0, 0, BLACK),
            []
        );
    });

    it("returns an empty list for an occupied cell", function () {
        const game = createGame();

        assert.deepStrictEqual(
            getFlippedDiscs(game, 2, 2, BLACK),
            []
        );
    });

    it("returns an empty list for a position outside the board", function () {
        const game = createGame();

        assert.deepStrictEqual(
            getFlippedDiscs(game, -1, 2, BLACK),
            []
        );
    });

    it("returns no discs when a line is not closed", function () {
        const game = {
            board: [
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, WHITE, WHITE, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null]
            ],
            currentPlayer: BLACK
        };

        assert.deepStrictEqual(
            getFlippedDiscs(game, 2, 0, BLACK),
            []
        );
    });

    it("flips discs in more than one direction", function () {
        const game = {
            board: [
                [BLACK, null, BLACK, null, null, null],
                [null, WHITE, WHITE, null, null, null],
                [BLACK, WHITE, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null]
            ],
            currentPlayer: BLACK
        };

        assert.deepStrictEqual(
            getFlippedDiscs(game, 2, 2, BLACK),
            [
                [1, 1],
                [1, 2],
                [2, 1]
            ],
            "The move should flip discs in three directions."
        );
    });

    it("flips discs along the edge of the board", function () {
        const game = {
            board: [
                [null, WHITE, WHITE, BLACK, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null]
            ],
            currentPlayer: BLACK
        };

        assert.deepStrictEqual(
            getFlippedDiscs(game, 0, 0, BLACK),
            [
                [0, 1],
                [0, 2]
            ],
            "The move should capture both discs along the top edge."
        );
    });
});

describe("isMoveLegal", function () {
    it("returns true for a move that captures at least one disc", function () {
        const game = createGame();

        assert.strictEqual(isMoveLegal(game, 1, 2, BLACK), true);
    });

    it("returns false for a move that captures no discs", function () {
        const game = createGame();

        assert.strictEqual(isMoveLegal(game, 0, 0, BLACK), false);
    });

    it("returns false for an occupied cell", function () {
        const game = createGame();

        assert.strictEqual(isMoveLegal(game, 2, 2, BLACK), false);
    });

    it("checks a move for a different player", function () {
        const game = createGame();

        assert.strictEqual(isMoveLegal(game, 1, 3, WHITE), true);
    });
});

describe("getValidMoves", function () {
    it("returns the legal opening moves for black", function () {
        const game = createGame();

        assert.deepStrictEqual(
            getValidMoves(game, BLACK),
            [
                [1, 2],
                [2, 1],
                [3, 4],
                [4, 3]
            ]
        );
    });

    it("returns the legal opening moves for white", function () {
        const game = createGame();

        assert.deepStrictEqual(
            getValidMoves(game, WHITE),
            [
                [1, 3],
                [2, 4],
                [3, 1],
                [4, 2]
            ]
        );
    });
});

describe("playMove", function () {
    it("places the current player's disc on the chosen cell", function () {
        const game = createGame();
        const nextGame = playMove(game, 1, 2);

        assert.strictEqual(nextGame.board[1][2], BLACK);
    });

    it("flips captured opponent discs", function () {
        const game = createGame();
        const nextGame = playMove(game, 1, 2);

        assert.strictEqual(nextGame.board[2][2], BLACK);
    });

    it("switches to the opponent after a legal move", function () {
        const game = createGame();
        const nextGame = playMove(game, 1, 2);

        assert.strictEqual(
            nextGame.currentPlayer,
            WHITE,
            "The turn should switch to White after Black moves."
        );
    });

    it("does not change the original game state", function () {
        const game = createGame();
        const nextGame = playMove(game, 1, 2);

        assert.strictEqual(game.board[1][2], null);
        assert.strictEqual(game.board[2][2], WHITE);
        assert.notStrictEqual(
            nextGame,
            game,
            "playMove should return a new game state."
        );
        assert.notStrictEqual(
            nextGame.board,
            game.board,
            "playMove should return a new board."
        );
    });

    it("returns the same game state after an illegal move", function () {
        const game = createGame();
        const nextGame = playMove(game, 0, 0);

        assert.strictEqual(nextGame, game);
    });

    it("flips discs in several directions after one move", function () {
        const game = {
            board: [
                [BLACK, null, BLACK, null, null, null],
                [null, WHITE, WHITE, null, null, null],
                [BLACK, WHITE, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null]
            ],
            currentPlayer: BLACK
        };

        const nextGame = playMove(game, 2, 2);

        assert.strictEqual(nextGame.board[1][1], BLACK);
        assert.strictEqual(nextGame.board[1][2], BLACK);
        assert.strictEqual(nextGame.board[2][1], BLACK);
        assert.strictEqual(nextGame.board[2][2], BLACK);
    });

    it("keeps the player when the opponent cannot move", function () {
        const game = {
            board: [
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, WHITE, null, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK]
            ],
            currentPlayer: BLACK
        };

        const nextGame = playMove(game, 4, 4);

        assert.strictEqual(
            nextGame.currentPlayer,
            BLACK,
            "Black should keep the turn when White cannot move."
        );
    });
});

describe("getScore", function () {
    it("returns two discs for each player at the start", function () {
        const game = createGame();

        assert.deepStrictEqual(getScore(game), {
            black: 2,
            white: 2
        });
    });

    it("updates the score after a legal move", function () {
        const game = createGame();
        const nextGame = playMove(game, 1, 2);

        assert.deepStrictEqual(
            getScore(nextGame),
            {
                black: 4,
                white: 1
            },
            "The score should include the placed and flipped discs."
        );
    });
});

describe("passTurn", function () {
    it("keeps the turn when a legal move is available", function () {
        const game = createGame();
        const nextGame = passTurn(game);

        assert.strictEqual(nextGame, game);
    });

    it("passes when the current player has no legal moves", function () {
        const game = {
            board: [
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, null]
            ],
            currentPlayer: BLACK
        };

        const nextGame = passTurn(game);

        assert.strictEqual(
            nextGame.currentPlayer,
            WHITE,
            "The turn should pass when Black has no legal moves."
        );
    });
});

describe("isGameOver", function () {
    it("returns false at the start of the game", function () {
        const game = createGame();

        assert.strictEqual(isGameOver(game), false);
    });

    it("returns true when neither player has a legal move", function () {
        const game = {
            board: [
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK]
            ],
            currentPlayer: BLACK
        };

        assert.strictEqual(isGameOver(game), true);
    });
});

describe("getWinner", function () {
    it("returns null before the game is over", function () {
        const game = createGame();

        assert.strictEqual(getWinner(game), null);
    });

    it("returns black when black has more discs", function () {
        const game = {
            board: [
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, WHITE]
            ],
            currentPlayer: BLACK
        };

        assert.strictEqual(
            getWinner(game),
            BLACK,
            "Black should win when Black has more discs."
        );
    });

    it("returns white when white has more discs", function () {
        const game = {
            board: [
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE],
                [WHITE, WHITE, WHITE, WHITE, WHITE, BLACK]
            ],
            currentPlayer: WHITE
        };

        assert.strictEqual(
            getWinner(game),
            WHITE,
            "White should win when White has more discs."
        );
    });

    it("returns draw when both players have the same score", function () {
        const game = {
            board: [
                [BLACK, WHITE, BLACK, WHITE, BLACK, WHITE],
                [WHITE, BLACK, WHITE, BLACK, WHITE, BLACK],
                [BLACK, WHITE, BLACK, WHITE, BLACK, WHITE],
                [WHITE, BLACK, WHITE, BLACK, WHITE, BLACK],
                [BLACK, WHITE, BLACK, WHITE, BLACK, WHITE],
                [WHITE, BLACK, WHITE, BLACK, WHITE, BLACK]
            ],
            currentPlayer: BLACK
        };

        assert.strictEqual(
            getWinner(game),
            "draw",
            "The result should be a draw when scores are equal."
        );
    });
});

describe("chooseComputerMove", function () {
    it("returns a legal move for the computer player", function () {
        const game = createGame();
        const move = chooseComputerMove(game, BLACK);

        assert.strictEqual(
            isMoveLegal(game, move[0], move[1], BLACK),
            true
        );
    });

    it("chooses the move that flips the most discs", function () {
        const game = {
            board: [
                [null, null, null, null, null, null],
                [null, null, null, null, null, null],
                [null, WHITE, WHITE, WHITE, BLACK, null],
                [null, WHITE, BLACK, null, null, null],
                [null, null, null, null, null, null],
                [null, null, null, null, null, null]
            ],
            currentPlayer: BLACK
        };

        assert.deepStrictEqual(
            chooseComputerMove(game, BLACK),
            [2, 0],
            "The computer should choose the move with most captures."
        );
    });

    it("returns null when the computer player has no legal move", function () {
        const game = {
            board: [
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK],
                [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK]
            ],
            currentPlayer: WHITE
        };

        assert.strictEqual(
            chooseComputerMove(game, WHITE),
            null,
            "The computer should return null when no move is available."
        );
    });
});
