/**
 * Template AI — setiap template punya beberapa variasi prompt
 * untuk hasil yang random dan bervariasi setiap generate
 */

// Fungsi ambil prompt random dari array
// faceCount: jumlah wajah terdeteksi (untuk group prompt)
export function getRandomPrompt(templateId, faceCount = 1) {
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) return "A high quality portrait photo";
  const prompts = template.prompts;
  let prompt = prompts[Math.floor(Math.random() * prompts.length)];

  // Jika lebih dari 1 wajah, tambahkan instruksi group
  if (faceCount >= 2 && templateId !== "enhance") {
    // Enhance sudah handle group di prompt-nya sendiri
    const groupPrefix = `IMPORTANT: This photo has ${faceCount} people. Transform ALL ${faceCount} people in this image. Apply the same style to each person. DO NOT leave anyone unchanged.\n\n`;
    prompt = groupPrefix + prompt;
  }

  return prompt;
}

const EXAMPLES = {
  enhance:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80",
  anime:
    "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=300&h=300&fit=crop&q=80",
  elf:
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&h=300&fit=crop&q=80",
  superhero:
    "/superhero.jpeg",
  space:
    "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=300&h=300&fit=crop&q=80",
  "upload-style":
    "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=300&h=300&fit=crop&q=80",
};

export const TEMPLATES = [
  {
    id: "enhance",
    name: "Enhance Photo",
    description: "Tajamkan, hapus blur, perbaiki warna, restore foto lama",
    icon: "✨",
    strength: 0.65,
    exampleImage: EXAMPLES.enhance,
    usageCount: 3520,
    isTrending: true,
    prompts: [
      "You are an award-winning professional portrait photographer, photo retoucher, and composition expert.\n\nAnalyze the uploaded photo and improve it using professional photography principles while preserving the original identity of the subject(s).\n\nOBJECTIVES\n\n1. SUBJECT DETECTION\n- Automatically detect the primary subject (single person, couple, family, or group).\n- Determine the visual focus based on face prominence, body position, gaze, and composition.\n- Preserve every detected primary subject.\n\n2. REMOVE BACKGROUND PEOPLE\n- Remove all unrelated people in the background.\n- Remove photobombers and distracting human elements.\n- Reconstruct the background naturally without visible artifacts.\n- Do not remove anyone identified as part of the main group.\n\n3. PRESERVE SUBJECT\n- Preserve the face exactly.\n- Preserve facial identity.\n- Preserve age, skin tone, hairstyle, expression, and facial proportions.\n- Preserve body pose exactly.\n- Preserve hand positions.\n- Preserve clothing.\n- Preserve accessories.\n- Preserve interaction between subjects.\n\n4. PROFESSIONAL COMPOSITION\nRecompose the image using professional photography theory:\n- Rule of Thirds\n- Golden Ratio when appropriate\n- Balanced visual weight\n- Proper headroom\n- Proper lead room\n- Clean framing\n- Remove unnecessary empty space\n- Straighten horizon if needed\n- Improve perspective if required\n\nCrop automatically for the strongest composition while ensuring:\n- No body parts are awkwardly cropped.\n- Faces remain the dominant visual focus.\n- Group balance is maintained.\n- The final image feels intentional and premium.\n\n5. COLOR GRADING\nImprove professionally while keeping natural skin tones:\n- Correct white balance\n- Correct exposure\n- Recover highlights\n- Lift shadows\n- Improve contrast\n- Improve dynamic range\n- Increase clarity\n- Improve local contrast\n- Slightly increase vibrance\n- Avoid oversaturation\n- Preserve realistic colors\n\n6. IMAGE QUALITY\n- Reduce noise.\n- Increase sharpness only where appropriate.\n- Improve facial detail naturally.\n- Maintain realistic skin texture.\n- Remove compression artifacts.\n- Enhance overall image quality.\n\n7. BACKGROUND CLEANUP\n- Remove distracting objects when appropriate.\n- Clean clutter.\n- Preserve the original location.\n- Maintain realistic lighting.\n- Preserve environmental depth.\n\n8. DEPTH\n- Add subtle natural depth separation.\n- Enhance subject-background separation.\n- Maintain realistic depth of field.\n\n9. LIGHTING\nImprove lighting naturally:\n- Enhance facial illumination.\n- Preserve natural shadows.\n- Add soft professional portrait lighting if needed.\n- Maintain realistic light direction.\n\n10. FINAL STYLE\nDeliver a premium DSLR / mirrorless camera look:\n- Editorial portrait quality\n- Luxury travel photography aesthetic\n- High-end commercial photography\n- Clean\n- Natural\n- Timeless\n- Realistic\n\nIMPORTANT RULES\n\n- NEVER change the person's identity.\n- NEVER change facial features.\n- NEVER change facial expression.\n- NEVER change pose.\n- NEVER change clothing.\n- NEVER generate a different person.\n- NEVER add people.\n- NEVER remove anyone belonging to the main subject/group.\n- Preserve the original moment exactly while making it look like it was captured by a world-class professional photographer.\n\nOUTPUT PRIORITY\n1. Subject identity preservation\n2. Background people removal\n3. Best possible composition\n4. Natural color correction\n5. Premium professional photography finish",
    ],
  },
  {
    id: "anime",
    name: "Anime Style",
    description: "Ubah jadi karakter anime Jepang",
    icon: "🌸",
    strength: 0.85,
    exampleImage: EXAMPLES.anime,
    usageCount: 1560,
    isTrending: true,
    prompts: [
      "Transform into Japanese anime style. Large expressive eyes with highlights, smooth cel shading, soft gradient shadows, cute facial features. Vibrant colors, clean line art, studio ghibli inspired aesthetic. High quality anime portrait.",
      "Anime character portrait in Japanese animation style. Big sparkling eyes, sharp chin, small nose, glossy hair. Flat shading with soft shadows, vibrant color palette. Cute and stylized, exactly like a frame from a high-budget anime. Detailed, clean, beautiful.",
      "Convert to anime art style. Exaggerated facial features with large detailed eyes, smooth skin, stylized hair with highlights. Cel-shaded coloring, no realistic textures. Bright anime color palette, clean linework. High quality anime illustration portrait.",
      "Anime-style portrait with youthful proportions. Large expressive eyes with catchlights, simplified nose and mouth, smooth cel-shaded skin, glossy shiny hair, vibrant anime colors. Clean thick outlines, no photorealistic details. Studio-quality anime character art.",
    ],
  },
  {
    id: "fantasy-elf",
    name: "Princess Royal",
    description: "Jelmaan putri kerajaan yang anggun dan memesona",
    icon: "👑",
    strength: 0.85,
    exampleImage: EXAMPLES.elf,
    usageCount: 1820,
    isTrending: true,
    prompts: [
      "Royal princess transformation. Elegant ball gown with intricate lace and pearl details, sparkling tiara with diamonds, soft glowing makeup with rosy cheeks. Luxurious palace ballroom background with chandeliers. Regal, graceful, like a Disney princess come to life.",
      "Princess royal portrait. Wearing a stunning golden crown with jewels, flowing silk gown with embroidery, delicate pearl necklace. Soft royal lighting, palace garden background with blooming roses. Elegant, refined, majestic beauty like European royalty.",
      "Transform into a beautiful royal princess. Adorned with an ornate tiara, cascading curled hair, flawless makeup with subtle shimmer. Wearing a magnificent gown with corset and flowing skirt. Grand staircase or castle balcony background. Regal elegance, fairy tale princess aesthetic.",
      "Royal princess transformation. Graceful pose in a magnificent ball gown with off-shoulder neckline, long satin gloves, sparkling diamond jewelry. Crystal chandeliers and marble columns in background. Soft golden hour lighting. Elegant noble beauty, like royalty from a period drama.",
    ],
  },
  {
    id: "superhero",
    name: "Superhero",
    description: "Jelmaan pahlawan super gagah berani",
    icon: "🦸",
    strength: 0.85,
    exampleImage: EXAMPLES.superhero,
    usageCount: 980,
    isTrending: false,
    prompts: [
      "Superhero transformation. Epic heroic pose, dramatic lighting from above, cape flowing in wind. Heroic costume design with bold colors and emblem on chest. Cinematic composition, explosive background with dramatic sky. Marvel/DC movie poster quality.",
      "Powerful superhero portrait. Muscular heroic build, confident determined expression. Signature superhero suit with cape, mask, and chest symbol. Dynamic dramatic lighting, sparks and energy effects in background. Cinematic comic book movie style, epic, high budget.",
      "Transform into a comic book superhero. Wearing a colorful skin-tight suit with cape, boots, and belt with emblem. Heroic confident posture with dramatic lighting and wind effects. City skyline or dramatic sky background. Like a Marvel Cinematic Universe hero poster.",
      "Heroic superhero transformation. Iconic superhero costume in vibrant primary colors, flowing cape, chest emblem. Dramatic upward lighting, heroic pose. Background with explosive energy effects, stormy sky, or cityscape. Epic cinematic style, like a movie poster.",
    ],
  },
  {
    id: "space",
    name: "Space Explorer",
    description: "Jelajah luar angkasa dengan gaya astronot",
    icon: "🚀",
    strength: 0.85,
    exampleImage: EXAMPLES.space,
    usageCount: 680,
    isTrending: false,
    prompts: [
      "Astronaut portrait in outer space. High-tech futuristic spacesuit with glowing blue and neon accents. Helmet with reflective gold visor showing starfield reflection. Behind: colorful nebula, distant galaxies, and cosmic dust. Epic space exploration aesthetic, cinematic.",
      "Space explorer transformation. Wearing advanced astronaut suit with LED lights and high-tech gear. Standing on an alien planet surface with rings in the sky, colorful nebula, and two moons. Starship visible in background. Sci-fi cinematic quality, epic scale.",
      "Futuristic astronaut portrait. Sleek modern spacesuit with glowing cyan accents and transparent helmet. Floating in zero gravity with Earth or a ringed planet visible through the helmet visor. Deep space background with stars and nebula. High quality sci-fi astronaut photo.",
      "Space explorer in a stunning cosmic scene. Detailed spacesuit with high-tech control panels on the chest. Helmet glass reflecting the cosmos. Background: swirling galaxy, colorful nebula, distant stars. Cinematic sci-fi portrait, epic adventure vibe, high quality.",
    ],
  },
  {
    id: "upload-style",
    name: "Upload Style",
    description: "Upload gambar referensi untuk gaya kustom",
    icon: "🎨",
    strength: 0.85,
    exampleImage: EXAMPLES["upload-style"],
    usageCount: 1120,
    isTrending: false,
    isCustom: true,
    prompts: [
      "Transform this portrait to match the style of the uploaded reference image. Apply the same artistic style, color palette, mood, and aesthetics from the reference image to this portrait. High quality, detailed.",
    ],
  },
];
