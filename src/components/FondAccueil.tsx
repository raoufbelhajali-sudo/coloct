// Image d'ambiance en fond, très transparente (derrière le contenu).
// À placer comme 1er enfant d'un conteneur `relative`.
export default function FondAccueil() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-[0.07]"
      style={{ backgroundImage: "url(/accueil-bg.jpg)" }}
    />
  );
}
