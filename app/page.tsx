'use client'

import { useState, useEffect, useRef } from 'react'
import CameraCapture from '@/components/CameraCapture'
import ReceiptDisplay from '@/components/ReceiptDisplay'
import { Card } from '@/components/ui/card'

interface SavedReceipt {
  id: string
  data: string
  timestamp: number
}

const BUDGET_CATEGORIES = ['Food', 'Travel', 'Groceries', 'Shopping', 'Bills', 'Other'] as const
type BudgetCategory = typeof BUDGET_CATEGORIES[number]

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'taco', 'sushi', 'bar', 'grill', 'kitchen', 'diner', 'bistro', 'food', 'eat'],
  'Groceries': ['market', 'grocery', 'supermarket', 'walmart', 'target', 'costco', 'whole foods', 'trader'],
  'Travel': ['gas', 'fuel', 'shell', 'chevron', 'exxon', 'bp', 'uber', 'lyft', 'parking', 'hotel', 'airline'],
  'Shopping': ['store', 'shop', 'mall', 'retail', 'amazon', 'clothing', 'apparel'],
  'Bills': ['pharmacy', 'cvs', 'walgreens', 'hospital', 'clinic', 'medical', 'dental', 'doctor', 'electric', 'water', 'internet'],
}

function inferCategory(merchant: string): string {
  const lower = merchant.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return category
  }
  return 'Other'
}

function getBudgetTag(merchant: string, date: string, total: number): BudgetCategory | null {
  try {
    const key = `budget_${merchant}_${date}_${total}`
    const stored = localStorage.getItem(key)
    return stored as BudgetCategory | null
  } catch {
    return null
  }
}

function setBudgetTag(merchant: string, date: string, total: number, tag: BudgetCategory) {
  try {
    const key = `budget_${merchant}_${date}_${total}`
    localStorage.setItem(key, tag)
  } catch { }
}

// Demo receipts seeded on first visit so the dashboard shows a realistic,
// multi-category spending picture instead of an empty/one-item state.
function buildDemoReceipts(): SavedReceipt[] {
  const day = 86400000
  const now = Date.now()
  const seed = [
    { merchant: 'Whole Foods Market', subtotal: 21.46, tax: 1.93, tip: 0, total: 23.39, daysAgo: 2, items: [{ name: 'Organic Bananas', price: 3.49 }, { name: 'Almond Milk', price: 4.99 }] },
    { merchant: 'Blue Bottle Coffee', subtotal: 8.03, tax: 0.72, tip: 1.50, total: 10.25, daysAgo: 3, items: [{ name: 'Latte', price: 5.25 }, { name: 'Croissant', price: 2.78 }] },
    { merchant: 'Shell Gas Station', subtotal: 52.10, tax: 0, tip: 0, total: 52.10, daysAgo: 5, items: [{ name: 'Unleaded Fuel', price: 52.10 }] },
    { merchant: 'Chipotle Mexican Grill', subtotal: 11.79, tax: 1.06, tip: 0, total: 12.85, daysAgo: 6, items: [{ name: 'Burrito Bowl', price: 11.79 }] },
    { merchant: 'CVS Pharmacy', subtotal: 13.03, tax: 1.17, tip: 0, total: 14.20, daysAgo: 9, items: [{ name: 'Vitamins', price: 13.03 }] },
    { merchant: 'Amazon.com', subtotal: 32.10, tax: 2.89, tip: 0, total: 34.99, daysAgo: 12, items: [{ name: 'USB-C Cable', price: 12.99 }, { name: 'Notebook', price: 19.11 }] },
  ]
  return seed.map((s, i) => {
    const timestamp = now - s.daysAgo * day
    const date = new Date(timestamp).toLocaleDateString('en-US')
    return {
      id: `demo-${i}-${timestamp}`,
      data: JSON.stringify({
        merchant: s.merchant,
        date,
        subtotal: s.subtotal,
        tax: s.tax,
        tip: s.tip,
        total: s.total,
        items: s.items,
      }),
      timestamp,
    }
  })
}

export default function Home() {
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [view, setView] = useState<'scanner' | 'dashboard'>('scanner')
  const [savedReceipts, setSavedReceipts] = useState<SavedReceipt[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('receiptiq_receipts')
    if (saved) {
      setSavedReceipts(JSON.parse(saved))
    } else {
      const demo = buildDemoReceipts()
      setSavedReceipts(demo)
      localStorage.setItem('receiptiq_receipts', JSON.stringify(demo))
    }
  }, [])

  const saveReceipt = (data: string) => {
    const newReceipt: SavedReceipt = {
      id: Date.now().toString(),
      data,
      timestamp: Date.now()
    }
    const updated = [...savedReceipts, newReceipt]
    setSavedReceipts(updated)
    localStorage.setItem('receiptiq_receipts', JSON.stringify(updated))
  }

  const clearAllReceipts = () => {
    if (confirm('Are you sure you want to delete all receipts?')) {
      setSavedReceipts([])
      localStorage.removeItem('receiptiq_receipts')
    }
  }

  const handleImageCapture = async (image: File) => {
    setProcessing(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', image)

      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        saveReceipt(data.data)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Failed to scan receipt')
    }

    setProcessing(false)
  }

  const handleScanAnother = () => {
    setResult(null)
  }

  return (
    <main className="min-h-screen">
      {/* Clean Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                💼
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ReceiptIQ — Expense Intelligence</h1>
                <p className="text-xs text-gray-500">Upload a receipt. Get clean expense data + instant insights.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('scanner')}
                className={`px-5 py-2 rounded-xl font-medium transition-all ${view === 'scanner'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Scanner
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-5 py-2 rounded-xl font-medium transition-all relative ${view === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Dashboard
                {savedReceipts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {savedReceipts.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-6 py-10">
        {view === 'scanner' ? (
          <ScannerView
            processing={processing}
            result={result}
            onCapture={handleImageCapture}
            onScanAnother={handleScanAnother}
          />
        ) : (
          <DashboardView receipts={savedReceipts} onClearAll={clearAllReceipts} />
        )}
      </div>
    </main>
  )
}

function ScannerView({
  processing,
  result,
  onCapture,
  onScanAnother
}: {
  processing: boolean
  result: string | null
  onCapture: (file: File) => void
  onScanAnother: () => void
}) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')
  const [pasteText, setPasteText] = useState('')
  const [showJson, setShowJson] = useState(false)
  const [budgetTag, setBudgetTagState] = useState<BudgetCategory | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onCapture(file)
  }

  const handlePasteExtract = () => {
    if (!pasteText.trim()) return
    const blob = new Blob([pasteText], { type: 'text/plain' })
    const file = new File([blob], 'pasted-receipt.txt', { type: 'text/plain' })
    onCapture(file)
  }

  const handleSampleReceipt = () => {
    const sampleText = `WHOLE FOODS MARKET
123 Main St, San Francisco, CA
Date: ${new Date().toLocaleDateString()}

Organic Bananas     $3.99
Almond Milk        $4.49
Whole Grain Bread  $5.99
Avocados (3)       $6.99

Subtotal:         $21.46
Tax:               $1.93
Total:            $23.39

Thank you for shopping!`
    const blob = new Blob([sampleText], { type: 'text/plain' })
    const file = new File([blob], 'sample-receipt.txt', { type: 'text/plain' })
    onCapture(file)
  }

  let parsedResult: any = null
  if (result) {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0])
        // Load budget tag
        if (parsedResult.merchant && parsedResult.date && parsedResult.total) {
          const tag = getBudgetTag(parsedResult.merchant, parsedResult.date, parsedResult.total)
          if (tag && tag !== budgetTag) setBudgetTagState(tag)
        }
      }
    } catch (e) { }
  }

  // Compute insights
  const insights = parsedResult ? {
    taxRate: parsedResult.tax && parsedResult.total ?
      ((parsedResult.tax / (parsedResult.total - parsedResult.tax)) * 100).toFixed(2) : null,
    netSpend: parsedResult.total && parsedResult.tax ?
      (parsedResult.total - parsedResult.tax).toFixed(2) : parsedResult.subtotal?.toFixed(2) || null,
    category: parsedResult.merchant ? inferCategory(parsedResult.merchant) : 'Other',
    dataQuality: (() => {
      let score = 0
      if (parsedResult.merchant) score++
      if (parsedResult.date) score++
      if (parsedResult.total) score++
      if (parsedResult.tax !== undefined) score++
      if (score >= 4) return 'High'
      if (score >= 2) return 'Medium'
      return 'Low'
    })()
  } : null

  const handleBudgetTagChange = (tag: BudgetCategory) => {
    setBudgetTagState(tag)
    if (parsedResult?.merchant && parsedResult?.date && parsedResult?.total) {
      setBudgetTag(parsedResult.merchant, parsedResult.date, parsedResult.total, tag)
    }
  }

  const downloadJSON = () => {
    if (!parsedResult) return
    const dataStr = JSON.stringify(parsedResult, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${parsedResult.merchant || 'export'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = () => {
    if (!parsedResult) return
    const headers = ['merchant', 'date', 'total', 'tax', 'subtotal', 'category', 'tag']
    const values = [
      parsedResult.merchant || '',
      parsedResult.date || '',
      parsedResult.total || '',
      parsedResult.tax || '',
      parsedResult.subtotal || '',
      insights?.category || '',
      budgetTag || ''
    ]
    let csv = headers.join(',') + '\n' + values.join(',')

    // Add line items if present
    if (parsedResult.items && parsedResult.items.length > 0) {
      csv += '\n\nLine Items\nname,price\n'
      csv += parsedResult.items.map((item: any) => `${item.name},${item.price}`).join('\n')
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${parsedResult.merchant || 'export'}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setPasteText('')
    setBudgetTagState(null)
    onScanAnother()
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Left Column: Input */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Extract Receipt Data</h2>
          <p className="text-gray-600">Upload or paste receipt information</p>
        </div>

        <div className="card-premium">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              📁 Upload
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${activeTab === 'paste'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              📝 Paste
            </button>
          </div>

          {/* Tab Content */}
          {processing ? (
            <div className="text-center py-16 fade-in">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-700 font-medium mb-1">Analyzing receipt...</p>
              <p className="text-sm text-gray-500">Using GPT-4o Vision</p>
            </div>
          ) : (
            <>
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                  >
                    <div className="text-5xl mb-4">📤</div>
                    <p className="text-gray-700 font-medium mb-1">Click to upload receipt</p>
                    <p className="text-sm text-gray-500">PNG, JPG, or PDF</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {activeTab === 'paste' && (
                <div className="space-y-4">
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste receipt text here..."
                    className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={handlePasteExtract}
                    disabled={!pasteText.trim()}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Extract Data
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {!processing && !result && (
          <button
            onClick={handleSampleReceipt}
            className="btn-secondary w-full"
          >
            ✨ Try sample receipt
          </button>
        )}
      </div>

      {/* Right Column: Results */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Extracted Data</h2>
          <p className="text-gray-600">Structured output from your receipt</p>
        </div>

        {!result ? (
          <div className="card-premium text-center py-20 fade-in">
            <div className="text-6xl mb-4 opacity-30">📋</div>
            <p className="text-gray-500">Upload a receipt to preview structured output</p>
          </div>
        ) : parsedResult ? (
          <div className="space-y-4 slide-up">
            {/* Summary Tiles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card-premium bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
                <p className="text-xs font-medium text-indigo-600 mb-1">TOTAL</p>
                <p className="text-3xl font-bold text-indigo-900">${parsedResult.total?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="card-premium bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
                <p className="text-xs font-medium text-emerald-600 mb-1">TAX</p>
                <p className="text-3xl font-bold text-emerald-900">${parsedResult.tax?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="card-premium bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                <p className="text-xs font-medium text-blue-600 mb-1">MERCHANT</p>
                <p className="text-sm font-bold text-blue-900 truncate">{parsedResult.merchant || 'N/A'}</p>
              </div>
              <div className="card-premium bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                <p className="text-xs font-medium text-purple-600 mb-1">DATE</p>
                <p className="text-sm font-bold text-purple-900">{parsedResult.date || 'N/A'}</p>
              </div>
            </div>

            {/* Data Quality & Budget Tag */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Data Quality</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${insights?.dataQuality === 'High' ? 'bg-emerald-100 text-emerald-700' :
                  insights?.dataQuality === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                  {insights?.dataQuality || 'Low'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tag this expense</span>
                <select
                  value={budgetTag || ''}
                  onChange={(e) => handleBudgetTagChange(e.target.value as BudgetCategory)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select tag...</option>
                  {BUDGET_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Insights Panel */}
            <div className="card-premium bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">💡</span> Insights
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {insights?.taxRate && (
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-gray-500 mb-1">Tax Rate</p>
                    <p className="text-lg font-bold text-gray-900">{insights.taxRate}%</p>
                  </div>
                )}
                {insights?.netSpend && (
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-gray-500 mb-1">Net Spend</p>
                    <p className="text-lg font-bold text-gray-900">${insights.netSpend}</p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm font-bold text-gray-900">{insights?.category}</p>
                </div>
                {budgetTag && (
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-gray-500 mb-1">Budget Tag</p>
                    <p className="text-sm font-bold text-gray-900">{budgetTag}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Export Tools */}
            <div className="flex gap-3">
              <button
                onClick={downloadJSON}
                className="flex-1 btn-secondary text-sm"
              >
                📥 Download JSON
              </button>
              <button
                onClick={downloadCSV}
                className="flex-1 btn-secondary text-sm"
              >
                📊 Download CSV
              </button>
            </div>

            {/* Raw JSON */}
            <div className="card-premium">
              <button
                onClick={() => setShowJson(!showJson)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-gray-700">Raw JSON</span>
                <span className="text-gray-400">{showJson ? '▼' : '▶'}</span>
              </button>
              {showJson && (
                <div className="mt-4 relative">
                  <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto border border-gray-200">
                    {JSON.stringify(parsedResult, null, 2)}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(parsedResult, null, 2))}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all"
                  >
                    📋 Copy
                  </button>
                </div>
              )}
            </div>

            {/* Scan Another */}
            <button
              onClick={handleReset}
              className="btn-primary w-full"
            >
              📸 Scan Another Receipt
            </button>
          </div>
        ) : (
          <div className="card-premium bg-rose-50 border-rose-200 fade-in">
            <p className="text-rose-800 font-medium mb-2">⚠ Error parsing receipt</p>
            <p className="text-sm text-rose-600">Could not extract structured data from the response.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DashboardView({ receipts, onClearAll }: { receipts: SavedReceipt[], onClearAll: () => void }) {
  if (receipts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-16 text-center shadow-lg">
          <div className="text-8xl mb-6">📊</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No Data Yet</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Scan your first receipt to unlock powerful spending insights!
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-gray-900">Track Spending</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-gray-900">Set Budgets</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">💡</div>
              <div className="font-semibold text-gray-900">Get Insights</div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const parsedReceipts = receipts.map(r => {
    try {
      const jsonMatch = r.data.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return { ...parsed, timestamp: r.timestamp }
      }
    } catch (e) { }
    return null
  }).filter(Boolean)

  const totalSpent = parsedReceipts.reduce((sum, r) => sum + (r.total || 0), 0)
  const avgTransaction = totalSpent / parsedReceipts.length
  const totalTax = parsedReceipts.reduce((sum, r) => sum + (r.tax || 0), 0)

  const CATEGORY_KEYWORDS = {
    '🍕 Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'taco', 'sushi', 'bar', 'grill', 'kitchen', 'diner', 'bistro', 'food', 'eat', 'drnk', 'qwench'],
    '🛒 Groceries': ['market', 'grocery', 'supermarket', 'walmart', 'target', 'costco', 'whole foods', 'trader'],
    '⛽ Gas & Transport': ['gas', 'fuel', 'shell', 'chevron', 'exxon', 'bp', 'uber', 'lyft', 'parking'],
    '🏥 Healthcare': ['pharmacy', 'cvs', 'walgreens', 'hospital', 'clinic', 'medical', 'dental', 'doctor'],
    '🎮 Entertainment': ['movie', 'theater', 'game', 'netflix', 'spotify', 'gym', 'fitness'],
    '📦 Other': []
  }

  const categoryTotals: Record<string, number> = {}
  parsedReceipts.forEach(r => {
    const merchant = r.merchant?.toLowerCase() || ''
    let category = '📦 Other'

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => merchant.includes(k))) {
        category = cat
        break
      }
    }

    categoryTotals[category] = (categoryTotals[category] || 0) + r.total
  })

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  const sortedReceipts = [...parsedReceipts].sort((a, b) => b.timestamp - a.timestamp)

  const exportToCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Subtotal', 'Tax', 'Tip', 'Total']
    const rows = parsedReceipts.map(r => {
      const merchant = r.merchant?.toLowerCase() || ''
      let category = '📦 Other'
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => merchant.includes(k))) {
          category = cat
          break
        }
      }
      return [
        r.date || '',
        r.merchant || '',
        category,
        r.subtotal || 0,
        r.tax || 0,
        r.tip || 0,
        r.total || 0
      ]
    })

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receiptiq-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Spending Overview</h2>
          <p className="text-gray-600 mt-1">{receipts.length} receipts scanned • Last 30 days</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition-all flex items-center gap-2"
          >
            📥 Export CSV
          </button>
          <button
            onClick={onClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-md transition-all"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Total Spent</p>
          <p className="text-4xl font-bold mb-2">${totalSpent.toFixed(2)}</p>
          <p className="text-xs opacity-75">Across {receipts.length} transactions</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Avg Transaction</p>
          <p className="text-4xl font-bold mb-2">${avgTransaction.toFixed(2)}</p>
          <p className="text-xs opacity-75">Per receipt</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Total Tax Paid</p>
          <p className="text-4xl font-bold mb-2">${totalTax.toFixed(2)}</p>
          <p className="text-xs opacity-75">Deductible expenses</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
          <p className="text-sm opacity-90 mb-1">Top Category</p>
          <p className="text-2xl font-bold mb-2">{topCategory[0]}</p>
          <p className="text-xs opacity-75">${topCategory[1].toFixed(2)} spent</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown - 2 columns */}
        <Card className="p-6 lg:col-span-2 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Spending by Category</h3>
            <div className="text-sm text-gray-500">Last 30 days</div>
          </div>
          <div className="space-y-4">
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const percentage = (amount / totalSpent) * 100
                const colors = {
                  '🍕 Food & Dining': 'bg-orange-500',
                  '🛒 Groceries': 'bg-green-500',
                  '⛽ Gas & Transport': 'bg-blue-500',
                  '🏥 Healthcare': 'bg-red-500',
                  '🎮 Entertainment': 'bg-purple-500',
                  '📦 Other': 'bg-gray-500'
                }
                return (
                  <div key={category} className="group hover:bg-gray-50 p-3 rounded-lg transition-all">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-900">{category}</span>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">${amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${(colors as any)[category] || 'bg-gray-500'} h-3 rounded-full transition-all duration-500 group-hover:opacity-90`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>

        {/* AI Insights - 1 column */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span> AI Insights
          </h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-semibold text-indigo-600 mb-1">Top Spending</div>
              <p className="text-gray-700">Your highest category is <strong>{topCategory[0]}</strong> at ${topCategory[1].toFixed(2)} ({((topCategory[1] / totalSpent) * 100).toFixed(0)}% of total)</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-semibold text-green-600 mb-1">Tax Tracking</div>
              <p className="text-gray-700">You've paid <strong>${totalTax.toFixed(2)}</strong> in sales tax. Keep these receipts for deductions!</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-semibold text-blue-600 mb-1">Spending Pattern</div>
              <p className="text-gray-700">Your average transaction is <strong>${avgTransaction.toFixed(2)}</strong> across {receipts.length} receipts</p>
            </div>

            {categoryTotals['🍕 Food & Dining'] && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm font-semibold text-orange-600 mb-1">Dining Alert</div>
                <p className="text-gray-700">You've spent <strong>${categoryTotals['🍕 Food & Dining'].toFixed(2)}</strong> on dining out this period</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Receipts */}
      <Card className="p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Receipts</h3>
        <div className="space-y-3">
          {sortedReceipts.slice(0, 5).map((receipt, idx) => {
            const merchant = receipt.merchant?.toLowerCase() || ''
            let category = '📦 Other'
            for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
              if (keywords.some(k => merchant.includes(k))) {
                category = cat
                break
              }
            }

            return (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{category.split(' ')[0]}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{receipt.merchant}</div>
                    <div className="text-sm text-gray-500">{receipt.date} • {category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">${receipt.total.toFixed(2)}</div>
                  {receipt.tax > 0 && (
                    <div className="text-xs text-gray-500">Tax: ${receipt.tax.toFixed(2)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
