import { X } from "lucide-react";

interface AdoptedCardProps {
  index: number;
  onClose: () => void;
}

export function AdoptedCard({ index, onClose }: AdoptedCardProps) {
  // Calculate position to align with the target cell
  const left = (index % 5) * 140; // same column
  const top = Math.floor(index / 5) * 140; // same row
  
  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className="absolute z-[1000] w-[128px] h-[128px] overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: '#999999',
        left: `${left}px`,
        top: `${top}px`,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Centered Text */}
      <div className="absolute inset-0 flex flex-col justify-center items-center">
        <span className="font-['Roboto_Mono'] text-white text-[12px] font-bold">CARD</span>
        <span className="font-['Roboto_Mono'] text-white text-[12px]">Adopted</span>
      </div>

      {/* Close button */}
      <button
        className="absolute top-2 right-2 w-[24px] h-[24px] rounded-full bg-white/20 text-white flex justify-center items-center hover:bg-white/40 transition-colors"
        onClick={handleCloseClick}
      >
        <X size={16} />
      </button>
    </div>
  );
}