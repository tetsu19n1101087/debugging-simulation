### オリジナルコード

```py
class Book:
  def __init__(self, title, author, isbn):
    self.title = title
    self.author = author
    self.isbn = isbn
    self.is_borrowed = False

  def __str__(self):
    return f"'{self.title}' by {self.author} (ISBN: {self.isbn}) - {'Borrowed' if self.is_borrowed else 'Available'}"

class Member:
  def __init__(self, name, member_id):
    self.name = name
    self.member_id = member_id
    self.borrowed_books = []

  def __str__(self):
    return f"Member: {self.name} (ID: {self.member_id})"

class Library:
  def __init__(self):
    self.books = {}  # ISBNをキーとしてBookオブジェクトを格納
    self.members = {} # member_idをキーとしてMemberオブジェクトを格納
    self.MAX_BORROWED_BOOKS = 3 # 会員が借りられる本の最大数

  def add_book(self, book):
    # 意図的な論理エラー3: 同じISBNの本の重複チェックが不十分
    # 正しい挙動: if book.isbn in self.books: return "Error: Book with this ISBN already exists."
    self.books[book.isbn] = book
    return f"Book '{book.title}' added to the library."

  def remove_book(self, isbn):
    if isbn not in self.books:
      return "Error: Book not found."
    if self.books[isbn].is_borrowed:
      return "Error: Cannot remove a borrowed book."
    del self.books[isbn]
    return "Book removed successfully."

  def add_member(self, member):
    if member.member_id in self.members:
      return "Error: Member with this ID already exists."
    self.members[member.member_id] = member
    return f"Member '{member.name}' added."

  def remove_member(self, member_id):
    if member_id not in self.members:
      return "Error: Member not found."
    if self.members[member_id].borrowed_books:
      return "Error: Cannot remove member with borrowed books."
    del self.members[member_id]
    return "Member removed successfully."

  def borrow_book(self, member_id, isbn):
    if member_id not in self.members:
      return "Error: Member not found."
    if isbn not in self.books:
      return "Error: Book not found."

    book = self.books[isbn]
    member = self.members[member_id]

    if book.is_borrowed:
      return "Error: Book is already borrowed."

    # 意図的な論理エラー1: 貸出上限のチェックが正しく機能していない
    # 正しい挙動: if len(member.borrowed_books) >= self.MAX_BORROWED_BOOKS: return "Error: Member has reached the maximum borrowing limit."
    if len(member.borrowed_books) > self.MAX_BORROWED_BOOKS: # ここを >= にすべき
      return "Error: Member has reached the maximum borrowing limit."

    book.is_borrowed = True
    member.borrowed_books.append(book)
    return f"Book '{book.title}' borrowed by {member.name}."

  def return_book(self, member_id, isbn):
    if member_id not in self.members:
      return "Error: Member not found."
    if isbn not in self.books:
      return "Error: Book not found."

    book = self.books[isbn]
    member = self.members[member_id]

    if not book.is_borrowed:
      return "Error: Book is not currently borrowed."

    # 意図的な論理エラー2: 本がその会員によって借りられているかの確認が不十分
    # 正しい挙動: if book not in member.borrowed_books: return "Error: This book was not borrowed by this member."
    # ここでは、単純に借りていることになっている本を返却しようとすると
    # member.borrowed_booksから削除しようとするが、実際にはその本がmember.borrowed_booksに
    # 含まれていない可能性があるため、エラーになるか、予期せぬ動作を引き起こす
    if book in member.borrowed_books: # このチェックがないと、他の人が借りた本も返せてしまう可能性がある
      member.borrowed_books.remove(book)
      book.is_borrowed = False
      return f"Book '{book.title}' returned by {member.name}."
    else:
      return "Error: This book was not borrowed by this member or an internal error occurred."


  def get_available_books(self):
    return [book for book in self.books.values() if not book.is_borrowed]

  def get_borrowed_books_by_member(self, member_id):
    if member_id not in self.members:
      return "Error: Member not found."
    return self.members[member_id].borrowed_books

  def display_all_books(self):
    if not self.books:
      print("No books in the library.")
      return
    print("\n--- All Books ---")
    for book in self.books.values():
      print(book)

  def display_all_members(self):
    if not self.members:
      print("No members in the library.")
      return
    print("\n--- All Members ---")
    for member in self.members.values():
      print(member)
      if member.borrowed_books:
        print("  Borrowed Books:")
        for book in member.borrowed_books:
          print(f"  - '{book.title}'")
      else:
        print("  No books borrowed.")

# --- テストコード ---
if __name__ == "__main__":
  library = Library()

  # 本の追加
  book1 = Book("The Hitchhiker's Guide to the Galaxy", "Douglas Adams", "978-0345391803")
  book2 = Book("Pride and Prejudice", "Jane Austen", "978-0141439518")
  book3 = Book("1984", "George Orwell", "978-0451524935")
  book4 = Book("To Kill a Mockingbird", "Harper Lee", "978-0061120084")
  book5 = Book("The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565")

  print(library.add_book(book1))
  print(library.add_book(book2))
  print(library.add_book(book3))
  print(library.add_book(book4))
  print(library.add_book(book5))
  # 論理エラー3のテスト: 同じISBNの本を再度追加
  print(library.add_book(Book("Duplicate Book 1", "Author X", "978-0345391803"))) # book1と同じISBN

  # 会員の追加
  member1 = Member("Alice", "M001")
  member2 = Member("Bob", "M002")

  print(library.add_member(member1))
  print(library.add_member(member2))

  library.display_all_books()
  library.display_all_members()

  print("\n--- 貸出テスト ---")
  print(library.borrow_book("M001", "978-0345391803")) # Aliceが本1を借りる
  print(library.borrow_book("M001", "978-0141439518")) # Aliceが本2を借りる
  print(library.borrow_book("M001", "978-0451524935")) # Aliceが本3を借りる

  # 論理エラー1のテスト: 貸出上限を超えて借りられるか
  print(library.borrow_book("M001", "978-0061120084")) # Aliceが本4を借りる (上限を超えているはずだが借りれてしまう)

  print(library.borrow_book("M002", "978-0743273565")) # Bobが本5を借りる

  library.display_all_members()
  library.display_all_books()

  # print("\n--- 返却テスト ---")
  print(library.return_book("M001", "978-0345391803")) # Aliceが本1を返却

  # 論理エラー2のテスト: Aliceが借りていない本（Bobが借りている本5）を返却しようとする
  print(library.return_book("M001", "978-0743273565")) # エラーが返されるべきだが、現在のコードでは返せない
  print(library.return_book("M002", "978-0743273565")) # Bobが本5を返却

  library.display_all_members()
  library.display_all_books()

  print("\n--- その他の操作 ---")
  print(library.remove_book("978-0451524935")) # 借りられている本は削除できないはず
  print(library.remove_book("INVALID_ISBN")) # 存在しない本
  print(library.remove_book("978-0061120084")) # 本4を削除（Aliceはまだ借りている状態だが、実際にはエラー）

  library.display_all_books()
```