// src/contexts/PatternContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const PatternContext = createContext();

const initialState = {
  image: null,
  preview: null,
  pattern: null,
  gridDimensions: { width: 20, height: 20 },
  numColors: 4,
  colorPalette: [],
  yarnSuggestions: [],
  currentRow: 0,
  completedRows: [],
  notes: {},
  undoStack: [],
  redoStack: [],
  settings: {
    showGrid: true,
    showRowMarkers: true,
    gridLineThickness: 1,
    rowMarkerFrequency: 5,
    defaultGridSize: { width: 20, height: 20 },
  },
};

function patternReducer(state, action) {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, image: action.payload };
    case 'SET_PREVIEW':
      return { ...state, preview: action.payload };
    case 'SET_PATTERN':
      return { 
        ...state, 
        pattern: action.payload,
        undoStack: [...state.undoStack, state.pattern],
        redoStack: []
      };
    case 'SET_GRID_DIMENSIONS':
      return { ...state, gridDimensions: action.payload };
    case 'SET_COLOR_PALETTE':
      return { ...state, colorPalette: action.payload };
    case 'UPDATE_COLOR':
      const newPattern = state.pattern.map(row =>
        row.map(cell => cell === action.payload.oldColor ? action.payload.newColor : cell)
      );
      return {
        ...state,
        pattern: newPattern,
        undoStack: [...state.undoStack, state.pattern],
        redoStack: []
      };
    case 'SET_CURRENT_ROW':
      return { ...state, currentRow: action.payload };
    case 'COMPLETE_ROW':
      return {
        ...state,
        completedRows: [...state.completedRows, action.payload].sort((a, b) => a - b)
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: { ...state.notes, [action.payload.row]: action.payload.text }
      };
    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const previousPattern = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        pattern: previousPattern,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [state.pattern, ...state.redoStack]
      };
    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const nextPattern = state.redoStack[0];
      return {
        ...state,
        pattern: nextPattern,
        redoStack: state.redoStack.slice(1),
        undoStack: [...state.undoStack, state.pattern]
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    default:
      return state;
  }
}

export function PatternProvider({ children }) {
  const [state, dispatch] = useReducer(patternReducer, initialState);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('patternState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      Object.entries(parsedState).forEach(([key, value]) => {
        dispatch({ type: `SET_${key.toUpperCase()}`, payload: value });
      });
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const stateToSave = {
      pattern: state.pattern,
      colorPalette: state.colorPalette,
      currentRow: state.currentRow,
      completedRows: state.completedRows,
      notes: state.notes,
      settings: state.settings,
    };
    localStorage.setItem('patternState', JSON.stringify(stateToSave));
  }, [state]);

  const value = {
    state,
    dispatch,
  };

  return (
    <PatternContext.Provider value={value}>
      {children}
    </PatternContext.Provider>
  );
}

export function usePattern() {
  const context = useContext(PatternContext);
  if (context === undefined) {
    throw new Error('usePattern must be used within a PatternProvider');
  }
  return context;
}