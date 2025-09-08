import { useState } from 'react';
import QuickBetButton from './ui/QuickBetButton';
import PlusIcon from '@/assets/Plus.svg';
import MinusIcon from '@/assets/Minus.svg';
import Button from './ui/Button';

interface BetWindowProps {
    userBalance?: number; // Моковый баланс пользователя
    onBetChange?: (amount: number) => void;
}

const BetWindow = ({ userBalance = 10000, onBetChange }: BetWindowProps) => {
    const [betAmount, setBetAmount] = useState<number>(0);

    const handleAmountChange = (newAmount: number) => {
        // Проверяем, что сумма не превышает баланс и не отрицательная
        const validAmount = Math.max(0, Math.min(newAmount, userBalance));
        setBetAmount(validAmount);
        onBetChange?.(validAmount);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        handleAmountChange(value);
    };

    const incrementAmount = () => {
        handleAmountChange(betAmount + 100);
    };

    const decrementAmount = () => {
        handleAmountChange(betAmount - 100);
    };

    const quickBetAmounts = [100, 500, 1000, 5000];

    return (
        <div className="bg-main-bg-secondary p-4 rounded-lg w-full">
            {/* Инпут с кнопками +/- */}
            <div className="flex items-center gap-2 mb-4">
                <button
                    className="bg-button-price hover:bg-opacity-80 active:scale-95 transition-all duration-100 flex items-center justify-center w-[36px] h-[36px] rounded-md border-2 border-border-button text-white disabled:opacity-disabled"
                    onClick={decrementAmount}
                    disabled={betAmount <= 0}
                >
                    <img src={MinusIcon} alt="Minus" className="w-4 h-4" />
                </button>
                
                <div className="flex flex-col items-center justify-center flex-1">
                    <span className="text-text-secondary text-xs font-600 text-center">
                        Ваша ставка в G Coins
                    </span>

                    <input
                        type="number"
                        value={betAmount}
                        onChange={handleInputChange}
                        className="flex-1 text-center text-28 bg-transparent border-none outline-none text-white"
                        placeholder="0"
                        min="0"
                        max={userBalance}
                    />
                </div>
                
                <button
                    className="bg-button-price hover:bg-opacity-80 active:scale-95 transition-all duration-100 flex items-center justify-center w-[36px] h-[36px] rounded-md border-2 border-border-button text-white disabled:opacity-disabled"
                    onClick={incrementAmount}
                    disabled={betAmount >= userBalance}
                >
                    <img src={PlusIcon} alt="Plus" className="w-4 h-4" />
                </button>
            </div>

            {/* Сепаратор */}
            <div className="border-t border-border-button my-4"></div>

            {/* Кнопки быстрого ввода */}
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                    {quickBetAmounts.map((amount) => (
                        <QuickBetButton
                            key={amount}
                            amount={amount}
                            onClick={handleAmountChange}
                            disabled={amount > userBalance}
                        />
                    ))}
                </div>
                
            <Button
                text="Сделать ставку"
                type="primary"
                onClick={() => handleAmountChange(betAmount)}
                disabled={betAmount <= 0}
            />
            </div>


            {/* Информация о балансе */}
            <div className="mt-4 pt-3 border-t border-border-button">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-white opacity-70">Баланс:</span>
                    <span className="text-white font-medium">
                        {userBalance.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BetWindow;