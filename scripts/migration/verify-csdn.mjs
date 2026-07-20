import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { csdnPostStem } from "./csdn-naming.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const postsDir = path.join(repoRoot, "src/content/posts");
const imagesRoot = path.join(repoRoot, "public/images/csdn");
const expectedArticleCount = 38;
const expectedDraft = process.env.CSDN_EXPECT_DRAFT;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath)));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

const sourcePattern =
  /> 本文最初发布于 CSDN：\[查看原文\]\((https:\/\/blog\.csdn\.net\/qq_42618152\/article\/details\/(\d+))\)。/;
const markdownFiles = (await readdir(postsDir))
  .filter(file => file.endsWith(".md"))
  .sort();
const postFiles = [];
for (const file of markdownFiles) {
  const content = await readFile(path.join(postsDir, file), "utf8");
  if (sourcePattern.test(content)) postFiles.push(file);
}
if (postFiles.length !== expectedArticleCount) {
  throw new Error(
    `Expected ${expectedArticleCount} CSDN posts, found ${postFiles.length}`
  );
}

const sourceUrls = new Set();
const referencedImages = new Set();
for (const file of postFiles) {
  const content = await readFile(path.join(postsDir, file), "utf8");
  if (/csdnimg\.cn|img-blog\.csdn\.net/.test(content)) {
    throw new Error(`Remote CSDN image remains in ${file}`);
  }
  if (/^@\[TOC\]|^\[外链图片转存失败/m.test(content)) {
    throw new Error(`CSDN platform placeholder remains in ${file}`);
  }
  if (expectedDraft === "true" && !/^draft: true$/m.test(content)) {
    throw new Error(`Expected draft article: ${file}`);
  }
  if (expectedDraft === "false" && /^draft: true$/m.test(content)) {
    throw new Error(`Expected published article: ${file}`);
  }

  const sourceMatch = content.match(sourcePattern);
  if (!sourceMatch) throw new Error(`Missing CSDN source link in ${file}`);
  if (sourceUrls.has(sourceMatch[1])) {
    throw new Error(`Duplicate CSDN source URL: ${sourceMatch[1]}`);
  }
  sourceUrls.add(sourceMatch[1]);

  const titleMatch = content.match(/^title: (.+)$/m);
  if (!titleMatch) throw new Error(`Missing title in ${file}`);
  const title = JSON.parse(titleMatch[1]);
  const expectedFilename = `${csdnPostStem(title, sourceMatch[2])}.md`;
  if (file !== expectedFilename) {
    throw new Error(
      `Unexpected CSDN filename: ${file}; expected ${expectedFilename}`
    );
  }

  for (const match of content.matchAll(
    /\/personal-blog\/images\/csdn\/[^)\s]+/g
  )) {
    referencedImages.add(path.join(repoRoot, "public", match[0].slice(15)));
  }
}

const actualImages = new Set(await listFiles(imagesRoot));
const missingImages = [...referencedImages].filter(file => !actualImages.has(file));
const orphanImages = [...actualImages].filter(file => !referencedImages.has(file));
if (missingImages.length > 0) {
  throw new Error(`Missing localized images:\n${missingImages.join("\n")}`);
}
if (orphanImages.length > 0) {
  throw new Error(`Unreferenced localized images:\n${orphanImages.join("\n")}`);
}

process.stdout.write(
  `Verified ${postFiles.length} CSDN posts, ${sourceUrls.size} unique sources, ` +
    `${actualImages.size} localized images.\n`
);
