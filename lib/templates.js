/**
 * Template AI yang tersedia untuk pengguna
 * Setiap template punya prompt berbeda untuk menghasilkan style yang unik
 */
/**
 * Contoh hasil template (sementara pakai stock photos)
 * Nanti bisa diganti dengan hasil AI asli setelah generate
 */
const TEMPLATE_EXAMPLES = {
  cyberpunk:
    "https://images.unsplash.com/photo-1560008581-09826c1e69ed?w=300&h=300&fit=crop&q=80",
  "fantasy-elf":
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&h=300&fit=crop&q=80",
  vintage:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&q=80",
  "oil-painting":
    "https://images.unsplash.com/photo-1578323172454-001c2b76f0cd?w=300&h=300&fit=crop&q=80",
  anime:
    "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=300&h=300&fit=crop&q=80",
  "neon-noir":
    "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=300&h=300&fit=crop&q=80",
  sketch:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80&grayscale",
  space:
    "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=300&h=300&fit=crop&q=80",
};

export const TEMPLATES = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Ubah fotomu bergaya cyberpunk futuristik",
    icon: "🤖",
    prompt:
      "A cyberpunk style portrait, neon lights, dark atmosphere, futuristic city background, vibrant purple and blue tones, detailed, high quality",
    strength: 0.85,
    exampleImage: TEMPLATE_EXAMPLES.cyberpunk,
    usageCount: 2340,
    isTrending: true,
  },
  {
    id: "fantasy-elf",
    name: "Fantasy Elf",
    description: "Jelmaan peri mistis dari dunia fantasi",
    icon: "🧝",
    prompt:
      "A fantasy elf portrait, mystical glowing eyes, ethereal beauty, forest background with magical particles, intricate detailed clothing, high fantasy style, high quality",
    strength: 0.8,
    exampleImage: TEMPLATE_EXAMPLES["fantasy-elf"],
    usageCount: 1820,
    isTrending: true,
  },
  {
    id: "vintage",
    name: "Vintage Classic",
    description: "Nuansa klasik retro ala film lama",
    icon: "📷",
    prompt:
      "A vintage classic portrait, sepia tones, film grain texture, 1970s aesthetic, soft lighting, nostalgic atmosphere, retro color grading, high quality",
    strength: 0.75,
    exampleImage: TEMPLATE_EXAMPLES.vintage,
    usageCount: 1210,
    isTrending: false,
  },
  {
    id: "oil-painting",
    name: "Lukisan Minyak",
    description: "Seperti lukisan cat minyak klasik",
    icon: "🎨",
    prompt:
      "An oil painting portrait, thick brush strokes, classical painting style, renaissance art inspired, rich colors, textured canvas look, masterful lighting, high quality",
    strength: 0.9,
    exampleImage: TEMPLATE_EXAMPLES["oil-painting"],
    usageCount: 890,
    isTrending: false,
  },
  {
    id: "anime",
    name: "Anime Style",
    description: "Ubah jadi karakter anime Jepang",
    icon: "🌸",
    prompt:
      "Anime style portrait, Japanese animation style, large expressive eyes, smooth cel shading, vibrant colors, cute and detailed, studio ghibli inspired, high quality",
    strength: 0.85,
    exampleImage: TEMPLATE_EXAMPLES.anime,
    usageCount: 1560,
    isTrending: true,
  },
  {
    id: "neon-noir",
    name: "Neon Noir",
    description: "Suasana malam dengan lampu neon",
    icon: "🌃",
    prompt:
      "Neon noir portrait, heavy contrast, red and blue neon lighting, rain reflections, dark moody atmosphere, cinematic lighting, blade runner aesthetic, high quality",
    strength: 0.85,
    exampleImage: TEMPLATE_EXAMPLES["neon-noir"],
    usageCount: 720,
    isTrending: false,
  },
  {
    id: "sketch",
    name: "Sketsa Pensil",
    description: "Sketsa pensil hitam putih artistik",
    icon: "✏️",
    prompt:
      "Pencil sketch portrait, black and white, detailed shading, artistic hand-drawn look, fine line work, charcoal texture on paper, high quality sketch style",
    strength: 0.9,
    exampleImage: TEMPLATE_EXAMPLES.sketch,
    usageCount: 950,
    isTrending: false,
  },
  {
    id: "space",
    name: "Space Explorer",
    description: "Jelajah luar angkasa dengan gaya astronot",
    icon: "🚀",
    prompt:
      "Astronaut portrait in space, stars and nebula background, helmet visor reflection, cosmic atmosphere, sci-fi aesthetic, deep space colors, high quality",
    strength: 0.85,
    exampleImage: TEMPLATE_EXAMPLES.space,
    usageCount: 680,
    isTrending: false,
  },
];
