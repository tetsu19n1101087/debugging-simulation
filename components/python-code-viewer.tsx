"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { PythonSyntaxHighlighter } from "./syntax-highlighter"

const pythonFiles = [
  {
    fileName: "book.py",
    imports: [],
    classes: [
      {
        id: "book-class-1",
        name: "Book",
        signature: "class Book:",
        methods: [
          {
            id: "book-method-1",
            name: "__init__",
            signature: "def __init__(self, title, author, isbn):",
            body: [
              "    self.title = title",
              "    self.author = author",
              "    self.isbn = isbn",
              "    self.is_borrowed = False",
            ],
          },
          {
            id: "book-method-2",
            name: "__str__",
            signature: "def __str__(self):",
            body: [
              "    return f\"'{self.title}' by {self.author} (ISBN: {self.isbn}) - {'Borrowed' if self.is_borrowed else 'Available'}\"",
            ],
          },
        ],
      },
    ],
    functions: [],
    footer: [],
  },
  {
    fileName: "member.py",
    imports: [],
    classes: [
      {
        id: "member-class-1",
        name: "Member",
        signature: "class Member:",
        methods: [
          {
            id: "member-method-1",
            name: "__init__",
            signature: "def __init__(self, name, member_id):",
            body: ["    self.name = name", "    self.member_id = member_id", "    self.borrowed_books = []"],
          },
          {
            id: "member-method-2",
            name: "__str__",
            signature: "def __str__(self):",
            body: ['    return f"Member: {self.name} (ID: {self.member_id})"'],
          },
        ],
      },
    ],
    functions: [],
    footer: [],
  },
  {
    fileName: "library.py",
    imports: [],
    classes: [
      {
        id: "library-class-1",
        name: "Library",
        signature: "class Library:",
        methods: [
          {
            id: "library-method-1",
            name: "__init__",
            signature: "def __init__(self):",
            body: [
              "    self.books = {}  # ISBNをキーとしてBookオブジェクトを格納",
              "    self.members = {}  # member_idをキーとしてMemberオブジェクトを格納",
              "    self.MAX_BORROWED_BOOKS = 3  # 会員が借りられる本の最大数",
            ],
          },
          {
            id: "library-method-2",
            name: "add_book",
            signature: "def add_book(self, book):",
            body: [
              "    # 意図的な論理エラー1: 同じISBNの本の重複チェックが不十分",
              '    # 正しい挙動: if book.isbn in self.books: return "Error: Book with this ISBN already exists."',
              "    self.books[book.isbn] = book",
              "    return f\"Book '{book.title}' added to the library.\"",
            ],
          },
          {
            id: "library-method-3",
            name: "remove_book",
            signature: "def remove_book(self, isbn):",
            body: [
              "    if isbn not in self.books:",
              '        return "Error: Book not found."',
              "    if self.books[isbn].is_borrowed:",
              '        return "Error: Cannot remove a borrowed book."',
              "    del self.books[isbn]",
              '    return "Book removed successfully."',
            ],
          },
          {
            id: "library-method-4",
            name: "add_member",
            signature: "def add_member(self, member):",
            body: [
              "    if member.member_id in self.members:",
              '        return "Error: Member with this ID already exists."',
              "    self.members[member.member_id] = member",
              "    return f\"Member '{member.name}' added.\"",
            ],
          },
          {
            id: "library-method-5",
            name: "remove_member",
            signature: "def remove_member(self, member_id):",
            body: [
              "    if member_id not in self.members:",
              '        return "Error: Member not found."',
              "    if self.members[member_id].borrowed_books:",
              '        return "Error: Cannot remove member with borrowed books."',
              "    del self.members[member_id]",
              '    return "Member removed successfully."',
            ],
          },
          {
            id: "library-method-6",
            name: "borrow_book",
            signature: "def borrow_book(self, member_id, isbn):",
            body: [
              "    if member_id not in self.members:",
              '        return "Error: Member not found."',
              "    if isbn not in self.books:",
              '        return "Error: Book not found."',
              "",
              "    book = self.books[isbn]",
              "    member = self.members[member_id]",
              "",
              "    if book.is_borrowed:",
              '        return "Error: Book is already borrowed."',
              "",
              "    # 意図的な論理エラー2: 貸出上限のチェックが正しく機能していない",
              '    # 正しい挙動: if len(member.borrowed_books) >= self.MAX_BORROWED_BOOKS: return "Error: Member has reached the maximum borrowing limit."',
              "    if len(member.borrowed_books) > self.MAX_BORROWED_BOOKS:  # ここを >= にすべき",
              '        return "Error: Member has reached the maximum borrowing limit."',
              "",
              "    book.is_borrowed = True",
              "    member.borrowed_books.append(book)",
              "    return f\"Book '{book.title}' borrowed by {member.name}.\"",
            ],
          },
          {
            id: "library-method-7",
            name: "return_book",
            signature: "def return_book(self, member_id, isbn):",
            body: [
              "    if member_id not in self.members:",
              '        return "Error: Member not found."',
              "    if isbn not in self.books:",
              '        return "Error: Book not found."',
              "",
              "    book = self.books[isbn]",
              "    member = self.members[member_id]",
              "",
              "    if not book.is_borrowed:",
              '        return "Error: Book is not currently borrowed."',
              "",
              "    # 意図的な論理エラー3: 本がその会員によって借りられているかの確認が不十分",
              '    # 正しい挙動: if book not in member.borrowed_books: return "Error: This book was not borrowed by this member."',
              "    if book in member.borrowed_books:",
              "        member.borrowed_books.remove(book)",
              "    book.is_borrowed = False",
              "    return f\"Book '{book.title}' returned by {member.name}.\"",
            ],
          },
          {
            id: "library-method-8",
            name: "get_available_books",
            signature: "def get_available_books(self):",
            body: ["    return [book for book in self.books.values() if not book.is_borrowed]"],
          },
          {
            id: "library-method-9",
            name: "get_borrowed_books_by_member",
            signature: "def get_borrowed_books_by_member(self, member_id):",
            body: [
              "    if member_id not in self.members:",
              '        return "Error: Member not found."',
              "    return self.members[member_id].borrowed_books",
            ],
          },
          {
            id: "library-method-10",
            name: "display_all_books",
            signature: "def display_all_books(self):",
            body: [
              "    if not self.books:",
              '        print("No books in the library.")',
              "        return",
              '    print("\\n--- All Books ---")',
              "    for book in self.books.values():",
              "        print(book)",
            ],
          },
          {
            id: "library-method-11",
            name: "display_all_members",
            signature: "def display_all_members(self):",
            body: [
              "    if not self.members:",
              '        print("No members in the library.")',
              "        return",
              '    print("\\n--- All Members ---")',
              "    for member in self.members.values():",
              "        print(member)",
              "        if member.borrowed_books:",
              '            print("  Borrowed Books:")',
              "            for book in member.borrowed_books:",
              "                print(f\"  - '{book.title}'\")",
              "        else:",
              '            print("  No books borrowed.")',
            ],
          },
        ],
      },
    ],
    functions: [],
    footer: [],
  },
  {
    fileName: "main.py",
    imports: ["from book import Book", "from member import Member", "from library import Library"],
    classes: [],
    functions: [
      {
        id: "main-function-1",
        name: "main",
        signature: "# メインの実行コード",
        body: [
          "library = Library()",
          "",
          "# 本の追加",
          'book1 = Book("The Hitchhiker\'s Guide to the Galaxy", "Douglas Adams", "978-0345391803")',
          "library.add_book(book1)",
          "",
          "# 会員の追加",
          'member1 = Member("Alice", "M001")',
          "library.add_member(member1)",
          "",
          "# 本の貸出",
          'library.borrow_book("M001", "978-0345391803")',
          "",
          "# 本の返却",
          'library.return_book("M001", "978-0345391803")',
        ],
      },
      {
        id: "main-function-2",
        name: "test_code",
        signature: "# --- テストコード ---",
        body: [
          'if __name__ == "__main__":',
          "    library = Library()",
          "",
          "    # 本の追加",
          '    book1 = Book("The Hitchhiker\'s Guide to the Galaxy", "Douglas Adams", "978-0345391803")',
          '    book2 = Book("Pride and Prejudice", "Jane Austen", "978-0141439518")',
          '    book3 = Book("1984", "George Orwell", "978-0451524935")',
          '    book4 = Book("To Kill a Mockingbird", "Harper Lee", "978-0061120084")',
          '    book5 = Book("The Great Gatsby", "F. Scott Fitzgerald", "978-0743273565")',
          "",
          "    print(library.add_book(book1))",
          "    print(library.add_book(book2))",
          "    print(library.add_book(book3))",
          "    print(library.add_book(book4))",
          "    print(library.add_book(book5))",
          "",
          "    # 論理エラー1のテスト: 同じISBNの本を再度追加",
          '    print("\\n--- 重複本の追加テスト ---")',
          '    print(library.add_book(Book("Duplicate Book 1", "Author X", "978-0345391803")))',
          "    library.display_all_books()",
          "",
          "    # 会員の追加",
          '    print("\\n--- 会員追加テスト ---")',
          '    member1 = Member("Alice", "M001")',
          '    member2 = Member("Bob", "M002")',
          "",
          "    print(library.add_member(member1))",
          "    print(library.add_member(member2))",
          "",
          '    print("\\n--- 貸出テスト ---")',
          '    print(library.borrow_book("M001", "978-0345391803"))',
          '    print(library.borrow_book("M001", "978-0141439518"))',
          '    print(library.borrow_book("M001", "978-0451524935"))',
          "",
          "    # 論理エラー2のテスト: 貸出上限を超えて借りられるか",
          '    print(library.borrow_book("M001", "978-0061120084"))',
          "",
          '    print(library.borrow_book("M002", "978-0743273565"))',
          "",
          '    print("\\n--- 返却テスト ---")',
          '    print(library.return_book("M001", "978-0345391803"))',
          "",
          "    # 論理エラー3のテスト",
          '    print(library.return_book("M001", "978-0743273565"))',
          '    print(library.return_book("M002", "978-0743273565"))',
          "",
          '    print("\\n--- その他の操作 ---")',
          '    print(library.remove_book("978-0451524935"))',
          '    print(library.remove_book("INVALID_ISBN"))',
          '    print(library.remove_book("978-0061120084"))',
        ],
      },
    ],
    footer: [],
  },
]

export function PythonCodeViewer() {
  const [activeTab, setActiveTab] = useState(0)
  const [openItem, setOpenItem] = useState<string>("")
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({})

  const currentFile = pythonFiles[activeTab]

  const handleAccordionChange = (value: string) => {
    if (value && value !== openItem) {
      setClickCounts((prev) => ({
        ...prev,
        [value]: (prev[value] || 0) + 1,
      }))
    }
    setOpenItem(value)
  }

  useEffect(() => {
    if (Object.keys(clickCounts).length > 0) {
      localStorage.setItem("experimentClickData", JSON.stringify(clickCounts))
    }
  }, [clickCounts])

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Card className="bg-card border-border">
        <div className="border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
          </div>
          <div className="flex gap-1 px-2">
            {pythonFiles.map((file, index) => (
              <button
                key={file.fileName}
                onClick={() => {
                  setActiveTab(index)
                  setOpenItem("")
                }}
                className={`px-4 py-2 font-mono text-sm transition-colors ${
                  activeTab === index
                    ? "bg-card text-foreground border-t-2 border-primary"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {file.fileName}
              </button>
            ))}
          </div>
        </div>

        {/* コードエリア */}
        <div className="p-6">
          {/* インポート文 */}
          {currentFile.imports.length > 0 && (
            <div className="mb-6">
              <PythonSyntaxHighlighter code={currentFile.imports.join("\n")} />
              <div className="mt-4" />
            </div>
          )}

          {/* クラス定義 */}
          {currentFile.classes.map((cls) => (
            <div key={cls.id} className="mb-6">
              <PythonSyntaxHighlighter code={cls.signature} />

              {/* メソッドのアコーディオン */}
              <Accordion
                type="single"
                collapsible
                value={openItem}
                onValueChange={handleAccordionChange}
                className="ml-4"
              >
                {cls.methods.map((method) => (
                  <AccordionItem key={method.id} value={method.id} className="border-border">
                    <AccordionTrigger className="hover:bg-accent/50 px-3 py-2 rounded text-left">
                      <PythonSyntaxHighlighter code={method.signature} />
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-2">
                      <div className="ml-4">
                        <PythonSyntaxHighlighter code={method.body.join("\n")} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* 関数定義 */}
          {currentFile.functions.map((func) => (
            <div key={func.id} className="mb-6">
              <Accordion type="single" collapsible value={openItem} onValueChange={handleAccordionChange}>
                <AccordionItem value={func.id} className="border-border">
                  <AccordionTrigger className="hover:bg-accent/50 px-3 py-2 rounded text-left font-mono">
                    <span className="text-muted-foreground font-mono text-sm">{func.signature}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-2">
                    <div className="ml-4">
                      <PythonSyntaxHighlighter code={func.body.join("\n")} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}

          {/* フッター */}
          {currentFile.footer.length > 0 && (
            <div className="mt-6">
              <PythonSyntaxHighlighter code={currentFile.footer.join("\n")} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
