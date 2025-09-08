const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg 
        width="16" 
        height="15" 
        viewBox="0 0 16 15" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path 
            d="M14.5 7.5H1.5M8 1V14" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
        />
    </svg>
);

export default PlusIcon;