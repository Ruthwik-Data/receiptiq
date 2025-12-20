'use client'

const CATEGORY_KEYWORDS = {
  '🍕 Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'taco', 'sushi', 'bar', 'grill', 'kitchen', 'diner', 'bistro', 'food', 'eat'],
  '🛒 Groceries': ['market', 'grocery', 'supermarket', 'walmart', 'target', 'costco', 'whole foods', 'trader'],
  '⛽ Gas & Transport': ['gas', 'fuel', 'shell', 'chevron', 'exxon', 'bp', 'uber', 'lyft', 'parking'],
  '🏥 Healthcare': ['pharmacy', 'cvs', 'walgreens', 'hospital', 'clinic', 'medical', 'dental', 'doctor'],
  '🎮 Entertainment': ['movie', 'theater', 'game', 'netflix', 'spotify', 'gym', 'fitness'],
  '🏠 Home & Utilities': ['home depot', 'lowes', 'ikea', 'furniture', 'electric', 'water', 'internet'],
  '👕 Shopping': ['store', 'shop', 'mall', 'retail', 'amazon', 'clothing', 'apparel'],
}

function categorizeReceipt(merchant: string): string {
  const lowerMerchant = merchant.toLowerCase()
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerMerchant.includes(keyword))) {
      return category
    }
  }
  
  return '📦 Other'
}

interface ReceiptData {
  merchant: string
  date: string
  subtotal?: number
  tax?: number
  tip?: number
  total: number
  items?: Array<{ name: string; price: number }>
}

export default function ReceiptDisplay({ data }: { data: string }) {
  let receiptData: ReceiptData
  
  try {
    const jsonMatch = data.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      receiptData = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('No JSON found')
    }
  } catch (e) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Could not parse receipt data</p>
        <pre className="text-xs mt-2 overflow-x-auto">{data}</pre>
      </div>
    )
  }

  const category = categorizeReceipt(receiptData.merchant)

  return (
    <div className="space-y-4">
      {/* Category Badge */}
      <div className="inline-block bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-semibold">
        {category}
      </div>

      {/* Merchant & Date */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{receiptData.merchant}</h2>
        <p className="text-gray-600">{receiptData.date}</p>
      </div>

      {/* Total Amount - Big Display */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg">
        <p className="text-sm opacity-90">Total Amount</p>
        <p className="text-4xl font-bold">${receiptData.total.toFixed(2)}</p>
      </div>

      {/* Tax & Tip Breakdown */}
      {(receiptData.subtotal || receiptData.tax || receiptData.tip) && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">💰 Breakdown</h3>
          
          {receiptData.subtotal !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">${receiptData.subtotal.toFixed(2)}</span>
            </div>
          )}
          
          {receiptData.tax !== undefined && receiptData.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold text-orange-600">${receiptData.tax.toFixed(2)}</span>
            </div>
          )}
          
          {receiptData.tip !== undefined && receiptData.tip > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tip</span>
              <span className="font-semibold text-green-600">${receiptData.tip.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">${receiptData.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Items */}
      {receiptData.items && receiptData.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">📋 Items</h3>
          <div className="space-y-2">
            {receiptData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax Deduction Tip (for business users) */}
      {receiptData.tax !== undefined && receiptData.tax > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-blue-800">
            💡 <span className="font-semibold">Tax Tip:</span> Save this receipt for tax deductions! Tax paid: ${receiptData.tax.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  )
}
