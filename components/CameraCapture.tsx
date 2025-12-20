'use client'

import { useState, useRef } from 'react'

export default function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onCapture(file)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert('Could not access camera')
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' })
          onCapture(file)
          stopCamera()
        }
      }, 'image/jpeg')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  return (
    <div className="space-y-4">
      {!stream ? (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-semibold"
          >
            📁 Upload from Gallery
          </button>
          
          <button
            onClick={startCamera}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 font-semibold"
          >
            📸 Use Camera
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="flex gap-2">
            <button
              onClick={capturePhoto}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              ✓ Capture
            </button>
            <button
              onClick={stopCamera}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
            >
              ✕ Cancel
            </button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
