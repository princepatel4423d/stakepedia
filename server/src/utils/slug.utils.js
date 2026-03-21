export const generateSlug = (text) =>
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");

export const generateUniqueSlug = async (text, Model, excludeId = null) => {
  let slug = generateSlug(text);
  let count = 0;
  while (true) {
    const candidate = count === 0 ? slug : `${slug}-${count}`;
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.findOne(query);
    if (!exists) return candidate;
    count++;
  }
};