import type { HSKLevel } from '../interfaces/HSKLevel';

interface LevelSelectorProps {
  onSelectLevel: (level: HSKLevel) => void;
  selectedLevel?: HSKLevel;
}

export const LevelSelector = ({ onSelectLevel, selectedLevel }: LevelSelectorProps) => {
  const levels: HSKLevel[] = [1, 2, 3];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-6 md:mb-8 text-center">
        Select HSK Level
      </h2>
      <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onSelectLevel(level)}
            className={`
              relative p-4 md:p-6 rounded-xl md:rounded-2xl transition-all duration-300 ease-in-out
              card-shadow hover:scale-105 active:scale-95
              ${selectedLevel === level
                ? 'bg-gradient-to-br from-green to-teal text-white'
                : 'bg-white text-navy hover:bg-mint'
              }
            `}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1 md:mb-2">
                {level}
              </div>
              <div className="text-xs md:text-sm font-medium opacity-80">
                HSK {level}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
