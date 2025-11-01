import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-foreground">デバッグ実験へようこそ</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          この実験では、Pythonコードを読んでいただき、デバッグ時の行動を調査します。
        </p>
        <Link href="/test">
          <Button size="lg" className="text-lg px-8 py-6">
            実験を開始する
          </Button>
        </Link>
      </div>
    </main>
  )
}
