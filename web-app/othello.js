/**
 * Othello game module.
 *
 * This module stores the game state and applies the rules of Othello.
 *
 * @module Othello
 */

const EMPTY = null;
const BLACK = "black";
const WHITE = "white";

const DIRECTIONS = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
];

/**
 * A player in Othello.
 *
 * @typedef {"black" | "white"} Player
 */

/**
 * A cell on the board.
 *
 * @typedef {Player | null} Cell
 */

/**
 * A row and column position.
 *
 * @typedef {Array<number>} Position
 */

/**
 * The current state of a game.
 *
 * @typedef {Object} GameState
 * @property {Array<Array<Cell>>} board - The current board.
 * @property {Player} currentPlayer - The player whose turn it is.
 */

/**
 * Creates an empty square board.
 *
 * @private
 * @param {number} size - The width and height of the board.
 * @returns {Array<Array<Cell>>} An empty board.
 */
function createEmptyBoard(size) {
    return Array.from(
        {length: size},
        function () {
            return Array.from(
                {length: size},
                function () {
                    return EMPTY;
                }
            );
        }
    );
}

/**
 * Copies a board without changing the original.
 *
 * @private
 * @param {Array<Array<Cell>>} board - The board to copy.
 * @returns {Array<Array<Cell>>} A copied board.
 */
function copyBoard(board) {
    return board.map(function (row) {
        return row.slice();
    });
}

/**
 * Finds captured discs in one direction.
 *
 * @private
 * @param {GameState} game - The current game state.
 * @param {number} row - The row index of the move.
 * @param {number} column - The column index of the move.
 * @param {Player} player - The player making the move.
 * @param {Position} direction - The direction to check.
 * @returns {Array<Position>} The captured disc positions.
 */
function getFlippedDiscsInDirection(
    game,
    row,
    column,
    player,
    direction
) {
    const opponent = getOpponent(player);
    const rowStep = direction[0];
    const columnStep = direction[1];
    const flippedDiscs = [];

    let currentRow = row + rowStep;
    let currentColumn = column + columnStep;

    while (isInsideBoard(game, currentRow, currentColumn)) {
        const cell = game.board[currentRow][currentColumn];

        if (cell === opponent) {
            flippedDiscs.push([currentRow, currentColumn]);
            currentRow += rowStep;
            currentColumn += columnStep;
        } else if (cell === player) {
            return flippedDiscs;
        } else {
            return [];
        }
    }

    return [];
}

/**
 * Creates a new Othello game.
 *
 * The board size must be an even number of at least 4.
 *
 * @param {number} [size=6] - The width and height of the board.
 * @returns {GameState} A new game state.
 * @throws {Error} If the size is odd or smaller than 4.
 */
function createGame(size = 6) {
    if (size < 4 || size % 2 !== 0) {
        throw new Error(
            "Othello board size must be an even number of at least 4."
        );
    }

    const board = createEmptyBoard(size);
    const middle = size / 2;

    board[middle - 1][middle - 1] = WHITE;
    board[middle - 1][middle] = BLACK;
    board[middle][middle - 1] = BLACK;
    board[middle][middle] = WHITE;

    return {
        board,
        currentPlayer: BLACK
    };
}

/**
 * Returns the board from a game state.
 *
 * @param {GameState} game - The current game state.
 * @returns {Array<Array<Cell>>} The board.
 */
function getBoard(game) {
    return game.board;
}

/**
 * Returns the player whose turn it is.
 *
 * @param {GameState} game - The current game state.
 * @returns {Player} The current player.
 */
function getCurrentPlayer(game) {
    return game.currentPlayer;
}

/**
 * Returns the opponent of a player.
 *
 * @param {Player} player - The player.
 * @returns {Player} The opponent.
 */
function getOpponent(player) {
    if (player === BLACK) {
        return WHITE;
    }

    return BLACK;
}

/**
 * Checks whether a position is inside the board.
 *
 * @param {GameState} game - The current game state.
 * @param {number} row - The row index.
 * @param {number} column - The column index.
 * @returns {boolean} True if the position is inside the board.
 */
function isInsideBoard(game, row, column) {
    const size = game.board.length;

    return (
        row >= 0 &&
        row < size &&
        column >= 0 &&
        column < size
    );
}

/**
 * Returns the opponent discs captured by a move.
 *
 * @param {GameState} game - The current game state.
 * @param {number} row - The row index of the move.
 * @param {number} column - The column index of the move.
 * @param {Player} [player=game.currentPlayer] - The player making the move.
 * @returns {Array<Position>} The captured disc positions.
 */
function getFlippedDiscs(
    game,
    row,
    column,
    player = game.currentPlayer
) {
    if (!isInsideBoard(game, row, column)) {
        return [];
    }

    if (game.board[row][column] !== EMPTY) {
        return [];
    }

    return DIRECTIONS.flatMap(function (direction) {
        return getFlippedDiscsInDirection(
            game,
            row,
            column,
            player,
            direction
        );
    });
}

/**
 * Checks whether a move is legal.
 *
 * @param {GameState} game - The current game state.
 * @param {number} row - The row index of the move.
 * @param {number} column - The column index of the move.
 * @param {Player} [player=game.currentPlayer] - The player making the move.
 * @returns {boolean} True if the move is legal.
 */
function isMoveLegal(
    game,
    row,
    column,
    player = game.currentPlayer
) {
    return getFlippedDiscs(
        game,
        row,
        column,
        player
    ).length > 0;
}

/**
 * Returns all legal moves for a player.
 *
 * @param {GameState} game - The current game state.
 * @param {Player} [player=game.currentPlayer] - The player to check.
 * @returns {Array<Position>} The legal move positions.
 */

function getValidMoves(game, player = game.currentPlayer) {
    return game.board.flatMap(function (rowValues, row) {
        return rowValues
            .map(function (cell, column) {
                return {
                    row,
                    column,
                    cell
                };
            })
            .filter(function (position) {
                return position.cell === EMPTY;
            })
            .filter(function (position) {
                return isMoveLegal(
                    game,
                    position.row,
                    position.column,
                    player
                );
            })
            .map(function (position) {
                return [position.row, position.column];
            });
    });
}

/**
 * Chooses a move for the computer player.
 *
 * The computer chooses the move that flips the most discs.
 *
 * @param {GameState} game - The current game state.
 * @param {Player} [player=game.currentPlayer] - The computer player.
 * @returns {Position | null} A move, or null if none are available.
 */
function chooseComputerMove(
    game,
    player = game.currentPlayer
) {
    const validMoves = getValidMoves(game, player);

    if (validMoves.length === 0) {
        return null;
    }

    return validMoves.reduce(
        function (bestMove, move) {
            const bestScore = getFlippedDiscs(
                game,
                bestMove[0],
                bestMove[1],
                player
            ).length;

            const moveScore = getFlippedDiscs(
                game,
                move[0],
                move[1],
                player
            ).length;

            if (moveScore > bestScore) {
                return move;
            }

            return bestMove;
        },
        validMoves[0]
    );
}

/**
 * Plays a move for the current player.
 *
 * A legal move returns a new game state. An illegal move returns the original
 * game state unchanged.
 *
 * @param {GameState} game - The current game state.
 * @param {number} row - The row index of the move.
 * @param {number} column - The column index of the move.
 * @returns {GameState} The next game state.
 */
function playMove(game, row, column) {
    const player = game.currentPlayer;
    const flippedDiscs = getFlippedDiscs(
        game,
        row,
        column,
        player
    );

    if (flippedDiscs.length === 0) {
        return game;
    }

    const board = copyBoard(game.board);

    board[row][column] = player;

    flippedDiscs.forEach(function (position) {
        const flippedRow = position[0];
        const flippedColumn = position[1];

        board[flippedRow][flippedColumn] = player;
    });

    const opponent = getOpponent(player);
    const nextGame = {
        board,
        currentPlayer: opponent
    };

    if (getValidMoves(nextGame, opponent).length > 0) {
        return nextGame;
    }

    return {
        board,
        currentPlayer: player
    };
}

/**
 * Passes the turn when the current player has no legal moves.
 *
 * @param {GameState} game - The current game state.
 * @returns {GameState} The next game state.
 */
function passTurn(game) {
    if (getValidMoves(game, game.currentPlayer).length > 0) {
        return game;
    }

    return {
        board: game.board,
        currentPlayer: getOpponent(game.currentPlayer)
    };
}

/**
 * Counts the black and white discs.
 *
 * @param {GameState} game - The current game state.
 * @returns {{black: number, white: number}} The current score.
 */
function getScore(game) {
    return game.board.flat().reduce(
        function (score, cell) {
            if (cell === BLACK) {
                return {
                    black: score.black + 1,
                    white: score.white
                };
            }

            if (cell === WHITE) {
                return {
                    black: score.black,
                    white: score.white + 1
                };
            }

            return score;
        },
        {
            black: 0,
            white: 0
        }
    );
}

/**
 * Checks whether the game has ended.
 *
 * @param {GameState} game - The current game state.
 * @returns {boolean} True if neither player has a legal move.
 */
function isGameOver(game) {
    return (
        getValidMoves(game, BLACK).length === 0 &&
        getValidMoves(game, WHITE).length === 0
    );
}

/**
 * Returns the winner of the game.
 *
 * @param {GameState} game - The current game state.
 * @returns {Player | "draw" | null} The winner, draw, or null.
 */
function getWinner(game) {
    if (!isGameOver(game)) {
        return null;
    }

    const score = getScore(game);

    if (score.black > score.white) {
        return BLACK;
    }

    if (score.white > score.black) {
        return WHITE;
    }

    return "draw";
}

export {
    EMPTY,
    BLACK,
    WHITE,
    DIRECTIONS,
    createGame,
    getBoard,
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
};