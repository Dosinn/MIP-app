import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import '../LoginFlow.css';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
}

function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

    const setDigit = (index: number, digit: string) => {
        const next = [...digits];
        next[index] = digit;
        onChange(next.join(''));
    };

    const handleChange = (index: number, rawValue: string) => {
        const digit = rawValue.replace(/\D/g, '').slice(-1);
        setDigit(index, digit);
        if (digit && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pasted);
        inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
    };

    return (
        <div className="otpInput">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputsRef.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otpCell"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    {...(index === 0 ? { autoFocus: true } : {})}
                />
            ))}
        </div>
    );
}

export default OtpInput;