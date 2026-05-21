import { Button } from "@bitnation-dev/components";
import Link from "next/link";

export const ScheduleButton = () => {
  return (
    <Link className="w-fit" href={"/contacto"}>
      <Button
        className="!bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] !h-12 !rounded-none !text-black"
        fit
      >
        <p>Agendar consultoría</p>
      </Button>
    </Link>
  );
};
