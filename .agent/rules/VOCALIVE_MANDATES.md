# VocaLive Development Mandates

## ABSOLUTE REQUIREMENTS

### 1. NO GENERIC FEEDBACK
- ❌ NEVER say "That's incorrect" or "Try again"
- ✅ ALWAYS provide spatial, actionable corrections:
  - "Tilt your welding torch 15 degrees to the left"
  - "Move your hand 3 inches higher"
  - "Rotate the solar panel clockwise until aligned with the mounting bracket"

### 2. NATIVE MULTIMODALITY
- ALL core features MUST use Gemini 3 Pro with:
  - `thinking_level="HIGH"` (for complex spatial reasoning)
  - `media_resolution="HIGH"` (for pixel-perfect detection)
  - Minimum 30fps video analysis for real-time coaching

### 3. STATEFUL REASONING
- Implement Thought Signatures on EVERY coaching turn
- Pass `thoughtSignature` from previous response back to API
- Track learner's skill progression across the entire session
- Detect when learner makes the same mistake repeatedly

### 4. MOBILE-FIRST EXPERIENCE
- PWA optimized for 3G/4G networks (common in Nigeria)
- Works offline for video playback of recorded sessions
- High-contrast UI for outdoor use (solar installation under sun)
- Audio-first interface (hands-free coaching)

### 5. CULTURAL LOCALIZATION
- Support for Nigerian languages: Hausa, Yoruba, Igbo, Nigerian Pidgin
- Use culturally appropriate teaching metaphors
- Respect local teaching customs and communication styles
- Consider low-literacy users (audio > text)

### 6. PRIVACY & SAFETY
- No video storage without explicit user consent
- Option to process entirely on-device (future)
- Clear data usage policies
- Safe training practices (warn about dangers)
