import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "text";

interface ButtonProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
  variant?: ButtonVariant;
}

const Button = ({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) => {
  const buttonClasses = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export { Button };
