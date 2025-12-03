class Library:
    def __init__(self, max_borrowed_books=3):
        self.books = {}
        self.members = {}
        self.MAX_BORROWED_BOOKS = max_borrowed_books

    def add_book(self, books):
        for book in books:
            self.books[book.isbn] = book
        return "All requested books added successfully."

    def remove_book(self, isbns):
        failed_isbns = []

        for isbn in isbns:
            if isbn not in self.books:
                failed_isbns.append(isbn)
                continue
            if self.books[isbn].is_borrowed:
                failed_isbns.append(isbn)
                continue
            del self.books[isbn]

        if failed_isbns:
            return f"Failed to remove ISBNs: {failed_isbns}"

        return "All requested books removed successfully."

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

    def borrow_book(self, member_id, isbns):
        if member_id not in self.members:
            return "Error: Member not found."

        member = self.members[member_id]

        for i in isbns:
            if i not in self.books:
                return f"Error: Book with ISBN {i} not found."
            
            if self.books[i].is_borrowed:
                return f"Error: Book with ISBN {i} is already borrowed."

        for i in isbns:
            book = self.books[i]

            if len(member.borrowed_books) > self.MAX_BORROWED_BOOKS:
                return "Error: Member has reached the maximum borrowing limit."

            book.is_borrowed = True
            member.borrowed_books.append(book)

        return "All requested books borrowed successfully."

    def return_book(self, member_id, isbns):
        if member_id not in self.members:
            return "Error: Member not found."

        member = self.members[member_id]

        for i in isbns:
            if i not in self.books:
                return f"Error: Book with ISBN {i} not found."

            book = self.books[i]

            if book in member.borrowed_books:
                member.borrowed_books.remove(book)
            book.is_borrowed = False

        return "All requested books returned successfully."
