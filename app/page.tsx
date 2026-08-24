import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Capabilities } from "@/components/sections/Capabilities";
import { About } from "@/components/sections/About";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <Capabilities />
      <About />
    </>
  );
}
