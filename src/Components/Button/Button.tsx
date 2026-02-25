import type { HtmlHTMLAttributes } from "react";
import "./Button_styles.scss"

interface ButtonProps extends HtmlHTMLAttributes<HTMLButtonElement>{
    children: React.ReactNode,
    type?: "submit" | "button"
    disabled: boolean
    
}

export const Button = ({children, disabled, type = "button", ...props}: ButtonProps) => {

    return(
        <button type={type} disabled className="section_Button_styles"  {...props}>
            {children}
        </button>
    );
}