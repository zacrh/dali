import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="group relative inline-block w-max">
      {children}
      <div className="absolute z-10 invisible -translate-y-[4px] opacity-0 mt-0.5 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 w-max left-1/2 -translate-x-1/2 text-sm font-medium px-2 py-1 rounded-md bg-gray-50 dark:bg-tertiary border border-gray-200 dark:border-border drop-shadow-lg">
        {content}
        {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 transform rotate-45 bg-gray-900"></div> */}
      </div>
    </div>
  );
};

export default Tooltip;
