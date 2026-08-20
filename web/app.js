import {authenticate, currentSession, logout, registerAuthenticator} from "/_assets/comm/auth.js";

import "./world-picture-elements.js";
import {createSessionFlow} from "./session-flow.js";
import {createWorldPictureController, objectLabel} from "./world-picture.js";

const authPanel = document.querySelector("#auth-panel");
const authStatus = document.querySelector("#auth-status");
const authAction = document.querySelector("#auth-action");
const workspace = document.querySelector("#workspace");
const workspaceStatus = document.querySelector("#workspace-status");
const workspaceError = document.querySelector("#workspace-error");
const retryAction = document.querySelector("#retry-action");
const tree = document.querySelector("#world-tree");
const detail = document.querySelector("#world-detail");
const breadcrumb = document.querySelector("#world-breadcrumb");
const lockAction = document.querySelector("#lock-action");
const enrollmentToken = new URLSearchParams(location.search).get("enrollment");

let sessionFlow;
const view = {
  setLoading(message) {
    workspaceStatus.textContent = message;
    workspaceError.hidden = true;
    retryAction.hidden = true;
  },
  renderTree(picture, state) {
    tree.setPicture(picture, state);
  },
  renderBreadcrumb(path, pictureData) {
    breadcrumb.replaceChildren();
    const complete = document.createElement("button");
    complete.type = "button";
    complete.className = "secondary";
    complete.textContent = "World Picture";
    complete.dataset.root = "";
    breadcrumb.append(complete);
    for (const objectId of path) {
      const separator = document.createElement("span");
      separator.textContent = " / ";
      const item = document.createElement("button");
      item.type = "button";
      item.className = "secondary";
      item.textContent = objectLabel(objectId, pictureData);
      item.dataset.root = String(objectId);
      breadcrumb.append(separator, item);
    }
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
breadcrumb.addEventListener("click", (event) => {
  const item = event.target.closest("[data-root]");
  if (item) picture.navigateTo(item.dataset.root === "" ? undefined : Number(item.dataset.root));
});
retryAction.addEventListener("click", () => picture.retry());
tree.addEventListener("world-picture-select", (event) => picture.selectObject(event.detail.objectId));
tree.addEventListener("world-picture-expand", (event) => picture.setExpanded(event.detail.objectId, event.detail.expanded));
tree.addEventListener("world-picture-drill-down", (event) => picture.drillDown(event.detail.objectId));
detail.addEventListener("world-picture-cross-link", (event) => picture.selectObject(event.detail.objectId));

sessionFlow.restore();

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js", {scope: "./"});
