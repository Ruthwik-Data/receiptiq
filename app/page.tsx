'use client'

import { useState, useEffect } from 'react'
import CameraCapture from '@/components/CameraCapture'
import ReceiptDisplay from '@/components/ReceiptDisplay'
import { Card } from '@/components/ui/card'

interface SavedReceipt {
  id: string
  data: string
  timestamp: number
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📸</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ReceiptIQ</h1>
                <p className="text-xs text-gray-500">AI-Powered Expense Intelligence</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('scanner')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  view === 'scanner'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📸 Scanner
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
                  view === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Dashboard
                {savedReceipts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {savedReceipts.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {view === 'scanner' ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Scan Your Receipt
              </h2>
              <p className="text-gray-600">
                Extract data in 3 seconds with AI
              </p>
            </div>

            {!result ? (
              <Card className="p-6 shadow-lg">
                {processing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Analyzing receipt...</p>
                    <p className="text-sm text-gray-500 mt-2">Using GPT-4o Vision</p>
                  </div>
                ) : (
                  <CameraCapture onCapture={handleImageCapture} />
                )}
              </Card>
            ) : (
              <>
                <Card className="p-6 mb-4 shadow-lg">
                  <ReceiptDisplay data={result} />
                </Card>
                
                <button
                  onClick={handleScanAnother}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg transition-all"
                >
                  📸 Scan Another Receipt
                </button>
              </>
            )}
          </div>
        ) : (
          <DashboardView receipts={savedReceipts} onClearAll={clearAllReceipts} />
        )}
      </div>
    </main>
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
    } catch (e) {}
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
                        className={`${colors[category] || 'bg-gray-500'} h-3 rounded-full transition-all duration-500 group-hover:opacity-90`}
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
              <p className="text-gray-700">Your highest category is <strong>{topCategory[0]}</strong> at ${topCategory[1].toFixed(2)} ({((topCategory[1]/totalSpent)*100).toFixed(0)}% of total)</p>
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
