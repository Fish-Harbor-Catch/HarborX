import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let vite, LoginPage, RegisterPage, LanguageProvider;
before(async () => {
  // Transform the real JSX with the project's existing Vite tooling.
  vite = await createServer({
    root: fileURLToPath(new URL("../", import.meta.url)),
    configFile: false,
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true },
  });
  ({ default: LoginPage } = await vite.ssrLoadModule(
    "/src/features/auth/LoginPage.jsx",
  ));
  ({ default: RegisterPage } = await vite.ssrLoadModule(
    "/src/features/auth/RegisterPage.jsx",
  ));
  ({ LanguageProvider } = await vite.ssrLoadModule("/src/i18n.jsx"));
});
after(async () => {
  await vite?.close();
});

function render(Page, props = {}) {
  return renderToStaticMarkup(
    React.createElement(
      LanguageProvider,
      null,
      React.createElement(Page, {
        email: "member@example.com",
        password: "ExistingPassword2026!",
        role: "buyer",
        ...props,
      }),
    ),
  );
}

test("LoginPage renders sign-in fields without registration-only fields", () => {
  const html = render(LoginPage);
  assert.match(html, /Sign in to HarborX/);
  assert.match(html, /value="member@example.com"/);
  assert.match(html, /type="password"/);
  assert.match(html, /minLength="1"/);
  assert.match(html, /autoComplete="current-password"/);
  assert.match(html, /New to HarborX\?/);
  assert.doesNotMatch(html, /name="name"|name="phone"|role="radiogroup"/);
});

test("RegisterPage defaults to buyer with existing validation and verification notice", () => {
  const html = render(RegisterPage);
  assert.match(html, /Create your account/);
  assert.match(
    html,
    /<input(?=[^>]*name="name")(?=[^>]*required="")(?=[^>]*minLength="2")[^>]*>/,
  );
  assert.match(html, /name="role" value="buyer"/);
  assert.match(html, /<input(?=[^>]*name="phone")(?=[^>]*type="tel")[^>]*>/);
  assert.match(html, /minLength="12"/);
  assert.match(html, /maxLength="128"/);
  assert.match(html, /autoComplete="new-password"/);
  assert.match(html, /Buyers need manager verification before placing bids/);
  assert.match(html, /Already have an account\?/);
  assert.doesNotMatch(html, /name="boat_name"/);
});

test("RegisterPage exposes boat details only for sellers and keeps exactly two roles", () => {
  const html = render(RegisterPage, { role: "seller" });
  assert.match(html, /name="role" value="seller"/);
  assert.match(html, /name="boat_name"/);
  assert.equal((html.match(/role="radio"/g) || []).length, 2);
  assert.equal((html.match(/aria-checked="true"/g) || []).length, 1);
});
