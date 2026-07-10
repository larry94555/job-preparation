/** Minimal Markdown → HTML for the controlled lesson material (headings, lists,
 * paragraphs, **bold**, `code`, and ``` fenced blocks). Not a general renderer. */

export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(t: string): string {
  return esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/** Extract the body under a heading whose slug matches `slug`, up to the next
 * heading of the same or higher level. Returns null if not found. */
export function extractSection(md: string, slug: string): { heading: string; body: string } | null {
  const lines = md.split(/\r?\n/);
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = /^(#{1,6})\s+(.*)$/.exec(lines[i]);
    if (m && slugify(m[2]) === slug) {
      start = i;
      level = m[1].length;
      break;
    }
  }
  if (start < 0) return null;
  const heading = /^#{1,6}\s+(.*)$/.exec(lines[start])![1];
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const m = /^(#{1,6})\s+/.exec(lines[i]);
    if (m && m[1].length <= level) break;
    body.push(lines[i]);
  }
  return { heading, body: body.join("\n") };
}

export function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  let html = "";
  let i = 0;
  let inList = false;
  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      closeList();
      i++;
      const code: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++; // closing fence
      html += "<pre><code>" + esc(code.join("\n")) + "</code></pre>";
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      const lvl = h[1].length;
      html += `<h${lvl}>${inline(h[2])}</h${lvl}>`;
      i++;
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += "<li>" + inline(line.replace(/^\s*-\s+/, "")) + "</li>";
      i++;
      continue;
    }

    if (/^\s*$/.test(line)) {
      closeList();
      i++;
      continue;
    }

    // paragraph: gather consecutive non-structural lines
    closeList();
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*-\s+/.test(lines[i]) &&
      !/^```/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    html += "<p>" + inline(para.join(" ")) + "</p>";
  }

  closeList();
  return html;
}
