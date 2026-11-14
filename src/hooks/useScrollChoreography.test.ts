import assert from 'node:assert/strict';
import test from 'node:test';
import { computeScrollProgressRatio } from './useScrollChoreography.ts';

test('computeScrollProgressRatio maps viewport traversal smoothly and clamps to [0, 1]', () => {
  assert.equal(computeScrollProgressRatio(900, 600, 900), 0);
  assert.ok(computeScrollProgressRatio(1500, 600, 900) === 0);
  const mid = computeScrollProgressRatio(150, 600, 900);
  assert.ok(Math.abs(mid - 0.5) < 0.01, `expected ~0.5 at mid-viewport, got ${mid}`);
  assert.equal(computeScrollProgressRatio(-600, 600, 900), 1);
  assert.equal(computeScrollProgressRatio(-900, 600, 900), 1);
});
