import { PythonCodeViewer } from "@/components/python-code-viewer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  return (
    <main className="min-h-screen bg-background">
      <PythonCodeViewer />
      <div className="container mx-auto max-w-5xl px-6 pb-12">
        <div className="flex justify-center">
          <Link href="/end">
            <Button size="lg" className="text-lg px-8 py-6">
              実験を終了する
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
