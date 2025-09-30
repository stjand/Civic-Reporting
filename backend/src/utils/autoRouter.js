// File: backend/src/utils/autoRouter.js
// Smart auto-router utility for Civic Reporter
// - Rule-based classifier by default (fast, deterministic).
// - Optional ML fallback: if AUTO_ROUTER_ML_URL env var is set, it will call that endpoint
//   with images + description and use the returned classification when available.
//
// Usage:
//   import { classifyReport } from '../utils/autoRouter.js';
//   const dept = await classifyReport({ description, imagePaths, metadata });

import logger from './logger.js';

const DEFAULT_DEPTS = [
  { key: 'sanitation', labels: ['garbage', 'trash', 'rubbish', 'dump', 'overflow', 'bin', 'waste', 'garbage'] },
  { key: 'public_works', labels: ['pothole', 'road', 'road damage', 'asphalt', 'sinkhole', 'crack', 'traffic', 'manhole'] },
  { key: 'electricity', labels: ['streetlight', 'lamp', 'light', 'electric', 'power', 'wiring', 'bulb'] },
  { key: 'water', labels: ['leak', 'water', 'pipe', 'sewer', 'drainage', 'sewerage', 'flood', 'overflowing'] },
  { key: 'horticulture', labels: ['tree', 'park', 'branch', 'fallen tree', 'garden', 'plants', 'sapling'] },
];

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Keyword scoring against DEFAULT_DEPTS
 * Returns an object: { department: 'public_works', score: 2, matches: ['pothole','road'] }
 */
function ruleBasedClassify({ description = '', imagePaths = [] }) {
  const text = normalizeText(description);
  const tokens = text.split(' ').filter(Boolean);

  const scores = {};
  DEFAULT_DEPTS.forEach(d => scores[d.key] = { score: 0, matches: [] });

  // score from description tokens
  for (const d of DEFAULT_DEPTS) {
    for (const label of d.labels) {
      const words = label.split(' ');
      // simple substring match for phrases and single words
      if (text.includes(label)) {
        scores[d.key].score += 3; // phrase match stronger
        scores[d.key].matches.push(label);
      } else {
        // check word-by-word
        for (const t of tokens) {
          if (t === label) {
            scores[d.key].score += 1;
            scores[d.key].matches.push(t);
          }
        }
      }
    }
  }

  // score from image filename heuristics (file names often include keywords like 'pothole' or 'streetlight')
  for (const img of imagePaths || []) {
    const name = img.toLowerCase();
    for (const d of DEFAULT_DEPTS) {
      for (const label of d.labels) {
        if (name.includes(label.replace(/\s+/g, '_')) || name.includes(label.split(' ').join(''))) {
          scores[d.key].score += 2;
          scores[d.key].matches.push(`img:${label}`);
        }
      }
    }
  }

  // pick best
  let best = { department: 'other', score: 0, matches: [] };
  for (const [k, v] of Object.entries(scores)) {
    if (v.score > best.score) {
      best = { department: k, score: v.score, matches: v.matches };
    }
  }

  // If best score is 0, keep 'other'
  return best;
}

/**
 * Optional: call an external ML classifier.
 * Expected to POST: { description, imagePaths } and receive response { department: 'sanitation', confidence: 0.92 }
 * This function is intentionally tolerant of errors and will fallback to rule-based if ML fails.
 */
async function callExternalML({ description, imagePaths }) {
  const mlUrl = process.env.AUTO_ROUTER_ML_URL;
  if (!mlUrl) return null;

  try {
    // Node 18+ has global fetch; ensure your runtime supports it.
    const payload = { description, imagePaths };
    const resp = await fetch(mlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 15000
    });

    if (!resp.ok) {
      logger.warn(`AutoRouter ML call failed: ${resp.status} ${resp.statusText}`);
      return null;
    }

    const json = await resp.json();
    // expected shape: { department: 'public_works', confidence: 0.87 }
    if (json && json.department) return json;
    return null;
  } catch (err) {
    logger.warn(`AutoRouter ML call error: ${err && err.message}`);
    return null;
  }
}

/**
 * classifyReport: main exported function
 * - Takes description string and imagePaths array (relative paths or filenames)
 * - Returns: { department, score, source, details }
 *    - source: 'ml' or 'rules'
 */
export async function classifyReport({ description = '', imagePaths = [] } = {}) {
  // 1) Try external ML (if configured)
  const mlResult = await callExternalML({ description, imagePaths });
  if (mlResult && mlResult.department) {
    return {
      department: mlResult.department,
      score: mlResult.confidence ?? mlResult.score ?? 0,
      source: 'ml',
      details: mlResult
    };
  }

  // 2) Fallback to rule-based classification
  const rule = ruleBasedClassify({ description, imagePaths });
  return {
    department: rule.department,
    score: rule.score,
    source: 'rules',
    details: rule
  };
}

/**
 * Map department keys (used internally) to DB department names or display labels.
 * Adjust this mapping to match the 'departments' identifiers you use in your DB.
 */
export const DEPARTMENT_LABELS = {
  sanitation: 'Sanitation',
  public_works: 'Public Works',
  electricity: 'Electricity',
  water: 'Water',
  horticulture: 'Horticulture',
  other: 'Other'
};

export default {
  classifyReport,
  DEPARTMENT_LABELS
};
