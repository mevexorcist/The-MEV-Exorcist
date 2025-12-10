# Image Requirements for MEV Exorcist Mini App

This document outlines the image requirements for the Farcaster Mini App integration.

## Required Images

### 1. App Icon (icon.png)
- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Purpose**: Displayed in Farcaster app directory and Mini App launcher
- **Design**: Should represent the MEV Exorcist brand with the cyber-horror theme
- **Colors**: Use matrix green (#00FF00) and blood red (#FF0000) on black background

### 2. Preview Image (preview.png)
- **Size**: 1200x630 pixels (Open Graph standard)
- **Format**: PNG or JPEG
- **Purpose**: Shown when the Mini App is shared or embedded in casts
- **Design**: Should include:
  - App title "THE MEV EXORCIST"
  - Tagline: "Real-time Base network MEV monitoring"
  - Visual elements representing the radar/monitoring theme
- **Text**: Should be readable at small sizes

### 3. Splash Screen (splash.png)
- **Size**: 1200x1200 pixels (square)
- **Format**: PNG with transparency
- **Purpose**: Displayed while the Mini App is loading
- **Design**: Similar to icon but larger, can include loading animation concept
- **Background**: Transparent or black (#000000)

## Design Guidelines

### Color Palette
- **Primary**: Matrix Green (#00FF00)
- **Secondary**: Blood Red (#FF0000)
- **Background**: Void Black (#000000)
- **Accent**: Gray tones for depth

### Typography
- **Font**: Monospace/terminal style (Geist Mono or similar)
- **Style**: Bold, tech-focused, slightly glitchy

### Visual Elements
- Radar/scanning motifs
- Blockchain/network imagery
- Warning/alert symbols for MEV detection
- Cyber-horror aesthetic

## Tools for Creating Images

### Online Tools (Free)
- **Canva**: https://www.canva.com (templates available)
- **Figma**: https://www.figma.com (professional design tool)
- **Photopea**: https://www.photopea.com (Photoshop alternative)

### AI Image Generation
- **DALL-E**: https://openai.com/dall-e-2
- **Midjourney**: https://www.midjourney.com
- **Stable Diffusion**: https://stablediffusionweb.com

### Prompt Suggestions for AI Generation

**Icon Prompt**:
```
A minimalist icon for a blockchain MEV monitoring app called "MEV Exorcist", 
featuring a radar or scanning symbol in neon green (#00FF00) on black background, 
cyber-horror aesthetic, terminal/hacker style, 512x512 pixels, clean and modern
```

**Preview Image Prompt**:
```
A banner image for "THE MEV EXORCIST" blockchain monitoring app, 
featuring a radar visualization with neon green (#00FF00) and red (#FF0000) alerts, 
cyber-horror theme, terminal interface aesthetic, dark background, 
text "Real-time Base network MEV monitoring", 1200x630 pixels
```

**Splash Screen Prompt**:
```
A loading screen for "MEV Exorcist" app, featuring a large radar or eye symbol 
in neon green, cyber-horror aesthetic, minimalist design, black background, 
1200x1200 pixels, square format
```

## Placeholder Images

Currently, the app uses placeholder image URLs. Replace these with actual images:

1. Create the images following the specifications above
2. Save them in the `frontend/public/` directory:
   - `icon.png`
   - `preview.png`
   - `splash.png`
3. Update `farcaster.json` if using a different domain
4. Test the images by viewing them at:
   - http://localhost:3000/icon.png
   - http://localhost:3000/preview.png
   - http://localhost:3000/splash.png

## Optimization

After creating images, optimize them for web:

### Using ImageOptim (Mac)
```bash
# Install via Homebrew
brew install imageoptim

# Optimize images
imageoptim icon.png preview.png splash.png
```

### Using TinyPNG (Online)
- Visit https://tinypng.com
- Upload your images
- Download optimized versions

### Using Sharp (Node.js)
```bash
npm install -g sharp-cli

# Optimize PNG
sharp -i icon.png -o icon-optimized.png --png

# Convert to WebP for better compression
sharp -i preview.png -o preview.webp --webp
```

## Verification Checklist

- [ ] All images are the correct size
- [ ] Images use the correct color palette
- [ ] Text is readable at small sizes
- [ ] Images are optimized for web (< 500KB each)
- [ ] Images are saved in `frontend/public/` directory
- [ ] Images are accessible at the correct URLs
- [ ] `farcaster.json` references the correct image URLs
- [ ] Images display correctly in Farcaster preview

## Next Steps

1. Create or generate the images using the tools and prompts above
2. Save them in the `frontend/public/` directory
3. Test locally by visiting the image URLs
4. Deploy and verify in production
5. Test the Mini App in Farcaster to see how images appear
