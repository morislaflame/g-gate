

const LabelValue = ({ value, type }: { value: string, type: string }) => {

    const appearance = () => {
        if (type === '') {
            return 'bg-primary';
        } else if (type === 'number') {
            return 'bg-secondary';
        } else if (type === 'date') {
            return 'bg-secondary';
        }
        return 'bg-secondary'; // Добавляем fallback
    }

    return (
        <div className={`${appearance()} p-2 rounded-md text-glow`}>
            <span>{value}</span>
        </div>
    )
}

export default LabelValue;