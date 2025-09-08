interface ButtonProps {
    text: string;
    type: string;
    onClick: () => void;
    disabled?: boolean;
}

const Button = ({ text, type, onClick, disabled = false }: ButtonProps) => {

    const getBackgroundStyle = () => {
        if (type === 'primary') {
            return { background: 'var(--color-primary)' };
        } else if (type === 'secondary') {
            return { background: 'var(--color-secondary)' };
        }
        return {};
    }

    const disabledAppearance = () => {
        if (disabled) {
            return 'opacity-disabled';
        }
        return '';
    }
            
    return (
        <button 
        className={`${disabledAppearance()} font-600 text-base px-4 py-2 rounded-lg border-2 border-border-button w-full active:opacity-pressed active:scale-98 transition-all duration-100`} 
        style={getBackgroundStyle()}
        onClick={onClick}
        disabled={disabled}>
            <span>{text}</span>
        </button>
    )
}

export default Button;