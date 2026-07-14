const fs = require('fs/promises');
const path = require('path');

const IMAGES_DIR = path.resolve(__dirname, '..', '..', 'images');
const CACHE_TTL_MS = Number(process.env.PROJECT_CACHE_TTL_MS || 300000);

let cache = {
  projects: null,
  expiresAt: 0,
};

const titleFromSlug = (slug) => slug
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const buildMediaUrl = (...segments) => `/media/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;

const parseBeforeSortIndex = (fileName) => {
  const exact = fileName.toLowerCase().match(/^before(?:\s*\((\d+)\))?/);
  if (!exact) {
    return Number.MAX_SAFE_INTEGER;
  }
  return exact[1] ? Number(exact[1]) : 0;
};

const parseAfterSortIndex = (fileName) => {
  const match = fileName.match(/^(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const classifyFiles = (slug, fileNames) => {
  const imageFiles = fileNames.filter((fileName) => /\.(png|jpe?g|webp|heic)$/i.test(fileName));
  const before = [];
  const after = [];

  imageFiles.forEach((fileName) => {
    const clean = fileName.toLowerCase();
    if (clean.startsWith('before')) {
      before.push({
        fileName,
        url: buildMediaUrl(slug, fileName),
        alt: `${titleFromSlug(slug)} before photo`,
      });
      return;
    }

    if (/^\d+/.test(clean)) {
      after.push({
        fileName,
        url: buildMediaUrl(slug, fileName),
        alt: `${titleFromSlug(slug)} after photo`,
      });
    }
  });

  before.sort((a, b) => parseBeforeSortIndex(a.fileName) - parseBeforeSortIndex(b.fileName));
  after.sort((a, b) => parseAfterSortIndex(a.fileName) - parseAfterSortIndex(b.fileName));

  const pairCount = Math.min(before.length, after.length);
  const pairs = Array.from({ length: pairCount }, (_, idx) => ({
    before: before[idx],
    after: after[idx],
  }));

  return {
    before,
    after,
    pairs,
  };
};

const loadProjects = async () => {
  const entries = await fs.readdir(IMAGES_DIR, { withFileTypes: true });
  const projectNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const projects = [];

  await Promise.all(
    projectNames.map(async (slug) => {
      const folderPath = path.join(IMAGES_DIR, slug);
      const names = await fs.readdir(folderPath);
      const { before, after, pairs } = classifyFiles(slug, names);

      if (pairs.length > 0) {
        projects.push({
          slug,
          name: titleFromSlug(slug),
          beforeCount: before.length,
          afterCount: after.length,
          pairs,
        });
      }
    }),
  );

  return projects.sort((a, b) => a.name.localeCompare(b.name));
};

const getProjects = async (_req, res, next) => {
  try {
    const now = Date.now();
    if (!cache.projects || cache.expiresAt <= now) {
      const projects = await loadProjects();
      cache = {
        projects,
        expiresAt: now + CACHE_TTL_MS,
      };
    }

    res.send({ projects: cache.projects });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
};
