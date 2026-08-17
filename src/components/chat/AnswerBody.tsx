import type { ReactNode } from "react";

/** Minimal, safe renderer for the assistant's markdown subset (headings, lists, bold, links). */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*)|(https?:\/\/[^\s)<>,]+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1]) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-foreground">
          {match[1].slice(2, -2)}
        </strong>,
      );
    } else if (match[2]) {
      nodes.push(
        <a
          key={`${keyPrefix}-a${i}`}
          href={match[2]}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
        >
          {match[2].replace(/^https?:\/\//, "")}
        </a>,
      );
    }
    last = match.index + match[0].length;
    i += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function AnswerBody({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const key = `list-${blocks.length}`;
    blocks.push(
      list.ordered ? (
        <ol key={key} className="my-3 space-y-2 pl-1">
          {list.items.map((item, index) => (
            <li key={`${key}-${index}`} className="flex gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[0.68rem] font-semibold text-primary">
                {index + 1}
              </span>
              <span className="flex-1">{inline(item, `${key}-${index}`)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul key={key} className="my-3 space-y-1.5">
          {list.items.map((item, index) => (
            <li key={`${key}-${index}`} className="flex gap-3">
              <span
                className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <span className="flex-1">{inline(item, `${key}-${index}`)}</span>
            </li>
          ))}
        </ul>
      ),
    );
    list = null;
  };

  lines.forEach((raw, index) => {
    const line = raw.trimEnd();
    const heading = /^#{2,4}\s+(.*)$/.exec(line.trim());
    const bullet = /^[-*]\s+(.*)$/.exec(line.trim());
    const ordered = /^\d+[.)]\s+(.*)$/.exec(line.trim());

    if (heading) {
      flush();
      blocks.push(
        <h3
          key={`h-${index}`}
          className="mt-5 mb-1.5 font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-primary first:mt-0"
        >
          {heading[1]}
        </h3>,
      );
      return;
    }
    if (bullet) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1] ?? "");
      return;
    }
    if (ordered) {
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[1] ?? "");
      return;
    }
    flush();
    if (line.trim() === "") return;
    blocks.push(
      <p key={`p-${index}`} className="my-2 leading-relaxed first:mt-0">
        {inline(line.trim(), `p-${index}`)}
      </p>,
    );
  });
  flush();

  return <div className="text-[0.94rem] text-foreground/90">{blocks}</div>;
}
