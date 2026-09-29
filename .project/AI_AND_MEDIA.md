# AI Assistant Image Generation and Google Flow Plan

## Audience AI assistant

The assistant answers from published event truth, not guesses.

### Runtime design

Client:

- global assistant launcher
- bottom sheet for quick questions
- full-screen assistant route
- suggested prompts based on current venue/activity page

Server:

- Vercel serverless endpoint
- model/provider API key stored only in Vercel environment variables
- compact approved context fetched from Firebase
- current event/time context where useful
- links back to relevant venue/activity/map pages

Firebase:

- /public/assistantKnowledge stores approved concise facts
- real venue names are canonical
- visual-identity keys are supporting metadata only
- activities come from published Firebase records
- FAQ/activity data remain source of truth

The public assistant must not edit Firebase or perform admin actions.

## Image-generation component strategy

Generated images are authored assets, not runtime generation.

Future AssetSlot logical inputs:

```text
slotId
purpose
aspectRatio
mobileCrop
desktopCrop
altText
fallback
assetUrl
venueId
visualIdentityKey
```

Confirmed initial asset slots:

- home-hero
- venue-theater
- venue-faculty-building
- venue-weaving-building
- venue-sc3
- prize-feature
- activity-feature
- assistant-character
- map-background

## Image generation workflow

For each venue asset:

1. define aspect ratio and interface-safe area
2. include recognizable inspiration from the real physical location
3. generate visually consistent themed options
4. select and review one
5. ensure artwork contains no embedded words/logos/UI
6. export a high-resolution master
7. create optimized mobile/desktop derivatives
8. upload to Firebase Storage
9. register media metadata in Firebase
10. Admin can select/replace it without code edits

### Base visual prompt

```text
FATU Open House visual for the theme "ตะลุยแดนมังกร".
Contemporary Chinese myth-inspired editorial fantasy illustration.
Real venue: [venue].
Visual identity: [creature].
Use recognizable architecture, facade, landmark cues, materials, or spatial features from the real venue so visitors can identify the location.
Mood: premium, youthful, welcoming, artistic and immersive.
Composition: [aspect ratio], reserve a calm interface-safe region for real HTML text and controls.
Palette: identity-specific colors while remaining coherent with the full FATU Open House visual system.
Detail: polished and cinematic but not visually noisy on a mobile screen.
No typography, no logo, no UI, no watermark, no emoji.
Do not transform the venue into a completely unrelated fantasy place.
```

## Google Flow production plan

Google Flow is used for selected visitor-facing animations.

### Planned scenes

#### 1. Main opening / hero

- 4-6 second seamless or near-seamless loop
- Chinese-myth atmosphere
- no text inside video
- room for real HTML title/CTA
- non-blocking background layer

#### 2. โรงละคร / Azure Dragon

- motion inspired by Azure Dragon/cloud motifs
- incorporate recognizable theater architecture or approach cues
- keep enough realism that visitors can connect scene to the real venue

#### 3. ตึกคณะ / White Tiger

- White Tiger/banners/light motifs
- preserve recognizable faculty-building structure/landmarks

#### 4. โรงทอ / Nine-Tailed Fox

- mist/textile/fox-light motifs
- preserve recognizable weaving-building context

#### 5. ตึก SC3 / Red Phoenix

- ember/Phoenix-light motifs
- preserve recognizable SC3 context

### Flow production constraints

- generate reusable media, never on demand in the website
- export web-friendly source
- create poster image from the same scene
- compress/transcode before deployment
- muted autoplay only
- playsInline on mobile
- no autoplay audio
- do not put UI/text inside the generated clip
- do not make visitors wait before navigation
- honor reduced-motion with poster fallback
- fall back to poster/static image on slow network
- lazy-load venue video
- real venue name and directions remain HTML, never baked into video

## Media loading architecture

For each animated venue slot:

```text
real venue photo/landmark
+ Flow video
+ poster image
+ generated-art fallback
+ accessible description
```

Loading order:

1. HTML content and real venue name
2. recognizable static venue visual
3. poster/generated treatment
4. Flow video when appropriate

The site must still be useful if video never loads.

## Release-one media target

Target:

- 1 home hero
- 4 venue scenes

If a Flow output hurts recognition, readability, or performance, use the matching still/real image treatment instead.
