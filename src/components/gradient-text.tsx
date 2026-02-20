import { ComponentPropsWithoutRef } from "react";

export const GradientText = ({
  children,
}: ComponentPropsWithoutRef<"span">) => {
  return (
    <span className="inline-block bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
      {children}
    </span>
  );
};
