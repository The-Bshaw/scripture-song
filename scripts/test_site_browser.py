from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
url='http://127.0.0.1:8765/index.html'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1365,'height':950},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(url,wait_until='domcontentloaded')
    page.locator('.song').first.wait_for(timeout=15000)
    print('Default results:',page.locator('.song').count(),'first:',page.locator('.song h3').first.inner_text())
    assert page.locator('.match-explanation').count()>0
    input=page.locator('#passages')
    input.fill('John 15:4-5')
    page.locator('#searchForm button[type=submit]').click()
    page.locator('.song h3').first.wait_for()
    print('John 15:4-5 top:',page.locator('.song h3').first.inner_text())
    assert 'Abide' in page.locator('.song h3').first.inner_text()
    page.screenshot(path=str(Path('/mnt/data/Scripture-and-Song-V3-9-0-preview.png')),full_page=False)
    input.fill('Ephesians 2:11-22')
    page.locator('#searchForm button[type=submit]').click()
    print('Ephesians 2:11-22:',page.locator('.song h3').first.inner_text())
    assert not errors,errors
    browser.close()
