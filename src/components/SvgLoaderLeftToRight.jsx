import React from "react";
import { motion } from "framer-motion";
import { Headphones } from "lucide-react";
import { useTheme } from "./HeaderBackground";

const SvgLoaderLeftToRight = ({ onFinish }) => {
  const { theme } = useTheme();

  const isReturning = typeof window !== "undefined" && sessionStorage.getItem("hasLoadedBefore");

  const getPathTransition = (i, isReturning) => {
    if (isReturning) {
      if (i === 0) {
        // First stroke of P - slow: 0.5s duration
        return { duration: 0.5, delay: 0 };
      }
      if (i === 1) {
        // Second stroke of P - slow: 0.4s duration, starts staggered at 0.1s
        return { duration: 0.4, delay: 0.1 };
      }
      if (i === 2) {
        // Third starting stroke - slow: 0.3s duration, starts staggered at 0.2s
        return { duration: 0.3, delay: 0.2 };
      }
      if (i === 3) {
        // Fourth starting stroke - slow: 0.2s duration, starts staggered at 0.3s
        return { duration: 0.2, delay: 0.3 };
      }
      if (i === 8) {
        // Last character - slow: 0.5s duration, starts at 1.0s
        return { duration: 0.5, delay: 1.0 };
      }
      // Middle characters (4 to 7) - fast: 0.15s duration, staggered over the middle 0.5s window
      return { duration: 0.15, delay: 0.5 + (i - 4) * 0.12 };
    } else {
      // Normal staggered draw sequence: stagger delay 0.4s, draw duration 0.88s
      return { duration: 0.88, delay: i * 0.4 };
    }
  };

  // 1. Parent variants
  const svgVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
    },
  };

  // 2. Child variants
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: (i) => {
      const { duration, delay } = getPathTransition(i, isReturning);
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: {
            type: "spring",
            duration: duration,
            delay: delay,
            bounce: 0,
          },
          opacity: { duration: isReturning ? 0.025 : 0.1, delay: delay },
        },
      };
    },
  };

  return (
    <div
      className={`flex items-center justify-center h-screen w-full ${theme === "dark" ? "bg-black" : "bg-white"}`}
      data-theme={theme}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className={`absolute top-12 flex items-center gap-2 text-[12px] md:text-lg font-semibold tracking-[0.2em] uppercase opacity-60 
          ${theme === "dark" ? "text-white" : "text-neutral-800"}`}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Headphones size={18} strokeWidth={2} />
        </motion.div>
        <span>Audio experience enabled</span>
      </motion.div>

      <motion.svg
        id="eeSQNZ5fwYi1"
        // xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 300 300"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="w-[80%] md:w-[40%] h-auto"
        initial="hidden"
        animate="visible"
        variants={svgVariants}
        onAnimationComplete={onFinish}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          id="eeSQNZ5fwYi4"
          d="M34.89462,115.51037c0-8.5953,14.176398-27.497674,23.62568-18.73027c6.522892,6.052188,3.766816,13.248282,4.000429,15.150139.53765,4.377044-8.971208,23.002991-15.035838,16.915317-12.61316-12.661087,22.543828-36.313355,34.87479-26.312715c15.373082,12.467857-7.215615,41.257859-22.344925,33.621803"
          transform="translate(0 0.000001)"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={0}
        />
        <motion.path
          id="eeSQNZ5fwYi5"
          d="M90.23404,99.75992c-8.08973,0-14.523073,8.348692-18.94311,14.26054-7.328793,9.802341-10.37561,20.339688-13.83486,30.43668-3.600131,10.508202-10.783766,17.913619-17.546319,25.567885"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={1}
        />
        <motion.path
          id="eeSQNZ5fwYi6"
          d="M39.88035,169.828015c-15.190302,11.526867-30.915017,7.49012-33.496826-5.039346-1.300937-6.313422-.882295-16.495421,10.911556-27.355369c5.53003-5.498624,16.929472-10.884219,25.60779-6.98394c8.444819,3.795338,7.0301,17.50838.66514,22.2821"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={2}
        />
        <motion.path
          id="eeSQNZ5fwYi7"
          d="M103.426884,126.511339l.925095-.077091.693822-.578185.077091-1.194915-.809458-.539639q-1.194915.308365-1.194915.346911t-.308365.925095l.115637.809459.501093.308365Z"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={3}
        />
        <motion.path
          id="eeSQNZ5fwYi8"
          d="M69.12687,147.833213c3.375106-6.864879,9.722959-13.073592,12.698494-12.467613c3.402059,2.326161-3.402401,14.207238-8.70038,25.723468-1.1512.864512-2.933266,5.950806-2.901798,3.925963c6.359119-9.852662,17.729578-24.399723,21.530091-32.881775L85.52408,143.811997c-.042692,2.098853.900142,3.21535,1.842445,3.790333c4.360105.373607,8.300289-7.943067,12.698494-13.62202l-3.213562,4.235756c-8.448894,15.950952-12.067241,26.360112-9.484932,26.240629c5.623647,3.534797,16.611056-17.282041,25.188785-31.702839h-.341388c-5.533163,8.230169-12.816387,23.041409-11.948584,26.798966.630624,7.213288,6.775396-1.264103,10.882002-7.101976l13.697941-22.428094q-1.446475,2.513033-1.70694,2.56041c-.260465.047377-5.960332,10.06115-14.850383,32.261175-4.814402,13.085129-12.267601,24.587286-16.534681,29.857861-3.732326,4.205927-9.924545,9.171727-12.141919,8.718994-7.409043-2.215707.653853-15.196553,6.486374-21.50745c3.786377-5.674659,16.836281-15.213749,22.317742-16.973434c16.084379-3.970747,14.991805-8.827501,15.049853-8.76428"
          transform="translate(0 0.000001)"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={4}
        />
        <motion.path
          id="eeSQNZ5fwYi9"
          d="M148.806741,126.913988c-3.864706,6.55954-10.172872,16.743889-14.169757,22.741585-3.549109,6.1238-7.176186,9.513856-8.396894,9.446504-4.935808-1.354729-2.969516-9.44491-.000001-14.869499c2.080976-4.118153,7.513754-11.345549,11.195857-14.344693c1.834028-1.641769,3.485381-2.755669,4.697853-2.955097c1.870311-1.137895,2.881486,1.906003,3.757508,4.562689-2.853046,5.581392-7.292988,14.698764-8.455361,17.810222-2.414768,5.231916-1.227972,7.421287,0,8.047022c4.609835.281,8.398737-9.418174,12.770275-16.094045c3.617805-8.209208,9.114109-17.713768,12.420404-16.443915c2.292375,1.084213-6.385311,19.042103-11.895598,31.138478c4.068593-7.396514,10.526798-18.343061,11.532282-18.821499c4.323399-7.386554,10.561869-14.841859,12.78372-14.241267c2.822148,1.822519,1.129056,7.876546-3.389949,13.570283-8.447665,10.643666-8.82075,17.150113-4.832009,17.918066c4.932876-1.875204,9.277234-8.947923,12.59534-13.819887l13.994821-26.24029c-1.633004,2.466267-3.601298,7.276987-3.848577,9.62144c1.30419,6.916194,1.776677,13.626808.34987,17.318591-1.448464,6.2726-6.084249,8.864587-9.27157,11.020922-5.061934,1.649857-7.547944-3.590054-6.122736-9.271569c1.680112-4.158138,4.987748-6.084255,4.865907-2.390214"
          transform="translate(0.000007 0.000004)"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={5}
        />
        <motion.path
          id="eeSQNZ5fwYi10"
          d="M191.098915,150.132191c4.194975-9.910507,20.989427-42.71679,32.80069-66.232162-11.051019,22.672554-20.7779,40.069059-20.641607,44.051624c4.335103-3.784106,8.47419-11.941164,12.067169-9.883587.726022,4.780155-2.544948,11.118167-4.941793,14.480603-7.378591,10.974782-6.019532,15.029011-3.304636,15.270653c3.726653,1.227683,9.508613-7.950733,13.303148-12.972144c2.324348-3.104935,6.51259-11.533599,10.246065-18.146459-2.702757,4.673884-8.37055,16.15445-12.084872,24.352432-.974665,2.688823-.004817,5.851761,1.571831,6.135389c3.910499-1.471016,6.508738-7.208874,10.265487-11.421959l12.02216-20.537688c-2.917744,5.101726-8.734003,16.776307-10.413204,21.342166-1.911189,4.363858-2.860996,7.933552.114926,8.504482s6.897723-5.148137,13.662451-16.179694"
          transform="translate(0.000001 0)"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={6}
        />
        <motion.path
          id="eeSQNZ5fwYi12"
          d="M191.752163,183.887473c2.151879,2.647097,12.155895,1.770015,17.062078-.218744c7.399812-2.999571,15.000489-7.176362,23.186927-12.687187c7.677516-6.363163,18.316955-17.68386,20.780736-22.530694c2.822344-5.24904,2.046437-7.600061.656229-7.656065-4.809358-1.138464-11.96798,9.69846-13.780906,11.812211-3.373545,4.879822-4.735644,10.264089-6.781082,14.437143-2.58291,7.734469-.343515,11.588881-4.593641,21.436968-2.308159,7.600794-10.899148,15.13522-15.968351,17.499569-5.556574,2.807309-13.689752,4.503024-17.280823,3.718658-18.876488-2.16001-18.826009-18.994824-15.968356-24.499396c2.944474-10.600114,12.569236-14.814455,19.249524-18.593291c10.62875-3.886411,19.415869-1.293531,21.218224,1.968702c8.990707,8.703731-.524542,22.23272-4.374893,21.874459"
          transform="translate(0.000006 0.000005)"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={7}
        />
        <motion.path
          id="eeSQNZ5fwYi13"
          d="M259.781732,180.825049c-4.488483,5.563536-11.060898,13.67724-13.999654,17.937057-3.736462,4.465989-9.652448,10.520994-11.374719,10.280995-2.598921.297977-4.397036-2.773151-1.312468-9.187273c2.480746-5.972879,10.391695-14.423298,11.812208-15.093377c1.31439-1.809645,5.704275-4.485518,10.06225-5.031126c1.487008,1.341232,1.456218,3.580326,1.236514,5.629635l-10.423788,16.02608c-1.91571,2.42154-1.67219,5.909066-.874978,7.656061c1.692312,1.301946,6.579507-3.621424,9.399941-6.782602l38.54614-53.736736-4.747062,5.126826c-12.261223,18.346086-30.436273,45.478641-35.50802,54.686149.018371-.182785,10.04962-13.628724,15.495928-20.730608c3.997519-3.990988,9.722204-8.389317,10.937229-7.874805c1.177772,1.405284.923299,4.358336-.218744,5.906104-2.051712,3.477156-7.727874,11.78945-11.155974,16.624589-1.723099,2.41531-1.070864,5.410662,0,6.562338c5.973568-.568975,11.559756-7.48571,15.132872-12.260331"
          transform="translate(0.000003 0.000001)"
          fill="none"
          stroke="var(--icon-stroke)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={pathVariants}
          custom={8}
        />
      </motion.svg>
    </div>
  );
};

export default SvgLoaderLeftToRight;
