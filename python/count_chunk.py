import pandas as pd
import numpy as np
from pathlib import Path
import re


def count_chunks(code_lines):
    """
    コード行リストをトークンに分割してチャンク数をカウントする
    文字列は全体で1とカウント
    """
    # コードを1つの文字列に結合
    code = "\n".join(code_lines)

    # 文字列（シングルクォートまたはダブルクォート）を1つのトークンに置換
    # f-stringも含める
    code_with_tokens = re.sub(r'f?"[^"]*"', " STRING ", code)
    code_with_tokens = re.sub(r"f?'[^']*'", " STRING ", code_with_tokens)

    # 記号で分割（括弧、ドット、括弧内の等号など）
    # 記号の前後にスペースを挿入
    code_with_spaces = re.sub(r"([(){}\[\].,=:@])", r" \1 ", code_with_tokens)

    # トークンに分割（スペースと改行で）
    tokens = code_with_spaces.split()

    # 空でないトークンをカウント
    return len([t for t in tokens if t.strip()])


# チャンク数の計算（python-files.tsの構造から）
# クラスノードはメソッド数、メソッドノードはトークン数、mainは行数
chunk_counts = {
    "Book": 3,  # メソッド数: __init__, __del__, __str__
    "Book.__init__": count_chunks(
        [
            "    if isbn in Book._isbn_registry:",
            "        raise ValueError(f\"ISBN '{isbn}' は既に登録されています\")",
            "",
            "    self.title = title",
            "    self.author = author",
            "    self.isbn = isbn",
            "    self.is_borrowed = False",
            "",
            '    normalized = isbn.replace("-", "")',
            "    Book._isbn_registry.add(normalized)",
        ]
    ),
    "Book.__del__": count_chunks(
        [
            "    try:",
            "        Book._isbn_registry.discard(self.isbn)",
            "    except Exception:",
            "        pass",
        ]
    ),
    "Book.__str__": count_chunks(
        [
            "    return f\"'{self.title}' by {self.author} (ISBN: {self.isbn}) - {'Borrowed' if self.is_borrowed else 'Available'}\"",
        ]
    ),
    "Library": 7,  # メソッド数: __init__, add_book, remove_book, add_member, remove_member, borrow_book, return_book
    "Library.__init__": count_chunks(
        [
            "    self.books = {}",
            "    self.members = {}",
            "    self.MAX_BORROWED_BOOKS = max_borrowed_books",
        ]
    ),
    "Library.add_book": count_chunks(
        [
            "    for book in books:",
            "        self.books[book.isbn] = book",
            '    return "All requested books added successfully."',
        ]
    ),
    "Library.add_member": count_chunks(
        [
            "    if member.member_id in self.members:",
            '        return "Error: Member with this ID already exists."',
            "    self.members[member.member_id] = member",
            "    return f\"Member '{member.name}' added.\"",
        ]
    ),
    "Library.borrow_book": count_chunks(
        [
            "    if member_id not in self.members:",
            '        return "Error: Member not found."',
            "",
            "    member = self.members[member_id]",
            "",
            "    for i in isbns:",
            "        if i not in self.books:",
            '            return f"Error: Book with ISBN {i} not found."',
            "        if self.books[i].is_borrowed:",
            '            return f"Error: Book with ISBN {i} is already borrowed."',
            "",
            "    for i in isbns:",
            "        book = self.books[i]",
            "",
            "        if len(member.borrowed_books) > self.MAX_BORROWED_BOOKS:",
            '            return "Error: Member has reached the maximum borrowing limit."',
            "",
            "        book.is_borrowed = True",
            "        member.borrowed_books.append(book)",
            "",
            '    return "All requested books borrowed successfully."',
        ]
    ),
    "Library.remove_book": count_chunks(
        [
            "    failed_isbns = []",
            "",
            "    for isbn in isbns:",
            "        if isbn not in self.books:",
            "            failed_isbns.append(isbn)",
            "            continue",
            "        if self.books[isbn].is_borrowed:",
            "            failed_isbns.append(isbn)",
            "            continue",
            "        del self.books[isbn]",
            "",
            "    if failed_isbns:",
            '        return f"Failed to remove ISBNs: {failed_isbns}"',
            "",
            '    return "All requested books removed successfully."',
        ]
    ),
    "Library.remove_member": count_chunks(
        [
            "    if member_id not in self.members:",
            '        return "Error: Member not found."',
            "",
            "    if self.members[member_id].borrowed_books:",
            '        return "Error: Cannot remove member with borrowed books."',
            "",
            "    del self.members[member_id]",
            '    return "Member removed successfully."',
        ]
    ),
    "Library.return_book": count_chunks(
        [
            "    if member_id not in self.members:",
            '        return "Error: Member not found."',
            "",
            "    member = self.members[member_id]",
            "",
            "    for i in isbns:",
            "        if i not in self.books:",
            '            return f"Error: Book with ISBN {i} not found."',
            "",
            "        book = self.books[i]",
            "",
            "        if book in member.borrowed_books:",
            "            member.borrowed_books.remove(book)",
            "        book.is_borrowed = False",
            "",
            '    return "All requested books returned successfully."',
        ]
    ),
    "Member": 3,  # メソッド数: __init__, __str__, _random_id
    "Member.__init__": count_chunks(
        [
            "    self.name = name",
            "    self.member_id = Member._random_id()",
            "    self.borrowed_books = []",
        ]
    ),
    "Member.__str__": count_chunks(['    return f"Member: {self.name} (ID: {self.member_id})"']),
    "Member._random_id": count_chunks(
        [
            "    # ランダムなIDの生成",
            "    chars = string.ascii_letters + string.digits",
            '    return "".join(random.choice(chars) for _ in range(length))',
        ]
    ),
    "main": len(
        [
            "library = Library(max_borrowed_books=3)",
            "",
            "# 本の追加",
            'book1 = Book("The Hitchhiker\'s Guide to the Galaxy", "Douglas Adams", "978-0345391803")',
            'book2 = Book("Pride and Prejudice", "Jane Austen", "978-0141439518")',
            'book3 = Book("1984", "George Orwell", "978-0451524935")',
            'book4 = Book("To Kill a Mockingbird", "Harper Lee", "978-0061120084")',
            'book5 = Book("The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565")',
            "library.add_book([book1, book2, book3, book4, book5])",
            "",
            "# 会員の追加",
            'member1 = Member("Alice")',
            "library.add_member(member1)",
            'member2 = Member("Bob")',
            "library.add_member(member2)",
            "",
            "# 本の貸出",
            "library.borrow_book(member1.member_id, [book1.isbn, book2.isbn, book3.isbn])",
            "library.borrow_book(member2.member_id, [book4.isbn])",
            "",
            "# 本の返却",
            "library.return_book(member1.member_id, [book1.isbn])",
            "",
            "# 本の削除",
            "library.remove_book([book5.isbn])",
        ]
    ),  # 行数でカウント
}

# topology_matrix.csvを読み込む
df = pd.read_csv("topology_matrix.csv", index_col=0)
print("元のトポロジーマトリクス:")
print(df)
print("\nノードごとのチャンク数:")
for node, chunks in chunk_counts.items():
    print(f"{node}: {chunks}")

# エッジを重み付けする
# 各エッジ (from, to) に対して、toノードのチャンク数を重みとする
weighted_df = df.copy().astype(float)

for col in weighted_df.columns:
    if col in chunk_counts:
        # colカラムの全ての値にそのノードのチャンク数を掛ける
        weighted_df[col] = weighted_df[col] * chunk_counts[col]

print("\n\nチャンク数で重み付けされたトポロジーマトリクス:")
print(weighted_df)

# CSVに保存
output_path = "topology_matrix_chunk_weighted.csv"
weighted_df.to_csv(output_path)
print(f"\n保存完了: {output_path}")

# 統計情報を出力
print("\n=== 統計情報 ===")
print(f"総チャンク数: {sum(chunk_counts.values())}")
print(f"\nチャンク数の分布:")
chunk_stats = pd.Series(chunk_counts)
print(chunk_stats.describe())
