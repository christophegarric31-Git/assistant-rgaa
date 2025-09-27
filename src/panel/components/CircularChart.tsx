import React from 'react';

interface CircularChartProps {
	percentage: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
	backgroundColor?: string;
}

const CircularChart: React.FC<CircularChartProps> = ({
	percentage,
	size = 100,
	strokeWidth = 6,
	color = '#2563eb',
	backgroundColor = '#e5e7eb'
}) => {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDasharray = circumference;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<div className="CircularChart" style={{width: size, height: size}}>
			<svg
				width={size}
				height={size}
				className="CircularChart-svg"
				aria-label={`Graphique circulaire montrant ${percentage}% de conformité`}
				role="img"
				focusable="false"
			>
				{/* Cercle de fond */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={backgroundColor}
					strokeWidth={strokeWidth}
					className="CircularChart-background"
				/>
				
				{/* Cercle de progression */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeDasharray={strokeDasharray}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					className="CircularChart-progress"
					style={{
						transform: 'rotate(-90deg)',
						transformOrigin: '50% 50%',
						transition: 'stroke-dashoffset 0.5s ease-in-out'
					}}
				/>
			</svg>
			
			{/* Texte au centre */}
			<div className="CircularChart-text">
				<span className="CircularChart-percentage" aria-hidden="true">
					{percentage}%
				</span>
				<span className="sr-only">
					{percentage}% de conformité
				</span>
			</div>
		</div>
	);
};

export default CircularChart;
