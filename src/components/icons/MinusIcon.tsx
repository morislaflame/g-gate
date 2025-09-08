const MinusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg 
        width="16" 
        height="3" 
        viewBox="0 0 16 3" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path 
            d="M1.5 1.5H14.5" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
        />
    </svg>
);

export default MinusIcon;