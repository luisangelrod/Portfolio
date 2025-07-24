import os
import unittest
from pathlib import Path
from bs4 import BeautifulSoup


class TestFavicons(unittest.TestCase):
    def test_favicon_paths_exist(self):
        root = Path(__file__).resolve().parents[1]
        index_path = root / 'index.html'
        with index_path.open(encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')

        paths = set()
        for tag in soup.find_all(['link', 'img']):
            href = tag.get('href')
            src = tag.get('src')
            for attr in (href, src):
                if attr and 'favicon' in attr:
                    paths.add(attr)
        self.assertTrue(paths, 'No favicon paths found in index.html')
        for rel_path in paths:
            path = root / rel_path
            with self.subTest(path=str(path)):
                self.assertTrue(path.exists(), f"Missing file: {rel_path}")


if __name__ == '__main__':
    unittest.main()
