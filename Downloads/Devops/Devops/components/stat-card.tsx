function StatCard({
  title,
  value,
  icon,
  color,
  progress,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
  progress: number;
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow relative overflow-hidden group">
      <div className="flex justify-between mb-6">
        <div>
          <p className="text-sm uppercase text-[#685942]">{title}</p>
          <h3 className="text-4xl font-black" style={{ color }}>
            {value}
          </h3>
        </div>

        <span className="material-symbols-outlined text-3xl" style={{ color }}>
          {icon}
        </span>
      </div>

      {/* Circular Chart */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="-rotate-90 w-full h-full" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#eee"
              strokeWidth="4"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color }}>
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
