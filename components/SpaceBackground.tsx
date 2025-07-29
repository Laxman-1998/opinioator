import { useCallback } from "react";
import Particles from "@tsparticles/react";
import type { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const SpaceBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "#0B1120",
            },
          },
          fpsLimit: 60,
          particles: {
            number: {
              // We are removing the problematic 'density' object
              // and using a simple, fixed value instead.
              value: 150,
            },
            color: {
              value: "#ffffff",
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: { min: 0.1, max: 0.6 },
              animation: {
                enable: true,
                speed: 0.5,
                sync: false,
                minimumValue: 0.1,
              },
            },
            size: {
              value: { min: 1, max: 3 },
            },
            move: {
              enable: true,
              speed: 0.2,
              direction: "top",
              straight: true,
              outModes: {
                default: "out",
              },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
};
export default SpaceBackground;