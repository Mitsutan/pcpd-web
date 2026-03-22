// Radio System: manages radio message log
// Original behavior: 50% chance to skip, random message from category, 10-line scrolling log

import { RADIO_MESSAGES } from '../data/radioMessages';

export class RadioSystem {
  private log: string[] = [];
  private maxLines: number = 10;

  /** Send a radio message of the given category. 50% chance to be skipped (reduces spam). */
  send(category: string): void {
    // 50% chance to skip (matching original RND(10)<=4)
    if (Math.random() < 0.5) return;

    const cat = RADIO_MESSAGES.find(c => c.key === category);
    if (!cat || cat.messages.length === 0) return;

    const msg = cat.messages[Math.floor(Math.random() * cat.messages.length)];

    if (this.log.length >= this.maxLines) {
      this.log.shift();
    }
    this.log.push(msg);
  }

  /** Force-send a message (no 50% skip). Used for important events. */
  forceSend(category: string): void {
    const cat = RADIO_MESSAGES.find(c => c.key === category);
    if (!cat || cat.messages.length === 0) return;

    const msg = cat.messages[Math.floor(Math.random() * cat.messages.length)];

    if (this.log.length >= this.maxLines) {
      this.log.shift();
    }
    this.log.push(msg);
  }

  getLog(): string[] {
    return this.log;
  }

  clear(): void {
    this.log = [];
  }
}
