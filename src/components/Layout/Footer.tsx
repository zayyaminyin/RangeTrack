import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white text-center py-6 px-4 text-sm md:block hidden">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌾</span>
            <p className="font-semibold">RangeTrack - Smart Farm & Ranch Companion</p>
          </div>
          <div className="flex items-center space-x-6 text-xs text-primary-200">
            <p>© 2024 RangeTrack</p>
            <p>Built for farmers, by farmers</p>
          </div>
        </div>
      </div>
    </footer>
  );
};