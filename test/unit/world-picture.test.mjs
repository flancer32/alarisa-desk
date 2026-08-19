// @ts-nocheck
import assert from "node:assert/strict";
import test from "node:test";

import {createSessionFlow} from "../../web/session-flow.js";
import {createWorldPictureController, nodeUrl, treeUrl} from "../../web/world-picture.js";

function response(status, body = {}) {
  return {ok: status >= 200 && status < 300, status, json: async () => body};
}

function viewLog() {
  const calls = [];
  return {
    calls,
    setLoading: (message) => calls.push(["loading", message]),
    renderTree: (picture, selectedId) => calls.push(["tree", picture, selectedId]),
    renderDetail: (picture, objectId) => calls.push(["detail", picture, objectId]),
    clearPicture: () => calls.push(["clear"]),
    showStatus: (message, retryable) => calls.push(["status", message, retryable]),
  };
}

test("uses only documented tree, focus, and node routes for an Object focus", async () => {
  const calls = [];
  const view = viewLog();
  const controller = createWorldPictureController({
    fetchImpl: async (url, options) => {
      calls.push([url, options]);
      return response(200, {tree: [], objects: [], relations: []});
    },
    view,
  });

  await controller.selectObject(17);

  assert.equal(treeUrl(), "/api/v1/world-picture/tree");
  assert.equal(treeUrl(17), "/api/v1/world-picture/tree?focus=17");
  assert.equal(nodeUrl(17), "/api/v1/world-picture/node/17");
  assert.deepEqual(calls.map(([url]) => url), [treeUrl(17), nodeUrl(17)]);
  assert.deepEqual(calls.map(([, options]) => options.credentials), ["same-origin", "same-origin"]);
  assert.deepEqual(view.calls.map(([kind]) => kind), ["loading", "tree", "detail", "status"]);
});

test("does not fetch Picture data until session restoration confirms authentication", async () => {
  const order = [];
  const flow = createSessionFlow({
    auth: {
      currentSession: async () => { order.push("session"); return {authenticated: true}; },
      authenticate: async () => undefined,
      logout: async () => undefined,
      registerAuthenticator: async () => undefined,
    },
    workspace: {clear: () => order.push("clear"), loadTree: async () => order.push("tree")},
    ui: {showLocked: () => order.push("locked"), showUnlocked: () => order.push("unlocked"), setAuthenticationBusy: () => undefined},
    enrollmentToken: null,
    clearEnrollment: () => undefined,
  });

  await flow.restore();

  assert.deepEqual(order, ["session", "unlocked", "tree"]);
});

test("a 401 clears protected view and returns to the locked authentication flow", async () => {
  const view = viewLog();
  let locked = 0;
  const controller = createWorldPictureController({
    fetchImpl: async () => response(401),
    view,
    onUnauthorized: () => { locked += 1; },
  });

  await controller.loadTree();

  assert.equal(locked, 1);
  assert.deepEqual(view.calls.map(([kind]) => kind), ["loading", "clear"]);
});

test("a 503 clears protected view, presents a retry state, and retries the same route", async () => {
  const view = viewLog();
  let count = 0;
  const controller = createWorldPictureController({
    fetchImpl: async () => {
      count += 1;
      return response(count === 1 ? 503 : 200, {tree: []});
    },
    view,
  });

  await controller.loadTree();
  await controller.retry();

  assert.equal(count, 2);
  assert.deepEqual(view.calls.map(([kind]) => kind), ["loading", "clear", "status", "loading", "tree", "status"]);
  assert.equal(view.calls[2][2], true);
});

test("a stale cross-link target leaves the current view intact", async () => {
  const view = viewLog();
  const controller = createWorldPictureController({
    fetchImpl: async () => response(404),
    view,
  });

  await controller.selectObject(91);

  assert.deepEqual(view.calls.map(([kind]) => kind), ["loading", "status"]);
  assert.match(view.calls[1][1], /no longer available/);
});
