import {authenticate, currentSession, logout, registerAuthenticator} from "/_assets/comm/auth.js";

import "./world-picture-elements.js";
import {createSessionFlow} from "./session-flow.js";
import {createWorldPictureController} from "./world-picture.js";

const authPanel = document.querySelector("#auth-panel");
const authStatus = document.querySelector("#auth-status");
const authAction = document.querySelector("#auth-action");
const workspace = document.querySelector("#workspace");
const workspaceStatus = document.querySelector("#workspace-status");
const workspaceError = document.querySelector("#workspace-error");
const retryAction = document.querySelector("#retry-action");
const tree = document.querySelector("#world-tree");
const detail = document.querySelector("#world-detail");
const returnTreeAction = document.querySelector("#return-tree-action");
const lockAction = document.querySelector("#lock-action");
const enrollmentToken = new URLSearchParams(location.search).get("enrollment");

let sessionFlow;
const view = {
  setLoading(message) {
    workspaceStatus.textContent = message;
    workspaceError.hidden = true;
    retryAction.hidden = true;
  },
  renderTree(picture, selectedId) {
    tree.setPicture(picture, selectedId);
  },
  renderDetail(picture, objectId) {
    detail.setPicture(picture, objectId);
  },
  clearPicture() {
    tree.setPicture({tree: []}, undefined);
    detail.clear();
  },
  showStatus(message, retryable = false) {
    workspaceStatus.textContent = message;
    workspaceError.hidden = true;
    retryAction.hidden = !retryable;
  },
};

const picture = createWorldPictureController({
  view,
  onUnauthorized: () => sessionFlow.unauthorized(),
});

const ui = {
  showLocked(message, actionLabel) {
    workspace.hidden = true;
    authPanel.hidden = false;
    authStatus.textContent = message;
    authAction.hidden = false;
    if (actionLabel) authAction.textContent = actionLabel;
  },
  showUnlocked() {
    authPanel.hidden = true;
    workspace.hidden = false;
  },
  setAuthenticationBusy(busy, message) {
    authAction.disabled = busy;
    if (message) authStatus.textContent = message;
  },
};

sessionFlow = createSessionFlow({
  auth: {authenticate, currentSession, logout, registerAuthenticator},
  workspace: picture,
  ui,
  enrollmentToken,
  clearEnrollment: () => history.replaceState(null, "", location.pathname),
});

authAction.addEventListener("click", () => sessionFlow.authenticate());
lockAction.addEventListener("click", () => sessionFlow.lock());
returnTreeAction.addEventListener("click", () => picture.loadTree());
retryAction.addEventListener("click", () => picture.retry());
tree.addEventListener("world-picture-select", (event) => picture.selectObject(event.detail.objectId));
tree.addEventListener("world-picture-focus", (event) => picture.selectObject(event.detail.objectId));
detail.addEventListener("world-picture-cross-link", (event) => picture.selectObject(event.detail.objectId));

sessionFlow.restore();

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js", {scope: "./"});
