import { ComponentPropsWithoutRef } from "react";
import TypingText from "./TypingText";
import clsx from "clsx";

export const Header = ({
  className,
  children,
  as = "h2",
  ...props
}: ComponentPropsWithoutRef<"h2"> & {
  as?: "h1" | "h2";
}) => {
  const Tag = as;
  return (
    <Tag
      className={clsx(" font-bold text-4xl md:text-5xl", className)}
      {...props}
    >
      <TypingText
        text={children as string}
        duration={1.4}
        delay={0}
        startAt={12}
      />
    </Tag>
  );
};
