// @ts-nocheck
import assert from "node:assert/strict";
import test from "node:test";

import {createSessionFlow} from "../../web/session-flow.js";
import {createWorldPictureController, groupRelations, hierarchyPath, nodeUrl, objectLabel, treeUrl} from "../../web/world-picture.js";

function response(status, body = {}) {
  return {ok: status >= 200 && status < 300, status, json: async () => body};
}

function viewLog() {
  const calls = [];
  return {
    calls,
    setLoading: (message) => calls.push(["loading", message]),
    renderTree: (picture, state) => calls.push(["tree", picture, state]),
    renderBreadcrumb: (path) => calls.push(["breadcrumb", path]),
    renderDetail: (picture, objectId) => calls.push(["detail", picture, objectId]),
    clearPicture: () => calls.push(["clear"]),
    showStatus: (message, retryable) => calls.push(["status", message, retryable]),
  };
}

const picture = {
  tree: [{objectId: 1, children: [{objectId: 2, children: [{objectId: 3, children: []}]}]}],
  objects: [1, 2, 3, 4].map((id) => ({id, components: [{typeId: 1, properties: [{typeId: 2, value: `Case ${id}`}]}]})),
  componentTypes: [{id: 1, code: "case"}], propertyTypes: [{id: 2, code: "title"}], relations: [], relationTypes: [],
};

test("uses a human-readable Case title as the primary Object label", () => {
  const picture = {
    objects: [{id: 17, components: [{typeId: 1, properties: [{typeId: 2, value: "Household"}]}]}],
    componentTypes: [{id: 1, code: "case"}],
    propertyTypes: [{id: 2, code: "title"}],
  };

  assert.equal(objectLabel(17, picture), "Household");
  assert.equal(objectLabel(18, picture), "Object #18");
});

test("selection reads detail without changing root or expanding the hierarchy", async () => {
  const calls = [];
  const view = viewLog();
  const controller = createWorldPictureController({
    fetchImpl: async (url, options) => {
      calls.push([url, options]);
      return response(200, picture);
    },
    view,
  });

  await controller.loadTree();
  await controller.selectObject(2);

  assert.equal(treeUrl(), "/api/v1/world-picture/tree");
  assert.equal(treeUrl(17), "/api/v1/world-picture/tree?focus=17");
  assert.equal(nodeUrl(17), "/api/v1/world-picture/node/17");
  assert.deepEqual(calls.map(([url]) => url), [treeUrl(), nodeUrl(2)]);
  assert.deepEqual(calls.map(([, options]) => options.credentials), ["same-origin", "same-origin"]);
  const selected = view.calls.filter(([kind]) => kind === "tree").at(-1)[2];
  assert.equal(selected.root, undefined);
  assert.equal(selected.selected, 2);
  assert.deepEqual([...selected.expanded], []);
});

test("initial hierarchy is collapsed and expansion changes neither root nor selection", async () => {
  const view = viewLog(); const controller = createWorldPictureController({fetchImpl: async () => response(200, picture), view});
  await controller.loadTree(); controller.setExpanded(1, true);
  const state = view.calls.filter(([kind]) => kind === "tree").at(-1)[2];
  assert.equal(state.root, undefined); assert.equal(state.selected, undefined); assert.deepEqual([...state.expanded], [1]);
  controller.setExpanded(1, false);
  assert.deepEqual([...view.calls.filter(([kind]) => kind === "tree").at(-1)[2].expanded], []);
});

test("drill-down and breadcrumb navigation explicitly change the hierarchy root", async () => {
  const view = viewLog(); const calls = []; const controller = createWorldPictureController({fetchImpl: async (url) => { calls.push(url); return response(200, picture); }, view});
  await controller.loadTree(); controller.setExpanded(1, true); await controller.drillDown(2);
  assert.equal(view.calls.filter(([kind]) => kind === "tree").at(-1)[2].root, 2);
  assert.deepEqual([...view.calls.filter(([kind]) => kind === "tree").at(-1)[2].expanded], [1]);
  assert.deepEqual(calls, [treeUrl(), treeUrl(2)]);
  assert.deepEqual(hierarchyPath(picture.tree, 3), [1, 2, 3]);
  controller.navigateTo();
  assert.equal(view.calls.filter(([kind]) => kind === "tree").at(-1)[2].root, undefined);
  assert.deepEqual([...view.calls.filter(([kind]) => kind === "tree").at(-1)[2].expanded], [1]);
});

test("cross-links group both by relation type and by related Object", () => {
  const relations = [
    {typeId: 1, sourceObjectId: 2, targetObjectId: 3}, {typeId: 2, sourceObjectId: 2, targetObjectId: 3}, {typeId: 1, sourceObjectId: 2, targetObjectId: 4},
  ]; const types = [{id: 1, code: "supports"}, {id: 2, code: "funded-by"}];
  assert.deepEqual([...groupRelations(relations, 2, types)], [["supports", new Set([3, 4])], ["funded-by", new Set([3])]]);
  assert.deepEqual([...groupRelations(relations, 2, types, "object")], [[3, new Set(["supports", "funded-by"])], [4, new Set(["supports"])]]);
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
  assert.deepEqual(view.calls.map(([kind]) => kind), ["loading", "clear", "status", "loading", "tree", "breadcrumb", "status"]);
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
