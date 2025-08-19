import React from 'react';

type SegmentedVoteSliderProps = {
  value: number;
  onChange: (newValue: number) => void;
  segments?: number;
};

const SegmentedVoteSlider = ({ value, onChange, segments = 5 }: SegmentedVoteSliderProps) => {
  const segmentSize = 100 / segments;

  const handleClick = (segmentIndex: number) => {
    onChange(segmentSize * (segmentIndex + 1));
  };

  return (
    <div className="flex gap-1 select-none" aria-label="Segmented Voting Slider" role="radiogroup">
      {[...Array(segments)].map((_, i) => {
        const isActive = value >= segmentSize * (i + 1);
        return (
          <div
            key={i}
            role="radio"
            aria-checked={isActive}
            tabIndex={0}
            onClick={() => handleClick(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(i);
              }
            }}
            style={{
              flex: 1,
              height: 20,
              background: isActive
                ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                : '#374151',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
};

export default SegmentedVoteSlider;
