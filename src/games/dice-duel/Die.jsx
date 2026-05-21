import { dieFaces, faceMarkup, randomSpin, rotations } from "./diceConfig.js";

export default function Die({ value, rolling }) {
  const transform = rolling ? randomSpin() : rotations[value];

  return (
    <b className={`die ${rolling ? "is-rolling" : ""}`} data-value={value} aria-label={`Die showing ${value}`}>
      <span className="dice-cube" style={{ transform }}>
        {Object.entries(dieFaces).map(([face, side]) => (
          <span className={`face ${side}`} aria-hidden="true" key={side}>
            {faceMarkup[face].map((className, index) => (
              <span className={className} key={index}></span>
            ))}
          </span>
        ))}
      </span>
    </b>
  );
}
