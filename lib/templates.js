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

  // Tambahkan instruksi preservasi (kecuali enhance yg sudah punya sendiri)
  if (templateId !== "enhance") {
    const preserve = `\n\nIMPORTANT: Preserve the original face, facial identity, age, skin tone, and facial features exactly as they are. DO change clothing, clothing patterns, accessories, hair style, and background to match the theme. Apply the theme/style to all visible elements except the face. Keep facial identity 100% recognizable.\n\nCRITICAL: Maintain natural head-to-body proportions. Do NOT alter the head size relative to the body. Keep the original body shape, shoulder width, and neck length. Avoid making the head too large or too small for the body. Ensure the person still looks like a real human with correct anatomy and proportions.`;
    prompt = prompt + preserve;
  }

  // Jika lebih dari 1 wajah, tambahkan instruksi group
  if (faceCount >= 2 && templateId !== "enhance") {
    const groupPrefix = `IMPORTANT: This photo has ${faceCount} people. Transform ALL ${faceCount} people in this image. Apply the same style to each person. DO NOT leave anyone unchanged.\n\n`;
    prompt = groupPrefix + prompt;
  }

  return prompt;
}

const EXAMPLES = {
  enhance:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80",
  anime:
    "/anime.jpeg",
  elf:
    "/royal.jpeg",
  superhero:
    "/superhero.jpeg",
  gundam:
    "/gundam.jpeg",
  pixar:
    "/PIXAR.jpeg",
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
    id: "gundam",
    name: "Gundam Pilot",
    description: "Jelmaan pilot Gundam perkasa dari masa depan",
    icon: "🤖",
    strength: 0.85,
    exampleImage: EXAMPLES.gundam,
    usageCount: 1280,
    isTrending: true,
    prompts: [
      "Transform into a Mobile Suit Gundam pilot. Wearing a high-tech Gundam mecha helmet with a sleek angular visor, glowing amber-orange eye slits, and white/blue armor plating. Classic RX-78-2 inspired color scheme: white, navy blue, red, and yellow accents. Mechanical exosuit with thrusters on the back. Cinematic sci-fi lighting with dramatic cockpit glow. Background: colony interior or space dock with massive Gundam units. High quality anime-mecha realism, detailed armor panel lines, glowing GN particle effects.",
      "Gundam mecha pilot transformation. Futuristic pilot suit integrated with advanced Gundam combat armor. White and blue mechanical exoskeleton with glowing red/blue LED accents. Helmet with V-shaped crest and dual camera-like eyes. GN Drive condenser glowing on the chest. Dynamic action pose with beam saber energy effect. Background: explosive space battle with mobile suit silhouettes. Epic cinematic mecha anime style, high detail, dramatic lighting.",
      "Becoming a Gundam pilot from the Universal Century. Sleek white and blue mobile suit armor with red chin vents and golden crown-like V-fin antenna. Large backpack with wing binders (stabilizer wings). Glowing orange mono-eye or twin camera eyes. Mechanical detail with pistons, thrusters, and panel lines. Background: orbital space station with Earth below. Atmospheric sci-fi lighting, realistic mecha texture, cinematic composition.",
      "Gundam mobile suit pilot transformation. Advanced combat helmet with a sleek futuristic design, golden V-fin crest, and glowing red multi-camera sensors. White armor with navy and red accents, chest vents, and shoulder pauldrons with thrusters. Beam rifle holstered on the back. Intense battle-ready expression. Background: colony laser or space fortress. Dynamic cinematic lighting with particle effects. High-end mecha anime realism, detailed weathering.",
      "Transform into a Gundam pilot from an elite mobile suit team. Custom white and blue Gundam armor with gold trim and glowing green/red sensor cameras. High-mobility backpack with boosters. Mechanical exosuit with visible joint actuators and thrust nozzles. Wielding a beam saber with glowing energy blade. Background: atmospheric re-entry or debris field. Epic sci-fi lighting, volumetric fog, cinematic mecha action shot. High detail, premium quality.",
    ],
  },
  {
    id: "pixar",
    name: "PIXAR Studio",
    description: "Jelmaan karakter animasi 3D khas PIXAR",
    icon: "💡",
    strength: 0.85,
    exampleImage: EXAMPLES.pixar,
    usageCount: 1560,
    isTrending: true,
    prompts: [
      "Transform into a Pixar 3D animated character. High-quality Pixar-style render with smooth subsurface-scattering skin, soft warm lighting like in Up or Inside Out. Exaggerated but believable facial proportions — slightly larger head, soft rounded cheeks, expressive eyebrows. Stylized hair with individual sculpted strands, warm ambient occlusion shadows. Wearing colorful casual or adventure outfit fitting a Pixar protagonist. Background: cozy suburban neighborhood or vibrant adventure landscape. Detailed 3D texture, premium CGI quality, heartwarming Pixar aesthetic.",
      "Pixar animation studio character transformation. Rendered in signature Pixar 3D style with soft global illumination and warm color palette. Playful slightly-stylized facial features — big empathetic eyes with catchlights, friendly smile with subtle tooth gap or dimple. Detailed fabric textures on clothing, soft dynamic hair. Expressive pose with natural body language. Background: whimsical Pixar-style environment like a colorful city street or fantastical landscape. Emotional cinematic lighting, high-end CGI render, family-friendly Pixar charm.",
      "Become a Pixar character in a heartwarming animated story. Volumetric 3D rendering with Pixar's signature soft shadows and warm bounce light. Stylized realistic proportions with expressive eyes and animated-friendly facial features. Wearing iconic Pixar-style costume — think adventure gear, scientist coat, or space ranger uniform. Dynamic pose full of personality. Background: richly detailed Pixar world like a toy-filled room, futuristic city, or enchanted forest. Premium CGI animation quality, warm and inviting aesthetic.",
      "Transform into a Pixar-style animated hero. Beautiful 3D character render with advanced subsurface scattering for natural skin, soft rim lighting, and atmospheric fog. Slightly caricatured features with honest, emotional expression. Detailed costume with realistic fabric folds and accessories. Background: epic Pixar adventure setting like a jungle, outer space, or stormy ocean. Cinematic lighting with god rays and warm tones. Emotional storytelling through the eyes. Feature-film quality CGI, signature Pixar heart.",
      "Pixar character portrait in iconic animation studio style. Flawless 3D render with soft global illumination and beautiful color grading. Friendly exaggerated features — warm eyes with bright highlights, slightly oversized head for charm, natural smile. Stylized but believable hair and clothing textures. Background: cozy Pixar-style interior or whimsical outdoor scene with stylized trees and colorful sky. Heartwarming slice-of-life composition. High-end CGI, premium Pixar animation aesthetic, emotional warmth.",
    ],
  },
];
