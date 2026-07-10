"use client";
import { Button } from "@bitnation-dev/components";
import Link from "next/link";
import posthog from "posthog-js";

export const ScheduleButton = () => {
  return (
    <Link
      className="w-fit"
      href={"/contacto"}
      onClick={() => posthog.capture("sales_cta_clicked")}
    >
      <Button
        className="!bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] !h-12 !rounded-none !text-black"
        fit
      >
        <p>Agendar consultoría</p>
      </Button>
    </Link>
  );
};
