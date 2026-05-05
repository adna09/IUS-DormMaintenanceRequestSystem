import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { getApiScopes } from "./msalConfig";
import { msalInstance } from "./msalInstance";

export async function getAzureAccessToken() {
  const scopes = getApiScopes();
  if (scopes.length === 0) return null;

  const account =
    msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) return null;

  try {
    const result = await msalInstance.acquireTokenSilent({
      scopes,
      account,
    });
    return result.accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect({
        scopes,
        account,
      });
      return null;
    }
    console.error(e);
    return null;
  }
}

export async function signOutAzure() {
  const account =
    msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (account) {
    await msalInstance.logoutRedirect({ account });
  }
}
