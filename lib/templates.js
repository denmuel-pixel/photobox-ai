/**
 * Template AI — setiap template punya beberapa variasi prompt
 * untuk hasil yang random dan bervariasi setiap generate
 */

// Fungsi ambil prompt random dari array
// faceCount: jumlah wajah terdeteksi (untuk group prompt)
// name: nama untuk template yang membutuhkan personalisasi (contoh: pixar)
export function getRandomPrompt(templateId, faceCount = 1, name = "") {
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) return "A high quality portrait photo";
  const prompts = template.prompts;
  let prompt = prompts[Math.floor(Math.random() * prompts.length)];

  // Ganti {{NAME}} dengan nama yang diinput user (khusus PIXAR)
  if (name) {
    prompt = prompt.replace(/\{\{NAME\}\}/g, name);
    // PIXAR sudah punya instruksi lengkap di prompt, tanpa preserve tambahan
    return prompt;
  }

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
    "/hero.jpg",
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
      "Create a premium vertical inspirational character poster with a modern lifestyle editorial design.\n\nThe main subject must use the exact face, hairstyle, skin tone, and identity from the uploaded reference photo. Preserve facial features accurately with high identity consistency. Do not redesign or alter the person's appearance.\n\nReplace the large title with the submitted name:\n{{NAME}}\n\nLayout:\n• Vertical poster (4:5)\n• Person standing on the left side.\n• Large typography on the right.\n• Neutral warm concrete wall background.\n• Premium minimal aesthetic.\n• Soft cinematic lighting.\n• Luxury editorial magazine style.\n• Warm beige, cream, dark navy and gold color palette.\n\nCharacter:\n• Cute proportion with slightly stylized big eyes.\n• Semi-realistic Pixar + Korean illustration style.\n• Large head (around 15-20% bigger than realistic).\n• Slim body.\n• Friendly smile.\n• Looking directly at camera.\n• Natural confident pose.\n• One hand making an \"OK\" gesture.\n• One hand inside pocket.\n• White sleeveless mock-neck top.\n• Light blue wide-leg jeans.\n• White sneakers.\n\nTypography:\nLarge title:\n{{NAME}}\n\nBelow it create an acronym based on every letter of the submitted name.\n\nExample:\n\nR — Radiant\nPositive inspiring paragraph\n\nI — Inspiring\nPositive inspiring paragraph\n\nA — Authentic\nPositive inspiring paragraph\n\nEach description should sound encouraging, warm, uplifting, and personalized.\n\nDecorative Elements:\n• Hand-drawn doodles\n• Small stars\n• Sparkles\n• Tape stickers\n• Handwritten notes\n• Music themed icons matching the user's hobby\n• Small illustrated accessories around the subject\n\nUse several aesthetic stickers similar to scrapbook style.\n\nBottom right:\nA handwritten motivational quote customized for the person.\n\nLighting:\nSoft golden hour lighting.\nSubtle rim light.\nNatural shadows.\nPremium portrait photography feel.\n\nRendering:\nUltra detailed.\n8K.\nLuxury magazine quality.\nProfessional typography composition.\nAward-winning graphic design.\nModern branding poster.\nClean layout.\nBalanced negative space.\nHighly polished.\n\nImportant:\nMaintain the exact identity of the uploaded reference face.\nDo not change age, ethnicity, hairstyle, facial structure, or expression unless requested.\nReplace all displayed names with the submitted name.\nGenerate unique acronym words based on the submitted name.",
    ],
  },
];
