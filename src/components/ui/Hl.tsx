import { Fragment } from "react";

/**
 * Renders copy where [square-bracketed] words are key words: they get the dark-cream
 * highlighter (class "hl"), which swipes in when the surrounding <Reveal> enters the screen.
 * Example: "Ready to [grow] your brand?"
 */
export function Hl({ text }: { text: string }) {
  const parts = text.split(/\[([^\]]+)\]/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="hl">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Same text without the brackets (for labels, dialogs and meta text). */
export const plain = (text: string) => text.replace(/\[([^\]]+)\]/g, "$1");
