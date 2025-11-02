"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function EndPage() {
  const [clickData, setClickData] = useState<Record<string, number>>({})
  const [tabClickData, setTabClickData] = useState<Record<string, number>>({})

  useEffect(() => {
    const data = localStorage.getItem("experimentClickData")
    if (data) {
      setClickData(JSON.parse(data))
    }

    const tabData = localStorage.getItem("experimentTabClickData")
    if (tabData) {
      setTabClickData(JSON.parse(tabData))
    }
  }, [])

  const getSectionName = (id: string) => {
    const parts = id.split("-")
    if (parts.length >= 3) {
      const fileName = parts[0]
      const type = parts[1]
      const name = parts.slice(2).join("-")
      return `${fileName}.py - ${type === "method" ? "メソッド" : type === "function" ? "関数" : "クラス"}: ${name}`
    }
    return id
  }

  const handleReturnToTop = () => {
    localStorage.removeItem("experimentClickData")
    localStorage.removeItem("experimentTabClickData")
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-foreground">実験終了</h1>
        <p className="text-lg text-muted-foreground">ご協力ありがとうございました。</p>

        {Object.keys(tabClickData).length > 0 && (
          <Card className="p-6 text-left">
            <h2 className="text-2xl font-semibold mb-4">ファイルごとの開いた回数</h2>
            <div className="space-y-2">
              {Object.entries(tabClickData)
                .sort(([, a], [, b]) => b - a)
                .map(([fileName, count]) => (
                  <div
                    key={fileName}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-muted-foreground font-mono">{fileName}</span>
                    <span className="text-lg font-semibold text-foreground">{count}回</span>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {Object.keys(clickData).length > 0 && (
          <Card className="p-6 text-left">
            <h2 className="text-2xl font-semibold mb-4">セクションごとの開いた回数</h2>
            <div className="space-y-2">
              {Object.entries(clickData)
                .sort(([, a], [, b]) => b - a)
                .map(([id, count]) => (
                  <div key={id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground font-mono">{getSectionName(id)}</span>
                    <span className="text-lg font-semibold text-foreground">{count}回</span>
                  </div>
                ))}
            </div>
          </Card>
        )}

        <Link href="/">
          <Button size="lg" className="text-lg px-8 py-6" onClick={handleReturnToTop}>
            トップページに戻る
          </Button>
        </Link>
      </div>
    </main>
  )
}
