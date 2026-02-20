import { Repeat2, Star, Vote, ArrowUpRight } from "lucide-react";

interface CardPoolProps {
  position: number;
  logo: string;
  title: string;
  description: string;
  about: string;
  where: string;
  shares: number;
  partners: number;
  votes: number;
}

const CardPool = ({
  position,
  logo,
  title,
  description,
  about,
  where,
  shares,
  partners,
  votes,
}: CardPoolProps) => {
  return (
    <div className="gap-2 relative border border-black p-5 max-w-xs flex flex-col items-center bg-white">
      <div className="absolute top-3 left-3 text-gray font-semibold text-sm">
        <span
          className={`text-black ${position === 1 || position === 2 || position === 3 ? "text-green" : "text-black"}`}
        >
          {position}
          {position === 1
            ? "er"
            : position === 2
              ? "do"
              : position === 3
                ? "er"
                : "to"}
        </span>
      </div>
      <div className="rounded-full w-20 h-20 flex items-center justify-center mb-5">
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="w-20 h-20 bg-gray rounded-full flex items-center justify-center"></div>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2 text-black">{title}</h3>
      <p className="text-xs text-center text-black mb-4 px-4 leading-snug">
        {description}
      </p>
      <div className="flex space-x-2 mb-5">
        <span className="px-3 py-0.5 border border-brand-orange rounded-full text-xs text-black">
          {about}
        </span>
        <span className="px-3 py-0.5 border border-brand-orange rounded-full text-xs text-black">
          {where}
        </span>
      </div>
      <div className="flex justify-between w-full mb-5 px-1">
        <div className="flex items-center text-xs gap-1.5">
          <Repeat2 className="w-4 h-4 text-brand-orange" />
          <span className="text-black">{shares} Shares</span>
          <span className="text-black">|</span>
        </div>
        <div className="flex items-center text-xs gap-1.5">
          <Star className="w-4 h-4 text-brand-orange" />
          <span className="text-black">{partners} Partners</span>
          <span className="text-black">|</span>
        </div>
        <div className="flex items-center text-xs gap-1.5">
          <Vote className="w-4 h-4 text-brand-orange" />
          <span className="text-black">{votes} Votos</span>
        </div>
      </div>
      <button className="w-full py-2 text-center text-brand-orange bg-gray-light font-bold rounded flex items-center justify-center text-sm gap-2">
        Más Detalles
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CardPool;
