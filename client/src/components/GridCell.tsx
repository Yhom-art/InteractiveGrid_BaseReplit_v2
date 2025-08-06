import { useRef } from "react";
import { X } from "lucide-react";

interface GridCellProps {
  index: number;
  label: string;
  isExpanded: boolean;
  shouldShiftDown: boolean;
  shouldShiftUp: boolean;
  patternUrl: string;
  onExpand: () => void;
  onAdopted: () => void;
  onCollapse: () => void;
}

export function GridCell({
  index,
  label,
  isExpanded,
  shouldShiftDown,
  shouldShiftUp,
  patternUrl,
  onExpand,
  onAdopted,
  onCollapse,
}: GridCellProps) {
  const cellRef = useRef<HTMLDivElement>(null);

  // Handle primary click on cell (Regular expand mode)
  const handleClick = () => {
    if (!isExpanded) {
      onExpand();
    }
  };

  // Handle secondary click or right-click (Adopted mode)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent browser context menu
    onAdopted();
  };

  // Stop propagation for the close button to prevent triggering cell click
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCollapse();
  };

  // Calculate transform style based on shift direction
  let transformStyle = { transform: "translateY(0)" };
  
  if (shouldShiftDown) {
    transformStyle = { transform: "translateY(66px)" };
  } else if (shouldShiftUp) {
    transformStyle = { transform: "translateY(-128px)" };
  }

  return (
    <div
      ref={cellRef}
      className={`grid-cell w-[128px] overflow-hidden cursor-pointer bg-white ${
        isExpanded ? "h-[192px]" : "h-[128px]"
      }`}
      style={{
        ...transformStyle,
        left: `${(index % 5) * 140}px`,
        top: `${Math.floor(index / 5) * 140}px`,
        transition: "height 0.3s ease, transform 0.3s ease"
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      data-position={index}
    >
      {/* Info text to show which mode to use */}
      <div className="absolute top-0 right-0 p-1 text-[8px] text-black bg-white/50 z-[500]">
        Click: Expand | Right-click: Adopted
      </div>

      {/* Layer 1 - PIC (Background) */}
      <div 
        className="layer-pic absolute top-0 left-0 w-[128px] h-[128px]"
        style={{ backgroundImage: `url(${patternUrl})`, backgroundSize: 'cover' }}
      />

      {/* Main label when collapsed */}
      {!isExpanded && (
        <div className="absolute inset-0 flex justify-center items-center z-10">
          <div>{label}</div>
        </div>
      )}

      {/* Layer 2 - TXT (Centered text) */}
      <div
        className={`layer-txt absolute inset-0 flex justify-center items-center transition-opacity duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        TXT
      </div>

      {/* Layer 3 - CARD (Green square) */}
      <div
        className={`layer-card absolute transition-all duration-300 ${
          isExpanded ? "opacity-70" : "opacity-0"
        }`}
        style={{
          width: '88px',
          height: '88px',
          left: '20px',
          top: '20px',
          margin: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        CARD
      </div>

      {/* Layer 4 - OVERLAY (Pink bar with close button) */}
      <div
        className={`layer-overlay absolute top-0 left-0 right-0 h-[32px] flex justify-between items-center px-3 transition-all duration-300 ${
          isExpanded ? "transform translate-y-0" : "transform -translate-y-full"
        }`}
      >
        <span className="text-xs source-code font-semibold">CONTAINER</span>
        <button
          className="w-[32px] h-[32px] flex justify-center items-center"
          onClick={handleCloseClick}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
