/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createServerApp } from '../src/serverCore';

const app = createServerApp();

export default function handler(req: any, res: any) {
  return app(req, res);
}
