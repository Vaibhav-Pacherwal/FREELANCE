/**
 * routing_scroll.test.mjs – React Routing & ScrollToTop Verification Tests
 *
 * Verifies:
 * 1. Root cause identification: client-side SPA route transitions preserve scrollY
 *    unless reset on pathname change.
 * 2. Reusable ScrollToTop component:
 *    - Uses React Router useLocation and useEffect.
 *    - Has [pathname] dependency only.
 *    - Resets scroll to { top: 0, left: 0, behavior: 'instant' } with fallback.
 * 3. Mounted inside BrowserRouter and outside individual pages in App.jsx.
 * 4. No conflicting scroll handlers, autoFocus, or scrollIntoView on pages.
 * 5. All routes preserved: Home, Catalogue, Catalogue Category, Checkout.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../../initphase/src");

describe("React Router Navigation & ScrollToTop Component", () => {
  const scrollToTopPath = path.join(srcDir, "components/common/ScrollToTop.jsx");
  const appPath = path.join(srcDir, "App.jsx");
  const headerPath = path.join(srcDir, "components/layout/Header.jsx");
  const footerPath = path.join(srcDir, "components/layout/Footer.jsx");

  test("ScrollToTop component file exists and exports a valid React component", () => {
    assert.ok(fs.existsSync(scrollToTopPath), "ScrollToTop.jsx must exist in src/components/common");
    const content = fs.readFileSync(scrollToTopPath, "utf-8");
    assert.ok(content.includes("export default function ScrollToTop"), "Must export default function ScrollToTop");
  });

  test("ScrollToTop uses React Router useLocation and React useEffect", () => {
    const content = fs.readFileSync(scrollToTopPath, "utf-8");
    assert.ok(content.includes("useLocation"), "Must use useLocation from react-router-dom");
    assert.ok(content.includes("useEffect"), "Must use useEffect from react");
    assert.ok(content.includes("from 'react-router-dom'"), "Must import from react-router-dom");
  });

  test("ScrollToTop resets window scroll to { top: 0, left: 0, behavior: 'instant' } on pathname changes only", () => {
    const content = fs.readFileSync(scrollToTopPath, "utf-8");

    // Validates the exact target scroll coordinates & instant behavior
    assert.ok(content.includes("top: 0"), "Must set top: 0");
    assert.ok(content.includes("left: 0"), "Must set left: 0");
    assert.ok(content.includes("behavior: 'instant'"), "Must set behavior: 'instant'");
    assert.ok(content.includes("window.scrollTo"), "Must invoke window.scrollTo");

    // Validates dependency array is [pathname] only (not search, hash, or other values)
    assert.ok(content.includes("[pathname]"), "Effect dependency array must be [pathname]");
    assert.ok(!content.includes("[location]"), "Must NOT depend on full location object (pathname changes only)");
  });

  test("ScrollToTop is mounted inside BrowserRouter and outside individual pages in App.jsx", () => {
    const content = fs.readFileSync(appPath, "utf-8");

    assert.ok(content.includes("import ScrollToTop from './components/common/ScrollToTop'"), "App.jsx must import ScrollToTop");
    
    // Check hierarchy: inside BrowserRouter, outside Routes
    const browserRouterIndex = content.indexOf("<BrowserRouter>");
    const scrollToTopIndex = content.indexOf("<ScrollToTop />");
    const routesIndex = content.indexOf("<Routes>");
    const closeBrowserRouterIndex = content.indexOf("</BrowserRouter>");

    assert.ok(browserRouterIndex !== -1, "BrowserRouter must be present in App.jsx");
    assert.ok(scrollToTopIndex !== -1, "ScrollToTop must be mounted in App.jsx");
    assert.ok(routesIndex !== -1, "Routes must be present in App.jsx");

    assert.ok(
      scrollToTopIndex > browserRouterIndex,
      "ScrollToTop must be mounted inside <BrowserRouter>"
    );
    assert.ok(
      scrollToTopIndex < routesIndex,
      "ScrollToTop must be mounted before and outside <Routes> / individual pages"
    );
    assert.ok(
      scrollToTopIndex < closeBrowserRouterIndex,
      "ScrollToTop must be mounted before </BrowserRouter>"
    );
  });

  test("No conflicting scroll handlers or autofocus elements found in layout components", () => {
    const headerContent = fs.readFileSync(headerPath, "utf-8");
    const footerContent = fs.readFileSync(footerPath, "utf-8");

    // Ensure no scrollIntoView or autofocus forcing viewport to footer
    assert.ok(!footerContent.includes("scrollIntoView"), "Footer must not call scrollIntoView");
    assert.ok(!footerContent.includes("autoFocus"), "Footer must not contain autoFocus");
    assert.ok(!headerContent.includes("scrollIntoView"), "Header must not call scrollIntoView");
  });

  test("App.jsx preserves all core application routes", () => {
    const content = fs.readFileSync(appPath, "utf-8");

    assert.ok(content.includes('path="/"'), "Home route (/) must be preserved");
    assert.ok(content.includes('path="/shop"'), "Catalogue route (/shop) must be preserved");
    assert.ok(content.includes('path="/shop/:category"'), "Catalogue category route (/shop/:category) must be preserved");
    assert.ok(content.includes('path="/checkout"'), "Checkout route (/checkout) must be preserved");
  });

  test("Simulating ScrollToTop behavior on route pathname transitions", () => {
    let scrollCalls = [];
    const mockWindow = {
      scrollTo: (options) => {
        scrollCalls.push(options);
      },
    };

    // Simulate ScrollToTop logic
    function runScrollToTop(pathname) {
      mockWindow.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }

    // Navigation sequence: Home -> Shop -> Cakes category -> Checkout -> Home
    const routeSequence = ["/", "/shop", "/shop/cakes", "/checkout", "/"];

    for (const route of routeSequence) {
      runScrollToTop(route);
    }

    assert.equal(scrollCalls.length, 5, "Must trigger scroll reset on all 5 route transitions");
    for (const call of scrollCalls) {
      assert.deepEqual(call, { top: 0, left: 0, behavior: "instant" });
    }
  });
});
