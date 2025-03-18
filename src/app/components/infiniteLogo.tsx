import { InfiniteMovingCards } from "./ui/infinite-moving-card";

const InfiniteLogo = () => {
    const logoImages = [
        {
          image: "/logos/Cafelogo.png",
          name: "Cafe Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Captus.png",
          name: "Captus Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Coopmujer.png",
          name: "Coopmujer Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Credimotoconcepcion.png",
          name: "Credimoto Concepcion Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Dentista.png",
          name: "Dentista Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Dubiel.png",
          name: "Dubiel Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Eddward.png",
          name: "Eddward Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Elainne.png",
          name: "Elainne Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/EscudoLogo.png",
          name: "Escudo Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Espuma del Caribe.png",
          name: "Espuma del Caribe Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Fenix care.png",
          name: "Fenix care Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Gotransfer.png",
          name: "Gotransfer Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Hageo.png",
          name: "Hageo Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/HG.png",
          name: "HG Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/HR.png",
          name: "HR Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/HuevoKink.png",
          name: "Huevo Kink Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Innacorp.png",
          name: "Innacorp Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Linkup.png",
          name: "Linkup Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/MB Wise.png",
          name: "MB Wise Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Merk2.png",
          name: "Merk2 Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Murcia.png",
          name: "Murcia Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Nenox.png",
          name: "Nenox Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Nutriopcion.png",
          name: "Nutriopcion Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Omelefit.png",
          name: "Omelefit Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/PlanBLogo.png",
          name: "Plan B Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Punto de Sabor.png",
          name: "Punto de Sabores Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/RC Motoprestamos.png",
          name: "RC Motoprestamos Logo Design",
          title: "Logo 1",
        },
      {
        image: "/logos/Santiagocasasalquila.png",
        name: "Santiago Casas Alquila Logo Design",
        title: "Logo 1",
      },
        {
          image: "/logos/SantiagoCasasRD.png",
          name: "Santiago Casas RD Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/TheBillis.png",
          name: "The Billis Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Thunder.png",
          name: "Thunder Logo Design",
          title: "Logo 1",
        },  
        {
          image: "/logos/Urbano.png",
          name: "Urbano Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/Yerdoza.png",
          name: "Yerdoza Logo Design",
          title: "Logo 1",
        },
        {
          image: "/logos/ZR Logo.png",
          name: "ZR Logo Design",
          title: "Logo 1",
        }
      ];
  return (
    <div>
      <InfiniteMovingCards 
                  items={logoImages}
                  direction="left"
                  speed="slow"
                  pauseOnHover={false}
                  className="w-full h-full overflow-hidden"
                />
    </div>
  );
};

export default InfiniteLogo;
