# Screenshot Guide for Landing Page

Your landing page has been updated with professional screenshot placeholders. Follow this guide to capture the right images and complete the transformation from "vaporware" to credible product.

## Required Screenshots

### 1. Hero Dashboard Screenshot
**Filename:** `/public/hero-dashboard.png`
**Location:** Hero section (main "money shot")
**What to capture:** Full dashboard view showing your best metrics

**Preparation:**
- Go to `/dashboard`
- Make sure you have a "perfect" project tracked (e.g., track "ClickRank" or "OpenAI")
- Ensure the graphs look full and professional
- Clear any test data or dummy content

**Capture:**
- Take a full-width screenshot of the entire dashboard
- Include the navigation bar at the top
- Show at least 2-3 cards with data (AI Readiness Score, Citations, Share of Voice)
- Recommended resolution: 1920x1080 or larger

**Tips:**
- Use a clean browser window (hide bookmarks bar)
- Make sure data looks impressive (high scores, good trends)
- Capture in light mode first (dark mode optional)

---

### 2. Share of Voice Screenshot
**Filename:** `/public/shot-sov.png`
**Location:** Feature grid (large card, top-left)
**What to capture:** Zoom in on the Analytics Pie Chart

**Preparation:**
- Go to `/analytics`
- Ensure the Share of Voice pie chart shows clear data
- Multiple competitors make it look more realistic

**Capture:**
- Zoom in specifically on the pie chart area
- Include the legend showing brand names
- Crop tightly around the chart and surrounding UI
- Recommended resolution: 800x600 or larger

---

### 3. Sentiment Screenshot
**Filename:** `/public/shot-sentiment.png`
**Location:** Feature grid (small card, top-right)
**What to capture:** Citation list showing sentiment indicators

**Preparation:**
- Go to `/reputation` or wherever citation sentiment is displayed
- Show a mix of Positive, Negative, and Neutral badges
- Ideally show the "Negative - Fix Now" alert state

**Capture:**
- Zoom in on the table/list showing citations
- Include 3-5 rows with sentiment badges visible
- Show variety (not all positive)
- Recommended resolution: 600x400 or larger

---

### 4. Fan-Out Screenshot
**Filename:** `/public/shot-fanout.png`
**Location:** Feature grid (small card, middle-right)
**What to capture:** Keyword expansion list UI

**Preparation:**
- Go to `/keywords` or wherever fan-out suggestions appear
- Show the checkbox list with related keywords
- Ideally 5-7 suggested keywords visible

**Capture:**
- Zoom in on the list of suggested keywords
- Include checkboxes and keyword text
- Show the tree/hierarchy structure if applicable
- Recommended resolution: 600x400 or larger

---

### 5. Input Screenshot (How It Works)
**Filename:** `/public/shot-input.png`
**Location:** "How It Works" section (step 1)
**What to capture:** URL input field and "Scan Now" button

**Preparation:**
- Go to landing page `/`
- Show the hero section input field
- Can also capture from `/dashboard` if there's a similar input

**Capture:**
- Focus on the input field where users paste URLs
- Include the "Scan Now" button
- Keep it simple and clear
- Recommended resolution: 600x300 or larger

---

### 6. Analyze Screenshot (How It Works)
**Filename:** `/public/shot-analyze.png`
**Location:** "How It Works" section (step 2)
**What to capture:** Loading/scanning state or progress indicator

**Options:**
1. **Loading State:** Capture the spinner/progress during analysis
2. **Analysis View:** Show the system "thinking" with progress bars
3. **Processing Screen:** Any intermediate state showing work in progress

**Capture:**
- If you have a loading state, capture that
- Alternatively, use an icon placeholder (scanning animation)
- Recommended resolution: 600x300 or larger

---

### 7. Recommendations Screenshot (How It Works)
**Filename:** `/public/shot-recommendations.png`
**Location:** "How It Works" section (step 3)
**What to capture:** List of actionable recommendations

**Preparation:**
- Complete an analysis and view results
- Show the "Quick Fixes" or recommendations section
- Ideally show 3-5 recommendations with "Apply Fix" buttons

**Capture:**
- Focus on the recommendations list
- Include the issue titles and action buttons
- Show variety (Schema, Content, Metadata fixes)
- Recommended resolution: 600x400 or larger

---

## Screenshot Best Practices

### Technical Guidelines
- **Format:** PNG (for transparency and quality)
- **Resolution:** At least 2x the display size for Retina displays
- **Compression:** Use TinyPNG or similar to optimize file size
- **Naming:** Exactly match the filenames above (lowercase, hyphens)

### Visual Guidelines
- **Clean Data:** No test data, placeholder text, or Lorem ipsum
- **Realistic Content:** Use real brand names, actual metrics
- **Professional Look:** Good typography, proper spacing
- **Light Mode Preferred:** Easier to see details, better contrast
- **No Personal Info:** Blur out emails, sensitive data

### Capture Tools
- **Mac:** Cmd+Shift+4 (select area), Cmd+Shift+3 (full screen)
- **Windows:** Windows+Shift+S (Snipping Tool)
- **Browser:** Chrome DevTools (F12) → Device toolbar → Screenshot
- **Extensions:** Awesome Screenshot, Nimbus Screenshot

---

## Installation Steps

1. **Capture Screenshots:** Follow the guide above
2. **Optimize Images:** Run through TinyPNG or ImageOptim
3. **Upload to /public:** Place all PNG files in `/public/` directory
4. **Test:** Refresh landing page and verify images load
5. **Fallback Check:** If image doesn't load, colored placeholder appears

---

## Placeholder Behavior

Each screenshot location has a **smart fallback**:
- If the image file exists → Shows the screenshot
- If the image is missing → Shows a colored placeholder with label
- Placeholders clearly indicate what screenshot goes where

This means you can add screenshots incrementally and the page will still look professional.

---

## Priority Order

If you can't capture all screenshots immediately, prioritize:

1. **Hero Dashboard** (hero-dashboard.png) - MOST IMPORTANT
2. **Share of Voice** (shot-sov.png) - Shows data visualization
3. **Sentiment** (shot-sentiment.png) - Shows alerts/actions
4. **Recommendations** (shot-recommendations.png) - Shows value
5. **Fan-Out** (shot-fanout.png)
6. **Input** (shot-input.png)
7. **Analyze** (shot-analyze.png)

---

## Design Enhancements Applied

Your landing page now has:

1. **3D Hero Container** with perspective transform and glow effect
2. **Professional Image Containers** with borders and shadows
3. **Responsive Layout** optimized for mobile and desktop
4. **Dark Mode Support** with proper borders and backgrounds
5. **Graceful Fallbacks** for missing images
6. **"How It Works" Section** showing 3-step process
7. **Cropped UI Screenshots** in feature cards (not generic icons)

---

## Next Steps

1. Capture all 7 screenshots following this guide
2. Optimize images (compress to <500KB each)
3. Upload to `/public/` directory
4. Deploy and test on production
5. Share landing page with potential users

**Result:** Your landing page will look like established SaaS product, not vaporware.
