#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const channelId = process.argv[2] || process.env.SLACK_CHANNEL_ID;
if (!channelId) {
  console.error("Usage: node scripts/dock-views.mjs <channel-id>");
  process.exit(1);
}

const { slack } = await import("../../scripts/scaffold-code-channel.js");

const html = readFileSync(join(ROOT, "Homepage.html"), "utf8");
let diffContent = "";
try {
  diffContent = execSync("git show HEAD --no-color", { cwd: ROOT, encoding: "utf8" }).trim();
} catch (_) {}

const planBlocks = [
  { type: "header", text: { type: "plain_text", text: "Plan: Pension Drawdown Planner" } },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Built*\n• `src/drawdown.js` — withdraw-first, then growth; 40-year horizon\n• `Homepage.html` — Ninety One dark UI, live results + SVG chart\n• `test/drawdown.test.js` — three acceptance cases",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Repo:* <https://github.com/jmahedy-slack/pension-drawdown-planner|jmahedy-slack/pension-drawdown-planner>",
    },
  },
];

for (const [label, payload] of [
  ["Homepage", { type: "html", view_key: "homepage.html", name: "Homepage", content: html }],
  ["Plan", { type: "block_kit", view_key: "plan", name: "Plan", blocks: planBlocks }],
]) {
  const res = await slack("agents.conversations.setView", { channel_id: channelId, ...payload });
  console.log(label, res.ok ? "✔" : res.error);
}

if (diffContent) {
  const diffRes = await slack("agents.conversations.setView", {
    channel_id: channelId,
    type: "diff",
    content: diffContent,
    base_branch: "main",
    head_branch: "cursor/pension-drawdown-planner-9b5d",
  });
  console.log("Diff", diffRes.ok ? "✔" : diffRes.error);
}
