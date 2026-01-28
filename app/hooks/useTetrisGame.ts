import { useState, useCallback, useRef } from 'react';

import type { GameState, Tetromino } from '@/app/types/tetris';
import {
  createEmptyBoard,
  createRandomTetromino,
  checkCollision,
  mergePieceToBoard,
  clearLines,
  calculateScore,
  rotateTetromino,
  isGameOver,
} from '@/app/utils/tetris';

export function useTetrisGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    currentPiece: createRandomTetromino(),
    nextPiece: createRandomTetromino(),
    score: 0,
    isGameOver: false,
    isPaused: false,
  }));

  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const moveDown = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || prev.isPaused || !prev.currentPiece) {
        return prev;
      }

      // Try to move down
      if (!checkCollision(prev.board, prev.currentPiece, 0, 1)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              ...prev.currentPiece.position,
              y: prev.currentPiece.position.y + 1,
            },
          },
        };
      }

      // Can't move down - merge piece to board
      const mergedBoard = mergePieceToBoard(prev.board, prev.currentPiece);
      const { newBoard, linesCleared } = clearLines(mergedBoard);
      const newScore = prev.score + calculateScore(linesCleared);

      // Check game over
      if (isGameOver(newBoard)) {
        return {
          ...prev,
          board: newBoard,
          score: newScore,
          isGameOver: true,
          currentPiece: null,
        };
      }

      // Spawn next piece
      return {
        ...prev,
        board: newBoard,
        currentPiece: prev.nextPiece,
        nextPiece: createRandomTetromino(),
        score: newScore,
      };
    });
  }, []);

  const moveLeft = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || prev.isPaused || !prev.currentPiece) {
        return prev;
      }

      if (!checkCollision(prev.board, prev.currentPiece, -1, 0)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              ...prev.currentPiece.position,
              x: prev.currentPiece.position.x - 1,
            },
          },
        };
      }

      return prev;
    });
  }, []);

  const moveRight = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || prev.isPaused || !prev.currentPiece) {
        return prev;
      }

      if (!checkCollision(prev.board, prev.currentPiece, 1, 0)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              ...prev.currentPiece.position,
              x: prev.currentPiece.position.x + 1,
            },
          },
        };
      }

      return prev;
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || prev.isPaused || !prev.currentPiece) {
        return prev;
      }

      const rotated = rotateTetromino(prev.currentPiece);

      if (!checkCollision(prev.board, rotated)) {
        return {
          ...prev,
          currentPiece: rotated,
        };
      }

      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || prev.isPaused || !prev.currentPiece) {
        return prev;
      }

      let piece: Tetromino = prev.currentPiece;

      // Drop until collision
      while (!checkCollision(prev.board, piece, 0, 1)) {
        piece = {
          ...piece,
          position: {
            ...piece.position,
            y: piece.position.y + 1,
          },
        };
      }

      // Merge and continue
      const mergedBoard = mergePieceToBoard(prev.board, piece);
      const { newBoard, linesCleared } = clearLines(mergedBoard);
      const newScore = prev.score + calculateScore(linesCleared);

      if (isGameOver(newBoard)) {
        return {
          ...prev,
          board: newBoard,
          score: newScore,
          isGameOver: true,
          currentPiece: null,
        };
      }

      return {
        ...prev,
        board: newBoard,
        currentPiece: prev.nextPiece,
        nextPiece: createRandomTetromino(),
        score: newScore,
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: createRandomTetromino(),
      nextPiece: createRandomTetromino(),
      score: 0,
      isGameOver: false,
      isPaused: false,
    });
  }, []);

  return {
    gameState,
    moveDown,
    moveLeft,
    moveRight,
    rotate,
    hardDrop,
    togglePause,
    resetGame,
    gameIntervalRef,
  };
}
