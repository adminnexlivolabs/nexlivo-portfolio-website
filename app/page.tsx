import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Capabilities } from "@/components/sections/Capabilities";
import { About } from "@/components/sections/About";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { ShaderBackground } from "@/components/ui/ShaderBackground";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-white text-ink">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-90">
        <ShaderBackground className="h-full w-full" />
      </div>
      <div className="relative z-10">
        <Hero />
        <Services />
        <Process />
        <Capabilities />
        <About />
        <Faq />
        <Contact />
      </div>
    </div>
  );
}
