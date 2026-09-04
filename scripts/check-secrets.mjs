import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const forbiddenTrackedFiles = /(^|\/)(\.env(?:\.(?!example$)[^/]*)?|[^/]+\.(?:pem|key))$/i;
const patterns = [
  ["Google API key", /AIza[0-9A-Za-z_-]{20,}/g],
  ["Google OAuth client secret", /GOCSPX-[0-9A-Za-z_-]{10,}/g],
  ["Resend API key", /re_[0-9A-Za-z_-]{20,}/g],
  ["GitHub token", /gh[pousr]_[0-9A-Za-z]{20,}/g],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ["Stripe secret key", /sk_(?:live|test)_[0-9A-Za-z]{10,}/g],
  ["AWS access key", /AKIA[0-9A-Z]{16}/g],
  ["JWT", /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
];

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const findings = [];

for (const file of files) {
  const normalized = file.replaceAll("\\", "/");
  if (forbiddenTrackedFiles.test(normalized)) {
    findings.push(`${normalized}: private environment or key file is tracked`);
    continue;
  }

  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const content = bytes.toString("utf8");
  for (const [label, pattern] of patterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) findings.push(`${normalized}: possible ${label}`);
  }
}

if (findings.length) {
  console.error("Secret scan failed. Values are intentionally not printed.");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Secret scan passed (${files.length} tracked files checked).`);
}
