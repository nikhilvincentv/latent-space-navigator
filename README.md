# Latent Space Navigator

A 3D portfolio research artifact for exploring the mathematical "style" of images in a learned vector space. The project is designed for a Carnegie Mellon SCS HCI portfolio: it pairs a spatial interface with explicit vector math, instrumented interaction logging, and a reproducible image-embedding pipeline.

## Project Structure

```text
latent-space-navigator/
  frontend/              Next.js App Router, Tailwind, React Three Fiber
  backend/               FastAPI service and CLIP/UMAP processing scripts
  data/sample/           Small coordinate manifest for local UI development
  .github/workflows/     CI checks for frontend and backend
```

## Core Idea

Each image is embedded with CLIP into a high-dimensional vector. The backend reduces those vectors to 3D coordinates with UMAP or t-SNE. The frontend renders each image as a floating sprite at `(x, y, z)`, allowing visitors to fly through a visual map of stylistic similarity.

Euclidean distance is intentionally explicit in [backend/app/vector_math.py](/Users/nikhilvincent/Documents/Codex/2026-05-02/role-you-are-a-senior-software/backend/app/vector_math.py:7):

```python
sqrt(sum((a_i - b_i) ** 2 for each dimension))
```

Nearby images should therefore be interpreted as visually or semantically similar under the chosen embedding model and dimensionality reduction method, not as objective aesthetic truth.

## HCI Design Choices

The interface supports exploratory navigation because the research question is about how people form mental models of latent spaces. The logging layer records:

- camera path samples over time
- image hover events and dwell time
- estimated time spent inside style clusters

The logger is intentionally separated from rendering logic in [frontend/lib/hciLogger.ts](/Users/nikhilvincent/Documents/Codex/2026-05-02/role-you-are-a-senior-software/frontend/lib/hciLogger.ts:1) so the study instrumentation can be reviewed, consent-gated, replaced, or disabled without rewriting the 3D scene.

## Local Development

Install frontend dependencies:

```bash
npm install
```

Run the web app:

```bash
npm run dev
```

Set up the backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev,ml]"
uvicorn app.main:app --reload
```

Generate coordinates from images:

```bash
python backend/scripts/generate_coordinates.py \
  --image-dir data/raw \
  --output frontend/public/generated/coordinates.json \
  --method umap
```

For Google Drive, sync or export the image folder into `data/raw/` first. The script is file-system based so it can work with Drive Desktop, manual exports, or CI artifacts without depending on a browser session.

## Tests

Frontend:

```bash
npm --workspace frontend run test
```

Backend:

```bash
cd backend
pytest
```

## Deployment

The frontend is configured for Vercel with [vercel.json](/Users/nikhilvincent/Documents/Codex/2026-05-02/role-you-are-a-senior-software/vercel.json:1). After this folder is pushed to GitHub:

1. Create a new GitHub repository.
2. Push this workspace to the `main` branch.
3. Import the repository in Vercel.
4. Set Vercel's root directory to `frontend`.
5. Add any backend URL as `NEXT_PUBLIC_VECTOR_API_URL` if the FastAPI service is deployed separately.

## First Research Milestones

- Replace the sample manifest with real CLIP embeddings from your image corpus.
- Add a consent screen before enabling persistent HCI logging.
- Run a pilot with 3-5 users and compare navigation traces against cluster boundaries.
