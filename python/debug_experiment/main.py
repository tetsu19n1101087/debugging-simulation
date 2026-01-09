from book import Book
from member import Member
from library import Library

library = Library(max_borrowed_books=3)

# 本の追加
book1 = Book("The Hitchhiker's Guide to the Galaxy", "Douglas Adams", "978-0345391803")
book2 = Book("Pride and Prejudice", "Jane Austen", "978-0141439518")
book3 = Book("1984", "George Orwell", "978-0451524935")
book4 = Book("To Kill a Mockingbird", "Harper Lee", "978-0061120084")
book5 = Book("The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565")
library.add_book([book1, book2, book3, book4, book5])

# 会員の追加
member1 = Member("Alice")
library.add_member(member1)
member2 = Member("Bob")
library.add_member(member2)

# 本の貸出
library.borrow_book(member1.member_id, [book1.isbn, book2.isbn, book3.isbn])
library.borrow_book(member2.member_id, [book4.isbn])

# 本の返却
library.return_book(member1.member_id, [book1.isbn])

# 本の削除
library.remove_book([book5.isbn])
