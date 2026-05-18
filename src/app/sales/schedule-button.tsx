import Link from "next/link";

export const ScheduleButton = () => {
  return (
    <Link className="w-fit" href={"/contacto"}>
      <button className="bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] h-12 px-6 text-black font-semibold">
        <p>Agendar consultoría</p>
      </button>
    </Link>
  );
};
