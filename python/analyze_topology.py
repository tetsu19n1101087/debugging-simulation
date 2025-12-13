import csv
import json


def create_detailed_matrix():
    """Build nodes, labeled edges, and adjacency matrix for topology."""
    nodes = {
        "Book",
        "Book.__init__",
        "Book.__del__",
        "Book.__str__",
        "Member",
        "Member.__init__",
        "Member.__str__",
        "Member._random_id",
        "Library",
        "Library.__init__",
        "Library.add_book",
        "Library.remove_book",
        "Library.add_member",
        "Library.remove_member",
        "Library.borrow_book",
        "Library.return_book",
        "main",
    }

    # Each edge: (source, target, label)
    edges = [
        # Class → methods (label = method definition line)
        ("Book", "Book.__init__", "def __init__(self, title, author, isbn):"),
        ("Book", "Book.__del__", "def __del__(self):"),
        ("Book", "Book.__str__", "def __str__(self):"),
        ("Member", "Member.__init__", "def __init__(self, name):"),
        ("Member", "Member.__str__", "def __str__(self):"),
        ("Member", "Member._random_id", "def _random_id(length=10):"),
        ("Library", "Library.__init__", "def __init__(self, max_borrowed_books=3):"),
        ("Library", "Library.add_book", "def add_book(self, books):"),
        ("Library", "Library.remove_book", "def remove_book(self, isbns):"),
        ("Library", "Library.add_member", "def add_member(self, member):"),
        ("Library", "Library.remove_member", "def remove_member(self, member_id):"),
        ("Library", "Library.borrow_book", "def borrow_book(self, member_id, isbns):"),
        ("Library", "Library.return_book", "def return_book(self, member_id, isbns):"),
        # main.py → classes (labels: instantiation / calls)
        (
            "main",
            "Book",
            [
                'book1 = Book("The Hitchhiker\'s Guide to the Galaxy", "Douglas Adams", "978-0345391803")',
                'book2 = Book("Pride and Prejudice", "Jane Austen", "978-0141439518")',
                'book3 = Book("1984", "George Orwell", "978-0451524935")',
                'book4 = Book("To Kill a Mockingbird", "Harper Lee", "978-0061120084")',
                'book5 = Book("The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565")',
            ],
        ),
        (
            "main",
            "Member",
            [
                'member1 = Member("Alice")',
                'member2 = Member("Bob")',
            ],
        ),
        (
            "main",
            "Library",
            [
                "library = Library(max_borrowed_books=3)",
                "library.add_book([book1, book2, book3, book4, book5])",
                "library.add_member(member1)",
                "library.add_member(member2)",
                "library.borrow_book(member1.member_id, [book1.isbn, book2.isbn, book3.isbn])",
                "library.borrow_book(member2.member_id, [book4.isbn])",
                "library.return_book(member1.member_id, [book1.isbn])",
                "library.remove_book([book5.isbn])",
            ],
        ),
        # Book internals
        ("Book.__init__", "Book", "Book._isbn_registry.add(normalized)"),
        ("Book.__del__", "Book", "Book._isbn_registry.discard(self.isbn)"),
        # Member internals
        ("Member.__init__", "Member._random_id", "Member._random_id()"),
        # Library method references
        ("Library.add_book", "Book", "self.books[book.isbn] = book"),
        ("Library.remove_book", "Book", "if isbn not in self.books"),
        ("Library.remove_book", "Book", "if self.books[isbn].is_borrowed"),
        ("Library.remove_book", "Book", "del self.books[isbn]"),
        ("Library.add_member", "Member", "self.members[member.member_id] = member"),
        ("Library.remove_member", "Member", "if self.members[member_id].borrowed_books:"),
        ("Library.borrow_book", "Book", "if i not in self.books"),
        ("Library.borrow_book", "Book", "if self.books[i].is_borrowed"),
        ("Library.borrow_book", "Book", "book = self.books[i]"),
        ("Library.borrow_book", "Member", "member = self.members[member_id]"),
        ("Library.borrow_book", "Member", "member.borrowed_books.append(book)"),
        ("Library.return_book", "Book", "book = self.books[i]"),
        ("Library.return_book", "Book", "book.is_borrowed = False"),
        ("Library.return_book", "Member", "member = self.members[member_id]"),
        ("Library.return_book", "Member", "member.borrowed_books.remove(book)"),
    ]

    sorted_nodes = sorted(nodes)
    size = len(sorted_nodes)
    matrix = [[0] * size for _ in range(size)]
    node_to_index = {node: i for i, node in enumerate(sorted_nodes)}

    for source, target, _label in edges:
        if source in node_to_index and target in node_to_index:
            matrix[node_to_index[source]][node_to_index[target]] = 1

    with open("topology_matrix.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([""] + sorted_nodes)
        for i, row in enumerate(matrix):
            writer.writerow([sorted_nodes[i]] + row)

    with open("topology_nodes.json", "w", encoding="utf-8") as f:
        json.dump(sorted_nodes, f, indent=2, ensure_ascii=False)

    with open("topology_edges.json", "w", encoding="utf-8") as f:
        json.dump(edges, f, indent=2, ensure_ascii=False)

    print("トポロジー行列を作成しました:")
    print(f"- ノード数: {len(sorted_nodes)}")
    print(f"- エッジ数: {len(edges)}")
    print("- ファイル: topology_matrix.csv, topology_nodes.json, topology_edges.json")

    return sorted_nodes, matrix


if __name__ == "__main__":
    create_detailed_matrix()
