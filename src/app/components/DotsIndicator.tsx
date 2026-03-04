interface DotsIndicatorProps {
  total: number;
  active: number;
}

export function DotsIndicator({ total, active }: DotsIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          className={`transition-all duration-300 rounded-full ${
            index === active
              ? 'w-6 h-1.5 bg-[#FF4DB8]'
              : 'w-1.5 h-1.5 bg-gray-300 hover:bg-[#FF4DB8]/50'
          }`}
        />
      ))}
    </div>
  );
}