import { Grid, Container } from "@bitnation-dev/components";

const SocialMedia = () => {
  return (
    <Container className="h-[50vh]">
    <div className="flex flex-col items-center justify-center pb-8">
      <span className="text-2xl font-bold bg-gradient-to-r from-[#00C5FF] to-[#00FF7C] text-transparent bg-clip-text">
        Follow Our Works
      </span>
    </div>
    <Grid columns={{ xl: 5, lg: 5, md: 1, sm: 1 }}>
      <div className="flex flex-col items-center justify-center">
        <a href="https://www.linkedin.com/company/c-digital-estudio/" target="_blank" className="text-3xl font-bold text-[#AFAFAF] hover:text-[#0B7BD6] hover:cursor-pointer">
          Linkedin
        </a>
      </div>
      <div className="flex flex-col items-center justify-center">
        <a href="https://www.youtube.com/@cdigitalestudio/videos" target="_blank" className="text-3xl font-bold text-[#AFAFAF] hover:text-[#E8003E] hover:cursor-pointer">
          Youtube
        </a>
      </div>
      <div className="flex flex-col items-center justify-center">
        <a href="https://www.instagram.com/cdigitalestudio/" target="_blank" className="text-3xl text-[#AFAFAF] font-bold hover:bg-gradient-to-r hover:from-[#FFB42F] hover:to-[#FA0FB2] hover:text-transparent bg-clip-text hover:cursor-pointer">
          Instagram
        </a>
      </div>
      <div className="flex flex-col items-center justify-center">
        <a href="https://dribbble.com/CDigitalEstudio" target="_blank" className="text-3xl font-bold text-[#AFAFAF] hover:text-[#FF6CCB] hover:cursor-pointer">
          Dribbble
        </a>
      </div>
      <div className="flex flex-col items-center justify-center">
        <a href="https://x.com/CarlosDiaz_rd" target="_blank" className="text-3xl font-bold text-[#AFAFAF] hover:text-[#FFFFFF] hover:cursor-pointer">
          X
        </a>
      </div>
    </Grid>
  </Container>
  );
};

export default SocialMedia;
