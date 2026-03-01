import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import ChairIcon from '@mui/icons-material/Chair';
import type { Room, Seat, RoomElement, SeatPosition } from '../types/booking';

const MotionBox = motion.create(Box);

interface RoomSeatMapProps {
    room: Room;
    gridCols: number;
    gridRows: number;
    seatPositions: SeatPosition[];
    elements: RoomElement[];
    selectedSeatId?: string;
    onSeatClick: (seat: Seat) => void;
}

const RoomSeatMap: React.FC<RoomSeatMapProps> = ({
    room, gridCols, gridRows, seatPositions, elements, selectedSeatId, onSeatClick,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Build a map of seat positions → Seat objects
    const seatGrid = new Map<string, Seat>();
    seatPositions.forEach(sp => {
        const seat = room.seats.find(s => s.id === sp.seatId);
        if (seat) seatGrid.set(`${sp.gridRow}-${sp.gridCol}`, seat);
    });



    // ── Wall/entrance detection (checks direct + adjacent cell's shared side) ──
    const hasElementAt = (type: string, row: number, col: number, side: string): boolean => {
        return elements.some(e => e.type === type && e.gridRow === row && e.gridCol === col && e.side === side);
    };

    // Check if a shared edge has a wall (either side)
    const isWallEdge = (row: number, col: number, side: string): boolean => {
        if (hasElementAt('wall', row, col, side)) return true;
        if (side === 'right' && col < gridCols - 1) return hasElementAt('wall', row, col + 1, 'left');
        if (side === 'bottom' && row < gridRows - 1) return hasElementAt('wall', row + 1, col, 'top');
        if (side === 'left' && col > 0) return hasElementAt('wall', row, col - 1, 'right');
        if (side === 'top' && row > 0) return hasElementAt('wall', row - 1, col, 'bottom');
        return false;
    };

    const isEntranceEdge = (row: number, col: number, side: string): boolean => {
        if (hasElementAt('entrance', row, col, side)) return true;
        if (side === 'right' && col < gridCols - 1) return hasElementAt('entrance', row, col + 1, 'left');
        if (side === 'bottom' && row < gridRows - 1) return hasElementAt('entrance', row + 1, col, 'top');
        if (side === 'left' && col > 0) return hasElementAt('entrance', row, col - 1, 'right');
        if (side === 'top' && row > 0) return hasElementAt('entrance', row - 1, col, 'bottom');
        return false;
    };

    // ── Border style: only render right/bottom borders to avoid doubles ──
    // Left/top only rendered for edge-of-grid cells
    const wallColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
    const entranceColor = '#00e676';

    const getCellBorders = (row: number, col: number): React.CSSProperties => {
        const style: React.CSSProperties = {};

        // Right border
        if (isWallEdge(row, col, 'right')) style.borderRight = `3px solid ${wallColor}`;
        else if (isEntranceEdge(row, col, 'right')) style.borderRight = `6px solid ${entranceColor}`;

        // Bottom border
        if (isWallEdge(row, col, 'bottom')) style.borderBottom = `3px solid ${wallColor}`;
        else if (isEntranceEdge(row, col, 'bottom')) style.borderBottom = `6px solid ${entranceColor}`;

        // Left border — walls only at grid boundary, but entrances always
        if (isEntranceEdge(row, col, 'left')) style.borderLeft = `6px solid ${entranceColor}`;
        else if (col === 0 && isWallEdge(row, col, 'left')) style.borderLeft = `3px solid ${wallColor}`;

        // Top border — walls only at grid boundary, but entrances always
        if (isEntranceEdge(row, col, 'top')) style.borderTop = `6px solid ${entranceColor}`;
        else if (row === 0 && isWallEdge(row, col, 'top')) style.borderTop = `3px solid ${wallColor}`;

        return style;
    };

    // ── Dynamic cell size based on grid size ──
    const totalCells = gridRows * gridCols;
    const cellSize = totalCells > 100 ? 48 : totalCells > 60 ? 56 : totalCells > 30 ? 64 : 72;

    // Check if layout has any positioned seats
    const hasLayout = seatPositions.length > 0;

    if (!hasLayout) {
        // Fallback: simple flat grid
        return (
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(auto-fill, minmax(52px, 1fr))', md: 'repeat(auto-fill, minmax(60px, 1fr))' },
                gap: 1,
            }}>
                {room.seats.map((seat, i) => {
                    const isSelected = selectedSeatId === seat.id;
                    return (
                        <MotionBox
                            key={seat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.012, duration: 0.2 }}
                            onClick={() => seat.available && onSeatClick(seat)}
                            sx={{
                                aspectRatio: '1',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                borderRadius: 2,
                                cursor: seat.available ? 'pointer' : 'not-allowed',
                                opacity: seat.available ? 1 : 0.3,
                                border: '2px solid',
                                borderColor: isSelected ? 'primary.main' : seat.available
                                    ? (isDark ? 'rgba(0,173,181,0.35)' : 'rgba(59,172,182,0.3)')
                                    : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                bgcolor: isSelected
                                    ? (isDark ? 'rgba(0,173,181,0.2)' : 'rgba(59,172,182,0.15)')
                                    : seat.available
                                        ? (isDark ? 'rgba(0,173,181,0.06)' : 'rgba(59,172,182,0.04)')
                                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                                boxShadow: isSelected ? `0 0 10px ${theme.palette.primary.main}30` : 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': seat.available ? {
                                    transform: 'scale(1.06)',
                                    borderColor: 'primary.main',
                                    boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                                } : {},
                            }}
                        >
                            <ChairIcon sx={{
                                fontSize: 16, mb: '2px',
                                color: isSelected ? 'primary.main' : seat.available ? 'primary.light' : 'text.disabled',
                            }} />
                            <Typography
                                sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: isSelected ? 800 : 600,
                                    color: isSelected ? 'primary.main' : 'text.primary',
                                    lineHeight: 1,
                                }}
                            >
                                {seat.seatNo}
                            </Typography>
                        </MotionBox>
                    );
                })}
            </Box>
        );
    }

    // ── Visual Layout mode (auto-cropped) ──
    return (
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)`,
                    gap: 0,
                    mx: 'auto',
                    width: 'fit-content',
                    border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                {Array.from({ length: gridRows }).map((_, row) =>
                    Array.from({ length: gridCols }).map((_, col) => {
                        const seat = seatGrid.get(`${row}-${col}`);
                        const isSelected = seat && selectedSeatId === seat.id;
                        const borders = getCellBorders(row, col);

                        return (
                            <MotionBox
                                key={`${row}-${col}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: (row * gridCols + col) * 0.002, duration: 0.1 }}
                                onClick={() => seat && seat.available && onSeatClick(seat)}
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: seat?.available ? 'pointer' : 'default',
                                    // Grid lines
                                    borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    // Override with wall/entrance borders
                                    ...borders,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {seat && (
                                    <Box
                                        sx={{
                                            width: `${cellSize - 8}px`,
                                            height: `${cellSize - 8}px`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 1.5,
                                            p: '4px',
                                            cursor: seat.available ? 'pointer' : 'not-allowed',
                                            opacity: seat.available ? 1 : 0.4,
                                            bgcolor: isSelected
                                                ? (isDark ? 'rgba(46,204,113,0.35)' : 'rgba(46,204,113,0.25)')
                                                : seat.available
                                                    ? (isDark ? 'rgba(52,152,219,0.25)' : 'rgba(52,152,219,0.15)')
                                                    : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                                            border: `2px solid ${isSelected
                                                ? '#2ecc71'
                                                : seat.available
                                                    ? (isDark ? 'rgba(52,152,219,0.7)' : 'rgba(52,152,219,0.6)')
                                                    : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')
                                                }`,
                                            boxShadow: isSelected
                                                ? '0 0 16px rgba(46,204,113,0.5), 0 0 6px rgba(46,204,113,0.3)'
                                                : seat.available
                                                    ? '0 1px 4px rgba(52,152,219,0.15)'
                                                    : 'none',
                                            transition: 'all 0.2s ease',
                                            '&:hover': seat.available ? {
                                                transform: 'scale(1.08)',
                                                bgcolor: isDark ? 'rgba(52,152,219,0.35)' : 'rgba(52,152,219,0.22)',
                                                borderColor: '#3498db',
                                                boxShadow: '0 4px 16px rgba(52,152,219,0.35)',
                                            } : {},
                                        }}
                                    >
                                        <ChairIcon sx={{
                                            fontSize: cellSize > 44 ? 18 : 15,
                                            color: isSelected ? '#2ecc71' : seat.available ? '#3498db' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'),
                                            mb: '2px',
                                        }} />
                                        <Typography
                                            sx={{
                                                fontSize: cellSize > 44 ? '0.68rem' : '0.58rem',
                                                fontWeight: 800,
                                                lineHeight: 1,
                                                color: isSelected ? '#2ecc71' : seat.available ? (isDark ? '#fff' : '#2c3e50') : 'text.disabled',
                                                letterSpacing: '0.03em',
                                            }}
                                        >
                                            {seat.seatNo}
                                        </Typography>
                                    </Box>
                                )}
                            </MotionBox>
                        );
                    })
                )}
            </Box>
        </Box>
    );
};

export default RoomSeatMap;
