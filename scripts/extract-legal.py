#!/usr/bin/env python3
"""Generate lib/legal.ts from the Nexlivo legal pack.

The prose on /terms and /privacy is BINDING LEGAL LANGUAGE. It must be
transferred verbatim, never paraphrased, summarised, or retyped from memory.
This script does the transfer mechanically so no wording can drift, and it is
the single source of truth for how lib/legal.ts is produced — regenerate with:

    python3 scripts/extract-legal.py [path/to/Nexlivo_Legal_Pack.md]

Default source: ~/Downloads/Nexlivo_Legal_Pack.md (override with the argument
above or the NEXLIVO_LEGAL_PACK environment variable).

The source is Markdown; the pages render each section body as plain text with
`whitespace-pre-line`. Anything that only exists as Markdown *punctuation*
(horizontal rules, emphasis markers, code-span backticks) would therefore show
up literally on the page, so it is removed here. Only the punctuation is
removed — every word, number, and placeholder token is carried across
unchanged.
"""

import json
import os
import pathlib
import re
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_PATH = REPO_ROOT / "lib" / "legal.ts"
UPDATED = "24 August 2026"


def source_path() -> pathlib.Path:
    if len(sys.argv) > 1:
        return pathlib.Path(sys.argv[1]).expanduser()
    env = os.environ.get("NEXLIVO_LEGAL_PACK")
    if env:
        return pathlib.Path(env).expanduser()
    return pathlib.Path.home() / "Downloads" / "Nexlivo_Legal_Pack.md"


SRC = source_path()
if not SRC.is_file():
    raise SystemExit(f"Legal pack not found at {SRC}")

lines = SRC.read_text(encoding="utf-8").splitlines()

# Locate the two top-level (`# `) parts we care about.
tops = [(i, l[2:].strip()) for i, l in enumerate(lines) if l.startswith("# ")]


def bounds(pred):
    for idx, (i, title) in enumerate(tops):
        if pred(title.lower()):
            end = tops[idx + 1][0] if idx + 1 < len(tops) else len(lines)
            return i, end
    raise SystemExit(f"Could not locate part: {pred}")


def strip_trailing_rule(text):
    """Drop a trailing standalone markdown horizontal rule (---, ----, ...)
    and any blank lines around it. The source places a `---` separator
    right before each next `# ` top-level heading; because collect() only
    starts a new section on `## `, that rule gets absorbed into the last
    `## ` section of a part (Terms 1.22 / Privacy 2.15) and would otherwise
    render as a literal "---" on the page. This is a source-markdown
    artifact, not legal prose, so it must be dropped mechanically here
    rather than hand-edited out of the generated output."""
    out_lines = text.split("\n")
    while out_lines and (
        out_lines[-1].strip() == "" or re.fullmatch(r"-{3,}", out_lines[-1].strip())
    ):
        out_lines.pop()
    return "\n".join(out_lines).strip()


# `**bold**` -> `bold`, `` `code` `` -> `code`. Both patterns are deliberately
# conservative: the inner group forbids the delimiter character and a newline,
# so an unbalanced or multi-line marker is left alone and caught by
# assert_no_markdown() below rather than silently swallowing prose between two
# unrelated markers. The inner text — including placeholder tokens such as
# [LEGAL EMAIL] and figures such as 50% advance payment — is preserved byte for
# byte; only the wrapping punctuation is removed.
BOLD = re.compile(r"\*\*([^*\n]+)\*\*")
CODE = re.compile(r"`([^`\n]+)`")

# ATX sub-heading markers ("### Information you provide"). collect() consumes
# `# ` and `## ` lines as part/section delimiters, so only `###` and deeper can
# reach a body — the range is kept at 1-6 anyway so a stray shallower marker
# cannot slip through unnoticed. Unlike ** and ``, this is not punctuation
# wrapping inline content: the line IS a heading. But a `##` section already
# renders as the <h2> built from section.heading, and there is no UI element one
# level down, so the marker is simply dropped and the words are left standing as
# their own line. The pages render bodies with `whitespace-pre-line`, so that
# line break survives and the text never runs into the surrounding prose.
# Matches CommonMark's ATX form: up to 3 leading spaces, 1-6 hashes, required
# whitespace, and an optional closing run of hashes.
ATX_HEADING = re.compile(r"(?m)^[ ]{0,3}#{1,6}[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$")


def strip_markdown_syntax(text):
    """Remove emphasis, code-span, and sub-heading punctuation.

    Only the markers go; every word, number, placeholder token, and line break
    is preserved exactly.
    """
    return ATX_HEADING.sub(r"\1", CODE.sub(r"\1", BOLD.sub(r"\1", text)))


def assert_no_markdown(sections, label):
    """Fail loudly rather than shipping a page with literal markup on it."""
    for s in sections:
        for field in ("heading", "body"):
            value = s[field]
            leftovers = [m for m in ("**", "`") if m in value]
            if ATX_HEADING.search(value):
                leftovers.append("#")
            if leftovers:
                raise SystemExit(
                    f"{label}: unstripped markdown {leftovers} in "
                    f"{field} of section {s['heading']!r}"
                )
            # A bare "#" that is not a heading marker (e.g. "invoice #42") is
            # legitimate prose and must not block regeneration - but it would
            # be the one way a stray hash could still reach the page, so say so
            # rather than passing silently.
            if "#" in value:
                print(
                    f"  note: {label}/{s['heading']!r} {field} contains a non-heading "
                    f"'#'; confirm it is intended prose."
                )


def collect(start, end):
    """Return [{heading, body}] for each `## ` subsection in the range."""
    out, heading, buf = [], None, []
    for line in lines[start:end]:
        if line.startswith("## "):
            if heading:
                out.append({"heading": heading, "body": strip_trailing_rule("\n".join(buf))})
            heading, buf = re.sub(r"^\d+\.\d+\s*", "", line[3:].strip()), []
        elif heading is not None:
            buf.append(line)
    if heading:
        out.append({"heading": heading, "body": strip_trailing_rule("\n".join(buf))})
    out = [s for s in out if s["body"]]
    for s in out:
        s["heading"] = strip_markdown_syntax(s["heading"])
        s["body"] = strip_markdown_syntax(s["body"])
    return out


ts, te = bounds(lambda t: "terms" in t)
ps, pe = bounds(lambda t: "privacy" in t)
terms, privacy = collect(ts, te), collect(ps, pe)

assert_no_markdown(terms, "terms")
assert_no_markdown(privacy, "privacy")

print(f"terms: {len(terms)} sections, privacy: {len(privacy)} sections")

body = (
    "// GENERATED from Nexlivo_Legal_Pack.md — do not hand-edit the prose.\n"
    "// Regenerate by running: python3 scripts/extract-legal.py\n\n"
    "type LegalSection = { heading: string; body: string };\n"
    "type LegalDoc = { title: string; updated: string; sections: LegalSection[] };\n\n"
    "export const terms: LegalDoc = "
    + json.dumps(
        {"title": "Terms & Conditions", "updated": UPDATED, "sections": terms},
        indent=2,
        ensure_ascii=False,
    )
    + ";\n\nexport const privacy: LegalDoc = "
    + json.dumps(
        {"title": "Privacy Policy", "updated": UPDATED, "sections": privacy},
        indent=2,
        ensure_ascii=False,
    )
    + ";\n"
)
OUT_PATH.write_text(body, encoding="utf-8")
print(f"wrote {OUT_PATH.relative_to(REPO_ROOT)}")
