// @ts-nocheck
export function createSessionFlow({auth, workspace, ui, enrollmentToken, clearEnrollment}) {
  const showLocked = function (message, actionLabel = "Sign in with a passkey") {
    workspace.clear();
    ui.showLocked(message, actionLabel);
  };

  const connect = async function () {
    ui.showUnlocked();
    await workspace.loadTree();
  };

  const restore = async function () {
    try {
      const session = await auth.currentSession();
      if (session.authenticated) await connect();
      else showLocked(enrollmentToken ? "Register a passkey for this device." : "Principal verification is required.", enrollmentToken ? "Trust this device" : undefined);
    } catch {
      showLocked("Server unavailable.");
    }
  };

  const authenticate = async function () {
    ui.setAuthenticationBusy(true, "Waiting for confirmation on your device…");
    try {
      if (enrollmentToken) {
        await auth.registerAuthenticator(enrollmentToken);
        clearEnrollment();
      } else await auth.authenticate("desk");
      await connect();
    } catch (error) {
      showLocked(error instanceof Error ? error.message : "Could not verify the Principal.");
    } finally {
      ui.setAuthenticationBusy(false);
    }
  };

  const lock = async function (message = "Alarisa is locked.") {
    await auth.logout().catch(() => undefined);
    showLocked(message);
  };

  const unauthorized = function () {
    showLocked("Your session has expired. Principal verification is required.");
  };

  return Object.freeze({restore, authenticate, lock, unauthorized});
}
