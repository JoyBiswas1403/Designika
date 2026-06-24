import { create } from 'zustand'

interface DesignState {
    selectedImage: string | null
    selectedFile: File | null
    generatedImage: string | null
    prompt: string
    style: string
    roomType: string

    setSelectedImage: (image: string | null) => void
    setSelectedFile: (file: File | null) => void
    setGeneratedImage: (image: string | null) => void
    setPrompt: (prompt: string) => void
    setStyle: (style: string) => void
    setRoomType: (roomType: string) => void
}

export const useDesignStore = create<DesignState>((set) => ({
    selectedImage: null,
    selectedFile: null,
    generatedImage: null,
    prompt: '',
    style: 'Modern',
    roomType: 'Living Room',

    setSelectedImage: (image) => set({ selectedImage: image }),
    setSelectedFile: (file) => set({ selectedFile: file }),
    setGeneratedImage: (image) => set({ generatedImage: image }),
    setPrompt: (prompt) => set({ prompt }),
    setStyle: (style) => set({ style }),
    setRoomType: (roomType) => set({ roomType }),
}))
