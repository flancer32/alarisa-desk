// @ts-nocheck

export const WORLD_PICTURE_API = "/api/v1/world-picture";

export function treeUrl(objectId) {
  return objectId === undefined
    ? `${WORLD_PICTURE_API}/tree`
    : `${WORLD_PICTURE_API}/tree?focus=${encodeURIComponent(String(objectId))}`;
}

export function nodeUrl(objectId) {
  return `${WORLD_PICTURE_API}/node/${encodeURIComponent(String(objectId))}`;
}

export function objectLabel(objectId) {
  return `Object #${objectId}`;
}

export class WorldPictureRequestError extends Error {
  constructor(status) {
    super(`World Picture request failed with status ${status}.`);
    this.status = status;
  }
}

async function readJson(fetchImpl, url) {
  const response = await fetchImpl(url, {
    credentials: "same-origin",
    headers: {Accept: "application/json"},
  });
  if (!response.ok) throw new WorldPictureRequestError(response.status);
  return await response.json();
}

export function createWorldPictureController({fetchImpl = fetch, view, onUnauthorized = () => undefined}) {
  let retry = () => loadTree();

  const showFailure = function (error) {
    if (error instanceof WorldPictureRequestError && error.status === 401) {
      view.clearPicture();
      onUnauthorized();
      return;
    }
    if (error instanceof WorldPictureRequestError && error.status === 404) {
      view.showStatus("This Object is no longer available. The current view is unchanged.");
      return;
    }
    view.clearPicture();
    view.showStatus(
      error instanceof WorldPictureRequestError && error.status === 503
        ? "The World Picture is temporarily unavailable."
        : "The World Picture could not be reached. Check your connection and retry.",
      true,
    );
  };

  const loadTree = async function (focusObjectId = undefined) {
    retry = () => loadTree(focusObjectId);
    view.setLoading(focusObjectId === undefined ? "Loading the World Picture…" : "Loading the focused branch…");
    try {
      const picture = await readJson(fetchImpl, treeUrl(focusObjectId));
      view.renderTree(picture, focusObjectId);
      view.showStatus(focusObjectId === undefined ? "Complete World Picture." : `Focused ${objectLabel(focusObjectId)}.`);
    } catch (error) {
      showFailure(error);
    }
  };

  const selectObject = async function (objectId) {
    retry = () => selectObject(objectId);
    view.setLoading(`Loading ${objectLabel(objectId)}…`);
    try {
      const [tree, detail] = await Promise.all([
        readJson(fetchImpl, treeUrl(objectId)),
        readJson(fetchImpl, nodeUrl(objectId)),
      ]);
      view.renderTree(tree, objectId);
      view.renderDetail(detail, objectId);
      view.showStatus(`Focused ${objectLabel(objectId)}.`);
    } catch (error) {
      showFailure(error);
    }
  };

  return Object.freeze({
    loadTree,
    selectObject,
    retry: () => retry(),
    clear: () => view.clearPicture(),
  });
}
