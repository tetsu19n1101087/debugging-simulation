import random
import string


class Member:
    def __init__(self, name):
        self.name = name
        self.member_id = Member._random_id()
        self.borrowed_books = []

    @staticmethod
    def _random_id(length=10):
        # ランダムなIDの生成
        chars = string.ascii_letters + string.digits
        return "".join(random.choice(chars) for _ in range(length))

    def __str__(self):
        return f"Member: {self.name} (ID: {self.member_id})"
