class Book:
    _isbn_registry = set()

    def __init__(self, title, author, isbn):
        if isbn in Book._isbn_registry:
            raise ValueError(f"ISBN '{isbn}' は既に登録されています")

        self.title = title
        self.author = author
        self.isbn = isbn
        self.is_borrowed = False

        normalized = isbn.replace("-", "")
        Book._isbn_registry.add(normalized)

    def __del__(self):
        try:
            Book._isbn_registry.discard(self.isbn)
        except Exception:
            pass

    def __str__(self):
        return (
            f"'{self.title}' by {self.author} (ISBN: {self.isbn}) - {'Borrowed' if self.is_borrowed else 'Available'}"
        )
