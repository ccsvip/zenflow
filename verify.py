import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # Intercept login request to delay it
    def delayed_route(route):
        time.sleep(2)
        route.continue_()

    page.route("**/api/auth/login", delayed_route)

    # Click the login button
    page.get_by_role("button", name="登录").click()

    # Take screenshot immediately while request is pending
    page.wait_for_timeout(200)
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")

    # Wait for the mocked delayed request to finish
    page.wait_for_timeout(2500)

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
