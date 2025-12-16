import React, {ButtonHTMLAttributes} from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const baseStylesButton =
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap px-3 text-white text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-white hover:opacity-95 transition-opacity h-9 rounded-md";
export const variantsButton = {
  primary: "bg-gradient-to-r from-sefa-cyan to-sefa-mint",
  secondary: "!text-sefa-cyan border border-sefa-cyan",
};


export const Button = (
  {
    children,
    variant = "primary",
    className = "",
    ...props
  }: ButtonProps) => {

  return (
    <button
      className={`${baseStylesButton} ${variantsButton[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
