/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function handler(_req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ status: "ok", service: "TeXora Forge Academic Server" });
}
