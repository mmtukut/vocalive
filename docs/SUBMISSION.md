# VocaLive - Real-Time AI Vocational Coach

**Tagline**: The "Duolingo for Hands-On Skills" - 10x faster mastery with Gemini 3 Pro.

## Description
VocaLive is a mobile-first PWA that democratizes vocational education for the 500 million unemployed youth in emerging markets. Most training today is either expensive/in-person or passive (videos). Neither works at scale.

VocaLive uses **Gemini 3 Pro's multimodal capabilities** to act as a real-time expert coach. It watches you perform a task (like installing a solar panel) through your phone's camera and gives you **immediate, spatial, native-language feedback**.

## How I built it
- **Gemini 3 Pro Integration**: We used `thinking_level="HIGH"` and `media_resolution="HIGH"` to achieve the spatial precision needed to tell a student "Move 2 inches left."
- **Thought Signatures**: We implemented a stateful session manager that passes the AI's "thought signature" back and forth, allowing it to remember context ("You're still making that same mistake from 2 minutes ago").
- **Stack**: Next.js 15 PWA, FastAPI, WebSockets.

## Challenges we ran into
Handling real-time video on 3G networks was tough. We optimized by sending keyframes at 2FPS and using Gemini's powerful context to interpolate the action, rather than streaming raw 30fps video which would kill bandwidth.

## Accomplishments that I'm proud of
Building a "Zero-UI" experience. The user rarely touches the screen; they just listen to the audio guidance, which is essential for hands-on trade work.

## What's next for VocaLive
We are launching a pilot in Kano, Nigeria for Solar Panel Installation certification.
