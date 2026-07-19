import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const rawDir = path.resolve(
  process.env.CSDN_RAW_DIR ?? "/private/tmp/csdn-migration-20260719/raw"
);
const repoRoot = path.resolve(import.meta.dirname, "../..");
const postsDir = path.join(repoRoot, "src/content/posts");
const imagesRoot = path.join(repoRoot, "public/images/csdn");
const manifestPath = path.resolve(
  process.env.CSDN_MANIFEST ??
    "/private/tmp/csdn-migration-20260719/manifest.json"
);
const expectedArticleCount = 38;
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36";

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function writeWithoutOverwrite(file, content) {
  if (await exists(file)) {
    const current = await readFile(file);
    const next = Buffer.isBuffer(content) ? content : Buffer.from(content);
    if (current.equals(next)) return "unchanged";
    throw new Error(`Refusing to overwrite a different file: ${file}`);
  }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, { flag: "wx" });
  return "created";
}

async function writeManagedPost(file, content, sourceUrl) {
  if (!(await exists(file))) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content, { flag: "wx" });
    return "created";
  }
  const current = await readFile(file, "utf8");
  if (current === content) return "unchanged";
  const sourceMarker = `> 本文最初发布于 CSDN：[查看原文](${sourceUrl})。`;
  if (!current.includes("draft: true") || !current.includes(sourceMarker)) {
    throw new Error(`Refusing to update a non-migration post: ${file}`);
  }
  await writeFile(file, content);
  return "updated";
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function yamlString(value) {
  return JSON.stringify(value);
}

function cleanMarkdown(markdown) {
  return markdown
    .replaceAll("\r\n", "\n")
    .replace(/^@\[TOC\]\([^\n]*\)\s*$/gm, "")
    .replace(/^\[外链图片转存失败[^\n]*\]\s*$/gm, "")
    .replace(/^\s*<!--\s*-->\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function descriptionFrom(markdown, title) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[#>*+-]+\s*/gm, "")
    .replace(/[`*_~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const fallback = `${title}的技术学习与实践记录。`;
  const description = text.length >= 20 ? text : fallback;
  return description.length > 180
    ? `${description.slice(0, 177).trimEnd()}...`
    : description;
}

function inferCategory(title, tags) {
  const text = `${title} ${tags.join(" ")}`.toLowerCase();
  if (/设计模式/.test(text)) return "软件设计";
  if (/mysql|redis|数据库/.test(text)) return "数据库";
  if (/数据结构|算法|链表|二叉树|栈|队列|数组/.test(text)) {
    return "数据结构与算法";
  }
  if (/linux|docker|idea|tomcat|工具/.test(text)) return "工具与运维";
  if (/面试|笔试/.test(text)) return "面试与复盘";
  if (/servlet|mvc|cookie|spring|feign|web/.test(text)) return "Web 开发";
  if (/java|jdk|jvm|线程|io|反射/.test(text)) return "Java";
  return "技术笔记";
}

function slugFor(title, id) {
  const ascii = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
    .replace(/-$/g, "");
  return ascii ? `csdn-${id}-${ascii}` : `csdn-${id}`;
}

function inferTags(title) {
  const rules = [
    [/redis/i, "Redis"],
    [/mysql/i, "MySQL"],
    [/jvm/i, "JVM"],
    [/(java|jdk)/i, "Java"],
    [/spring/i, "Spring"],
    [/docker/i, "Docker"],
    [/linux/i, "Linux"],
    [/idea/i, "IDEA"],
    [/线程/, "多线程"],
    [/(^|[^a-z])(nio|bio|io)([^a-z]|$)/i, "Java IO"],
    [/数据结构|链表|二叉树|栈|队列|数组/, "数据结构"],
    [/算法|排序/, "算法"],
    [/servlet/i, "Servlet"],
    [/mvc/i, "MVC"],
    [/cookie/i, "Web"],
    [/feign/i, "Feign"],
    [/反射/, "反射"],
    [/面试|笔试/, "面试"],
    [/设计模式/, "设计模式"],
  ];
  const tags = rules
    .filter(([pattern]) => pattern.test(title))
    .map(([, tag]) => tag)
    .filter((tag, index, values) => values.indexOf(tag) === index)
    .slice(0, 4);
  return tags.length > 0 ? tags : [inferCategory(title, [])];
}

const metadataOverrides = new Map([
  [
    "146524011",
    {
      pubDatetime: "2025-03-26T11:21:16+08:00",
      modDatetime: "2025-03-26T11:21:18+08:00",
      tags: ["redis", "学习"],
    },
  ],
  [
    "146401469",
    {
      pubDatetime: "2025-03-20T17:01:32+08:00",
      modDatetime: "2025-03-20T17:01:32+08:00",
      tags: ["mysql", "数据库"],
    },
  ],
]);

function metadataFromSource(source) {
  if (metadataOverrides.has(source.id)) return metadataOverrides.get(source.id);
  const dateMatch = source.summary.match(
    /发布博客\s+(\d{4})\.(\d{2})\.(\d{2})/
  );
  if (!dateMatch) throw new Error(`Missing publication date for ${source.id}`);
  return {
    pubDatetime: `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00+08:00`,
    tags: inferTags(source.title),
  };
}

async function curlDownload(url, options = {}) {
  const marker = Buffer.from("\n__CSDN_CONTENT_TYPE__:");
  const args = [
    "--fail",
    "--location",
    "--silent",
    "--show-error",
    "--retry",
    "3",
    "--retry-all-errors",
    "--retry-delay",
    "1",
    "--user-agent",
    userAgent,
  ];
  if (options.referer) args.push("--referer", options.referer);
  args.push("--write-out", "\n__CSDN_CONTENT_TYPE__:%{content_type}", url);

  const { stdout } = await execFileAsync("curl", args, {
    encoding: "buffer",
    maxBuffer: 50 * 1024 * 1024,
  });
  const markerIndex = stdout.lastIndexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing curl metadata for ${url}`);
  return {
    body: stdout.subarray(0, markerIndex),
    contentType: stdout.subarray(markerIndex + marker.length).toString().trim(),
  };
}

function normalizedImageUrl(rawUrl) {
  const url = new URL(decodeHtml(rawUrl));
  url.hash = "";
  return url.toString();
}

function extensionFor(url, contentType) {
  const pathnameExtension = path.extname(new URL(url).pathname).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(pathnameExtension)) {
    return pathnameExtension;
  }
  const extensions = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return extensions[contentType.split(";")[0].toLowerCase()] ?? ".img";
}

async function localizeImages(markdown, source) {
  const imagePattern = /!\[([\s\S]*?)\]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const matches = Array.from(markdown.matchAll(imagePattern));
  const uniqueUrls = [...new Set(matches.map(match => normalizedImageUrl(match[2])))];
  const replacements = new Map();

  for (const [index, remoteUrl] of uniqueUrls.entries()) {
    const response = await curlDownload(remoteUrl, { referer: source.href });
    const contentType = response.contentType;
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error(`Unexpected image content type for ${remoteUrl}: ${contentType}`);
    }
    const body = response.body;
    if (body.length === 0) throw new Error(`Empty image: ${remoteUrl}`);

    const hash = createHash("sha256").update(remoteUrl).digest("hex").slice(0, 12);
    const extension = extensionFor(remoteUrl, contentType);
    const filename = `${String(index + 1).padStart(2, "0")}-${hash}${extension}`;
    const diskPath = path.join(imagesRoot, source.id, filename);
    await writeWithoutOverwrite(diskPath, body);
    replacements.set(
      remoteUrl,
      `/personal-blog/images/csdn/${source.id}/${filename}`
    );
  }

  let imageNumber = 0;
  const localized = markdown.replace(imagePattern, (_, alt, rawUrl) => {
    imageNumber += 1;
    const localUrl = replacements.get(normalizedImageUrl(rawUrl));
    if (!localUrl) throw new Error(`Missing image replacement for ${rawUrl}`);
    const cleanedAlt = alt
      .replace(/\\?\]+$/g, "")
      .replace(/\)+$/g, "")
      .replace(/^\\+/, "")
      .trim();
    const normalizedAlt = cleanedAlt && cleanedAlt !== "在这里插入图片描述"
      ? cleanedAlt
      : `${source.title} 图 ${imageNumber}`;
    return `![${normalizedAlt}](${localUrl})`;
  });

  return { markdown: localized, imageCount: uniqueUrls.length };
}

function renderPost(source, metadata, markdown) {
  const description = descriptionFrom(markdown, source.title);
  const category = inferCategory(source.title, metadata.tags);
  const lines = [
    "---",
    `author: ${yamlString("ycr97")}`,
    `pubDatetime: ${metadata.pubDatetime}`,
  ];
  if (metadata.modDatetime && metadata.modDatetime !== metadata.pubDatetime) {
    lines.push(`modDatetime: ${metadata.modDatetime}`);
  }
  lines.push(
    `title: ${yamlString(source.title)}`,
    "draft: true",
    `tags: ${JSON.stringify(metadata.tags)}`,
    `category: ${yamlString(category)}`,
    `description: ${yamlString(description)}`,
    "---",
    "",
    markdown,
    "",
    "---",
    "",
    `> 本文最初发布于 CSDN：[查看原文](${source.href})。`,
    ""
  );
  return lines.join("\n");
}

const rawFiles = (await readdir(rawDir))
  .filter(file => file.endsWith(".json"))
  .sort((left, right) => Number(right.replace(".json", "")) - Number(left.replace(".json", "")));

if (rawFiles.length !== expectedArticleCount) {
  throw new Error(
    `Expected ${expectedArticleCount} raw articles, found ${rawFiles.length}`
  );
}

const sources = await Promise.all(
  rawFiles.map(async file => JSON.parse(await readFile(path.join(rawDir, file), "utf8")))
);
const seenIds = new Set();
const seenUrls = new Set();
for (const source of sources) {
  if (seenIds.has(source.id) || seenUrls.has(source.href)) {
    throw new Error(`Duplicate source article: ${source.id}`);
  }
  seenIds.add(source.id);
  seenUrls.add(source.href);
}

const manifest = [];
for (const [index, source] of sources.entries()) {
  const metadata = metadataFromSource(source);
  const cleaned = cleanMarkdown(source.markdown);
  const localized = await localizeImages(cleaned, source);
  const slug = slugFor(source.title, source.id);
  const postPath = path.join(postsDir, `${slug}.md`);
  const state = await writeManagedPost(
    postPath,
    renderPost(source, metadata, localized.markdown),
    source.href
  );
  manifest.push({
    id: source.id,
    title: source.title,
    sourceUrl: source.href,
    slug,
    postPath: path.relative(repoRoot, postPath),
    pubDatetime: metadata.pubDatetime,
    tags: metadata.tags,
    category: inferCategory(source.title, metadata.tags),
    imageCount: localized.imageCount,
    state,
  });
  process.stdout.write(
    `[${index + 1}/${sources.length}] ${source.id} ${state}; images=${localized.imageCount}\n`
  );
}

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const totalImages = manifest.reduce((total, article) => total + article.imageCount, 0);
process.stdout.write(
  `Imported ${manifest.length} draft articles with ${totalImages} localized images.\n` +
    `Manifest: ${manifestPath}\n`
);
