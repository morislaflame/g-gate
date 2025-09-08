interface QuickBetButtonProps {
    amount: number;
    onClick: (amount: number) => void;
    disabled?: boolean;
}

const QuickBetButton = ({ amount, onClick, disabled = false }: QuickBetButtonProps) => {
    return (
        <button
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-100 bg-bg-price ${
                disabled 
                    ? 'opacity-disabled cursor-not-allowed' 
                    : 'active:scale-98 active:opacity-pressed'
            }`}
            onClick={() => !disabled && onClick(amount)}
            disabled={disabled}
        >
            {amount.toLocaleString()}
        </button>
    );
};

export default QuickBetButton;