import { useState } from "react";
import { GridCell } from "@/components/GridCell";
import { AdoptedCard } from "@/components/AdoptedCard";
import { patterns } from "@/assets/patterns";

// Enum to define different cell opening modes
export enum OpenMode {
  None = "none",
  Expand = "expand",
  Adopted = "adopted"
}

export function GridContainer() {
  const [openMode, setOpenMode] = useState<OpenMode>(OpenMode.None);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Create an array of 25 cells (5x5 grid)
  const cells = Array.from({ length: 25 }, (_, index) => index);

  // Get column from position (0-4)
  const getColumn = (position: number): number => {
    return position % 5;
  };

  // Handle cell expansion (regular mode)
  const handleExpand = (index: number) => {
    setSelectedIndex(index);
    setOpenMode(OpenMode.Expand);
  };

  // Handle cell adopted mode
  const handleAdopted = (index: number) => {
    setSelectedIndex(index);
    setOpenMode(OpenMode.Adopted);
  };

  // Handle cell collapse (any mode)
  const handleCollapse = () => {
    setSelectedIndex(null);
    setOpenMode(OpenMode.None);
  };

  // Calculate if a cell should be shifted down
  const shouldShiftDown = (index: number): boolean => {
    if (selectedIndex === null || openMode !== OpenMode.Expand) return false;
    
    // If cell is in the same column as expanded cell and below it
    return (
      getColumn(index) === getColumn(selectedIndex) && 
      index > selectedIndex
    );
  };

  // Calculate if a cell should be shifted up (for adopted mode)
  const shouldShiftUp = (index: number): boolean => {
    if (selectedIndex === null || openMode !== OpenMode.Adopted) return false;
    
    // If cell is in the same column as adopted cell and above it
    return (
      getColumn(index) === getColumn(selectedIndex) && 
      index < selectedIndex
    );
  };

  // Calculate the container height (5 rows * 140px per row + extra space for expansion)
  const containerHeight = 5 * 140 + 66;

  // Determine if we should render an adopted card
  const showAdoptedCard = selectedIndex !== null && openMode === OpenMode.Adopted;

  return (
    <div 
      className="relative mx-auto" 
      style={{ 
        width: '700px', 
        height: `${containerHeight}px`,
      }}
    >
      {cells.map((index) => (
        <GridCell
          key={index}
          index={index}
          label={`Cell ${index + 1}`}
          isExpanded={selectedIndex === index && openMode === OpenMode.Expand}
          shouldShiftDown={shouldShiftDown(index)}
          shouldShiftUp={shouldShiftUp(index)}
          patternUrl={patterns[index % patterns.length]}
          onExpand={() => handleExpand(index)}
          onAdopted={() => handleAdopted(index)}
          onCollapse={handleCollapse}
        />
      ))}

      {/* Render adopted card if needed */}
      {showAdoptedCard && selectedIndex !== null && (
        <AdoptedCard
          index={selectedIndex}
          onClose={handleCollapse}
        />
      )}
    </div>
  );
}
