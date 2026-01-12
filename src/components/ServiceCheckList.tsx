interface Service {
  name: string;
  route: string;
}

interface ServiceCheckListProps {
  services: Service[];
  onNavigate?: (route: string) => void;
  back?: boolean;
}

export default function ServiceCheckList({
  services,
  onNavigate,
  back,
}: ServiceCheckListProps) {
  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClick = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      handleScrollTo(route);
    }
  };

  // Agrupar servicios de 2 en 2
  const groupedServices: Service[][] = [];
  for (let i = 0; i < services.length; i += 2) {
    groupedServices.push(services.slice(i, i + 2));
  }

  return (
    <div
      className={`flex flex-col justify-start items-start ${back ? "w-2/4" : "w-full"}`}
    >
      {groupedServices.map((group, groupIndex) => (
        <div key={groupIndex} className="flex justify-start gap-2 flex-wrap">
          {group.map((service, serviceIndex) => (
            <button
              key={`${groupIndex}-${serviceIndex}`}
              onClick={() => handleClick(service.route)}
              className="flex items-center gap-1 text-left group hover:translate-x-2 transition-transform duration-300"
            >
              <span className="text-[#00FF7C] text-xl md:text-2xl">✓</span>
              <span className="text-white text-base md:text-lg font-['Poppins'] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00C5FF] group-hover:to-[#00FF7C] transition-all duration-300">
                {service.name}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
