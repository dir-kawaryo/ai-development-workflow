'use client';

import { useMemo, useCallback } from 'react';

import type { Board, Tetromino } from '@/app/types/tetris';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/app/constants/tetris';
import { useTetrisGame } from '@/app/hooks/useTetrisGame';
import { useKeyboardControls } from '@/app/hooks/useKeyboardControls';
import { useGameLoop } from '@/app/hooks/useGameLoop';

export default function TetrisPage() {
  const {
    gameState,
    moveDown,
    moveLeft,
    moveRight,
    rotate,
    hardDrop,
    togglePause,
    resetGame,
    gameIntervalRef,
  } = useTetrisGame();

  useKeyboardControls({
    onMoveLeft: moveLeft,
    onMoveRight: moveRight,
    onMoveDown: moveDown,
    onRotate: rotate,
    onHardDrop: hardDrop,
    onPause: togglePause,
    isGameOver: gameState.isGameOver,
  });

  useGameLoop({
    onTick: moveDown,
    isGameOver: gameState.isGameOver,
    isPaused: gameState.isPaused,
    intervalRef: gameIntervalRef,
  });

  // Render board with current piece overlaid
  const displayBoard = useMemo(() => {
    const board: Board = gameState.board.map(row => [...row]);

    if (gameState.currentPiece) {
      const piece = gameState.currentPiece;
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardY = piece.position.y + y;
            const boardX = piece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              board[boardY][boardX] = piece.color;
            }
          }
        }
      }
    }

    return board;
  }, [gameState.board, gameState.currentPiece]);

  const renderCell = useCallback((color: string | null, rowIndex: number, colIndex: number) => {
    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className="w-full h-full border border-slate-700"
        style={{
          backgroundColor: color || '#1e293b',
        }}
        aria-hidden="true"
      />
    );
  }, []);

  const renderPreviewPiece = (piece: Tetromino | null) => {
    if (!piece) return null;

    return (
      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(4, 1.5rem)` }}>
        {Array.from({ length: 4 }).map((_, y) =>
          Array.from({ length: 4 }).map((_, x) => {
            const hasBlock = piece.shape[y]?.[x] === 1;
            return (
              <div
                key={`preview-${y}-${x}`}
                className="w-6 h-6 border border-slate-700"
                style={{
                  backgroundColor: hasBlock ? piece.color : '#1e293b',
                }}
              />
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Tetris</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Game Board */}
          <div className="bg-slate-950 rounded-2xl shadow-2xl p-6">
            <div
              role="grid"
              aria-label="Tetris game board"
              className="grid gap-0 border-2 border-slate-600"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1.5rem)`,
                gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1.5rem)`,
              }}
            >
              {displayBoard.map((row, rowIndex) =>
                row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
              )}
            </div>

            {/* Game Over Overlay */}
            {gameState.isGameOver && (
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-red-500 mb-2" role="alert">Game Over!</p>
                <button
                  onClick={resetGame}
                  aria-label="Start a new game"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  New Game
                </button>
              </div>
            )}

            {/* Pause Overlay */}
            {gameState.isPaused && !gameState.isGameOver && (
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-yellow-500" role="status">Paused</p>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="flex flex-col gap-6">
            {/* Next Piece */}
            <div className="bg-slate-950 rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Next</h2>
              <div className="flex justify-center">
                {renderPreviewPiece(gameState.nextPiece)}
              </div>
            </div>

            {/* Score */}
            <div className="bg-slate-950 rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Score</h2>
              <p className="text-3xl font-bold text-blue-400">{gameState.score}</p>
            </div>

            {/* Controls */}
            <div className="bg-slate-950 rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
              <div className="text-sm text-slate-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Move Left:</span>
                  <span className="font-mono">←</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Move Right:</span>
                  <span className="font-mono">→</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Soft Drop:</span>
                  <span className="font-mono">↓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rotate:</span>
                  <span className="font-mono">↑</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hard Drop:</span>
                  <span className="font-mono">SPACE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pause:</span>
                  <span className="font-mono">P</span>
                </div>
              </div>
              <button
                onClick={togglePause}
                disabled={gameState.isGameOver}
                aria-label={gameState.isPaused ? 'Resume game' : 'Pause game'}
                className="w-full mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                {gameState.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={resetGame}
                aria-label="Reset game to start over"
                className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Reset Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
