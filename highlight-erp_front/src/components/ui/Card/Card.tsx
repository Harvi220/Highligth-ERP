// src/components/ui/Card/Card.tsx
import clsx from "clsx";
import styles from "./Card.module.css";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return <div className={clsx(styles.card, className)}>{children}</div>;
};

export { Card };
