"""Builds 404.html (Vercel shows it for any missing address) from trade.html's
head, nav and footer, so it always matches the rest of the site. Links are made
root-relative because the page can appear at any depth, e.g. /wines/old-wine.html.
Run after changing the nav or footer:  python3 tools/make-404.py"""
import os, re
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
src = open(os.path.join(root, 'trade.html'), encoding='utf-8').read()

head = src[:src.index('</head>')]
head = re.sub(r'\n\s*<!-- seo \(tools/seo.js\) -->.*?<!-- /seo -->', '', head, flags=re.S)
head = re.sub(r'<title[^>]*>.*?</title>',
              '<title data-i18n="title.404">Page not found · Sunnyside Vines</title>\n    <meta name="robots" content="noindex">', head)
nav = src[src.index('    <nav class="nav"'):src.index('</nav>', src.index('    <nav class="nav"')) + len('</nav>')]
nav = nav.replace(' aria-current="page"', '')
footer = src[src.index('    <footer class="footer">'):src.index('</footer>') + len('</footer>')]

main = '''    <main class="shop-main notfound">
        <div class="wrap">
            <h1 class="shop-title" data-i18n="404.title">This page isn’t here</h1>
            <p class="notfound-copy" data-i18n="404.copy">The link may be old, or the wine may have moved on. Try one of these instead.</p>
            <div class="notfound-actions">
                <a class="btn" href="shop.html" data-i18n="404.shop">Shop wines</a>
                <a class="btn ghost-dark" href="trade.html" data-i18n="404.trade">Trade orders</a>
                <a class="notfound-home" href="index.html" data-i18n="404.home">Back to the homepage →</a>
            </div>
        </div>
    </main>'''

scripts = '''    <script src="js/newsletter.js"></script>
    <script src="js/i18n.js"></script>
    <script>
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');
        toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
    </script>'''

page = head + '</head>\n<body class="shop-page notfound-page">\n' + nav + '\n\n' + main + '\n\n' + footer + '\n\n' + scripts + '\n</body>\n</html>\n'
# root-relative links and assets (leave http(s), mailto, tel, # and data: alone)
page = re.sub(r'(\s(?:href|src))="(?!https?:|mailto:|tel:|#|data:|/)([^"]+)"', r'\1="/\2"', page)
open(os.path.join(root, '404.html'), 'w', encoding='utf-8').write(page)
print('wrote 404.html')
