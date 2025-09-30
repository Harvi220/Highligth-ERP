import { type ElementType, type ReactNode } from "react";
import clsx from "clsx";

type TypographyVariant =
  | "title-hero"
  | "title-page"
  | "subtitle"
  | "heading"
  | "subheading"
  | "body-base"
  | "body-strong"
  | "body-emphasis"
  | "body-link"
  | "body-small"
  | "body-small-strong"
  | "body-code"
  | "body-base-single"
  | "body-small-strong-single";

// Маппинг варианта на семантический HTML-тег по умолчанию
const variantMapping: Record<TypographyVariant, ElementType> = {
  "title-hero": "h1",
  "title-page": "h2",
  subtitle: "h3",
  heading: "h4",
  subheading: "h5",
  "body-base": "p",
  "body-strong": "p",
  "body-emphasis": "p",
  "body-link": "a",
  "body-small": "p",
  "body-small-strong": "p",
  "body-code": "code",
  "body-base-single": "p",
  "body-small-strong-single": "p",
};

interface TypographyProps<T extends ElementType> {
  variant?: TypographyVariant;
  children: ReactNode;
  className?: string;
  // Позволяет переопределить тег, например, сделать заголовок тегом <p>
  as?: T;
}

// Типизация, чтобы 'as' прокидывал стандартные атрибуты HTML-тега
type PolymorphicTypography = <T extends ElementType = "p">(
  props: TypographyProps<T> &
    Omit<React.ComponentProps<T>, keyof TypographyProps<T>>
) => React.ReactElement | null;

export const Typography: PolymorphicTypography = ({
  variant = "body-base",
  children,
  className,
  as,
  ...props
}) => {
  const Component = as || variantMapping[variant] || "p";

  return (
    <Component
      className={clsx(
        `text-${variant}`, // Наш утилитарный класс из global.css
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
