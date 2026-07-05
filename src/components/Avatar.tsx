"use client";

// Portfolio-style avatar placeholder: gradient tile + initials.
// Swap for real photos (photoUrl) once barbers upload them.

const gradients = [
  "from-gold/70 to-coral/60",
  "from-teal/70 to-gold/50",
  "from-coral/60 to-teal/50",
];

function hashToIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

export default function Avatar({
  initials,
  seed,
  size = "md",
}: {
  initials: string;
  seed: string;
  size?: "md" | "lg";
}) {
  const gradient = gradients[hashToIndex(seed, gradients.length)];
  const sizing =
    size === "lg" ? "size-20 text-2xl rounded-3xl" : "size-14 text-lg rounded-2xl";
  return (
    <div
      aria-hidden
      className={`grid shrink-0 place-items-center bg-gradient-to-br font-black text-ink ${gradient} ${sizing}`}
    >
      {initials}
    </div>
  );
}
