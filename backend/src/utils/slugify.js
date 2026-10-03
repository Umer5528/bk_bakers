// Small dependency-free slugifier — lowercase, hyphenated, URL-safe.
const slugify = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default slugify;
