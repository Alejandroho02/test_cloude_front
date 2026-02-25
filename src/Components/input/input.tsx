
import type { InputHTMLAttributes } from "react";
import "./input_styles.scss"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = ({ label, type = "text", ...props }: InputProps) => {
    return (
        <div className="section_input">
            {label && (
                <label className="label_style">
                    {label}
                </label>
            )}

            <input
                className="input_style"
                type={type}
                {...props}
            />
        </div>
    );
};
