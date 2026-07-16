import {authenticate, currentSession, logout, registerAuthenticator} from '/_assets/comm/auth.js';

const authPanel = document.querySelector('#auth-panel');
const authStatus = document.querySelector('#auth-status');
const authAction = document.querySelector('#auth-action');
const workspace = document.querySelector('#workspace');
const lockAction = document.querySelector('#lock-action');

function showLocked(message = 'Principal verification is required.') {
  workspace.hidden = true;
  authPanel.hidden = false;
  authStatus.textContent = message;
  authAction.hidden = false;
}

function showUnlocked() {
  authPanel.hidden = true;
  workspace.hidden = false;
}

async function beginAuthentication() {
  authAction.disabled = true;
  authStatus.textContent = 'Waiting for confirmation on your device…';
  try {
    const enrollmentToken = new URLSearchParams(location.search).get('enrollment');
    if (enrollmentToken) {
      await registerAuthenticator(enrollmentToken);
      history.replaceState(null, '', location.pathname);
    } else {
      await authenticate('desk');
    }
    showUnlocked();
  } catch (error) {
    showLocked(error instanceof Error ? error.message : 'Could not verify the Principal.');
  } finally {
    authAction.disabled = false;
  }
}

authAction.addEventListener('click', beginAuthentication);
lockAction.addEventListener('click', async () => {
  await logout().catch(() => undefined);
  showLocked('Alarisa is locked.');
});

const enrollmentToken = new URLSearchParams(location.search).get('enrollment');
currentSession()
  .then((session) => {
    if (session.authenticated) showUnlocked();
    else {
      authAction.textContent = enrollmentToken ? 'Trust this device' : 'Sign in with a passkey';
      showLocked(enrollmentToken ? 'Register a passkey for this device.' : undefined);
    }
  })
  .catch(() => showLocked('Server unavailable.'));

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', {scope: './'});
